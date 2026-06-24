import * as fs from "fs/promises";
import matter from "gray-matter";
import * as path from "path";

import {
  type RepeatOverride,
  expandRepeatEntries,
  mergeRepeatOverride,
  toYMD,
} from "../../../src/utils/recurringDates";
import { logger } from "./logger";
import { iterRepeatParents } from "./recurringShared";
import { yamlEngine } from "./yamlEngine";

export type MaterializeStats = {
  parentsScanned: number;
  skippedDevOnly: number;
  created: number;
};

export async function materializeRecurringEvents(eventsDir: string): Promise<MaterializeStats> {
  const stats: MaterializeStats = { parentsScanned: 0, skippedDevOnly: 0, created: 0 };
  const now = new Date();

  for await (const { parentSlug, parentPath, parsed, frontmatter } of iterRepeatParents(
    eventsDir,
  )) {
    stats.parentsScanned++;
    if (frontmatter.devOnly === true) {
      stats.skippedDevOnly++;
      continue;
    }

    const remaining: Record<string, RepeatOverride | null> = {};
    let drained = 0;

    const repeat = frontmatter.repeat;
    const expanded = expandRepeatEntries(repeat, frontmatter.dateTime, parentPath);

    for (const { date, slugPrefix, rawKey, time, override } of expanded) {
      if (date.getTime() > now.getTime()) {
        remaining[rawKey] = repeat[rawKey] ?? null;
        continue;
      }

      const childSlug = `${slugPrefix}-${parentSlug}`;
      const childDir = path.join(eventsDir, childSlug);
      const childPath = path.join(childDir, "event.md");

      const childFrontmatter: Record<string, unknown> = mergeRepeatOverride(frontmatter, override);
      delete childFrontmatter.repeat;
      childFrontmatter.recurredFrom = parentSlug;
      childFrontmatter.dateTime = `${toYMD(date)} ${time}`;
      if (typeof childFrontmatter.cover === "string" && childFrontmatter.cover.startsWith("./")) {
        childFrontmatter.cover = `../${parentSlug}/${childFrontmatter.cover.slice(2)}`;
      }

      const newContent = matter.stringify(parsed.content, childFrontmatter, {
        engines: { yaml: yamlEngine },
      });
      await fs.mkdir(childDir, { recursive: true });
      try {
        await fs.writeFile(childPath, newContent, { flag: "wx" });
        logger.success(`Materialized → ${childSlug}`);
        stats.created++;
        drained++;
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
      }
    }

    if (drained > 0) {
      const updatedFrontmatter: Record<string, unknown> = { ...frontmatter };
      if (Object.keys(remaining).length === 0) {
        delete updatedFrontmatter.repeat;
      } else {
        updatedFrontmatter.repeat = remaining;
      }
      const updatedContent = matter.stringify(parsed.content, updatedFrontmatter, {
        engines: { yaml: yamlEngine },
      });
      await fs.writeFile(parentPath, updatedContent);
      logger.info(`Drained ${drained} past entries from ${parentSlug}/event.md`);
    }
  }

  return stats;
}

export type NextRecurringOccurrence = {
  slug: string;
  title: string;
  dateTime: Date;
  duration?: number;
};

export async function listNextRecurringOccurrences(
  eventsDir: string,
): Promise<NextRecurringOccurrence[]> {
  const now = new Date();
  const result: NextRecurringOccurrence[] = [];
  for await (const { parentSlug, parentPath, frontmatter } of iterRepeatParents(eventsDir)) {
    if (frontmatter.devOnly === true) continue;
    const expanded = expandRepeatEntries(frontmatter.repeat, frontmatter.dateTime, parentPath);
    const next = expanded.find(({ date }) => date.getTime() > now.getTime());
    if (!next) continue;
    const merged = mergeRepeatOverride(frontmatter, next.override);
    result.push({
      slug: `${next.slugPrefix}-${parentSlug}`,
      title: merged.title ?? parentSlug,
      dateTime: next.date,
      duration: merged.duration,
    });
  }
  return result;
}
