import * as fs from "fs/promises";
import * as path from "path";

import matter from "gray-matter";
import { parse, stringify } from "yaml";

import {
  type RepeatOverride,
  extractTimeOfDay,
  mergeRepeatOverride,
  parseRepeatKey,
  toYMD,
} from "../../../src/utils/recurringDates";

import { logger } from "./logger";

const yamlEngine = {
  parse: (str: string) => parse(str),
  stringify: (obj: unknown) =>
    stringify(obj, {
      defaultStringType: "PLAIN",
      defaultKeyType: "PLAIN",
      lineWidth: 0,
      doubleQuotedAsJSON: true,
      singleQuote: false,
    }),
};

type ParentFrontmatter = {
  dateTime: string;
  cover?: string;
  devOnly?: boolean;
  links?: Record<string, string>;
  repeat?: Record<string, RepeatOverride | null>;
  [key: string]: unknown;
};

export type MaterializeStats = {
  parentsScanned: number;
  skippedDevOnly: number;
  created: number;
};

export async function materializeRecurringEvents(eventsDir: string): Promise<MaterializeStats> {
  const stats: MaterializeStats = { parentsScanned: 0, skippedDevOnly: 0, created: 0 };
  const now = new Date();

  const entries = await fs.readdir(eventsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const parentSlug = entry.name;
    const parentPath = path.join(eventsDir, parentSlug, "event.md");

    let raw: string;
    try {
      raw = await fs.readFile(parentPath, "utf-8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw err;
    }
    const parsed = matter(raw, { engines: { yaml: yamlEngine } });
    const frontmatter = parsed.data as ParentFrontmatter;
    if (!frontmatter.repeat) continue;
    stats.parentsScanned++;

    if (frontmatter.devOnly === true) {
      stats.skippedDevOnly++;
      continue;
    }

    const remaining: Record<string, RepeatOverride | null> = {};
    let drained = 0;

    for (const [rawKey, value] of Object.entries(frontmatter.repeat)) {
      const override = value ?? {};
      const time = override.time ?? extractTimeOfDay(frontmatter.dateTime, parentPath);
      const { date, slugPrefix } = parseRepeatKey(rawKey, time, parentPath);

      if (date.getTime() > now.getTime()) {
        remaining[rawKey] = value;
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
