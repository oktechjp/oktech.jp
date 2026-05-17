import { existsSync } from "fs";
import * as fs from "fs/promises";
import * as path from "path";

import matter from "gray-matter";
import { parse, stringify } from "yaml";

import { parseRepeatKey } from "../../../src/utils/recurringDates";

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

type RepeatEntry = Record<string, unknown> & { time?: string };

type ParentFrontmatter = {
  dateTime: string;
  cover?: string;
  devOnly?: boolean;
  links?: Record<string, string>;
  repeat?: Record<string, RepeatEntry | null>;
  [key: string]: unknown;
};

export type MaterializeStats = {
  parentsScanned: number;
  skippedDevOnly: number;
  created: number;
};

export async function materializeRecurringEvents(eventsDir: string): Promise<MaterializeStats> {
  const stats: MaterializeStats = { parentsScanned: 0, skippedDevOnly: 0, created: 0 };

  const entries = await fs.readdir(eventsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const parentSlug = entry.name;
    const parentPath = path.join(eventsDir, parentSlug, "event.md");
    if (!existsSync(parentPath)) continue;

    const raw = await fs.readFile(parentPath, "utf-8");
    const parsed = matter(raw, { engines: { yaml: yamlEngine } });
    const frontmatter = parsed.data as ParentFrontmatter;
    if (!frontmatter.repeat) continue;
    stats.parentsScanned++;

    if (frontmatter.devOnly === true) {
      stats.skippedDevOnly++;
      continue;
    }

    const now = new Date();
    const remaining: Record<string, RepeatEntry | null> = {};
    let drained = 0;

    for (const [rawKey, value] of Object.entries(frontmatter.repeat)) {
      const override = (value ?? {}) as RepeatEntry;
      const { date, slugPrefix } = parseRepeatKey(
        rawKey,
        frontmatter.dateTime,
        override.time,
        parentPath,
      );

      if (date.getTime() > now.getTime()) {
        remaining[rawKey] = value;
        continue;
      }

      const childSlug = `${slugPrefix}-${parentSlug}`;
      const childDir = path.join(eventsDir, childSlug);
      const childPath = path.join(childDir, "event.md");
      if (existsSync(childPath)) continue;

      const { time, ...frontmatterOverride } = override;
      const time24 = time ?? extractTimeOfDay(frontmatter.dateTime, parentPath);
      const occurrenceYMD = formatYMDTokyo(date);
      const childFrontmatter: Record<string, unknown> = {
        ...frontmatter,
        ...frontmatterOverride,
      };
      const overrideLinks = frontmatterOverride.links as Record<string, string> | undefined;
      if (frontmatter.links || overrideLinks) {
        childFrontmatter.links = { ...frontmatter.links, ...overrideLinks };
      }
      delete childFrontmatter.repeat;
      childFrontmatter.recurredFrom = parentSlug;
      childFrontmatter.dateTime = `${occurrenceYMD} ${time24}`;
      if (typeof childFrontmatter.cover === "string" && childFrontmatter.cover.startsWith("./")) {
        childFrontmatter.cover = `../${parentSlug}/${childFrontmatter.cover.slice(2)}`;
      }

      const newContent = matter.stringify(parsed.content, childFrontmatter, {
        engines: { yaml: yamlEngine },
      });
      await fs.mkdir(childDir, { recursive: true });
      await fs.writeFile(childPath, newContent);
      logger.success(`Materialized → ${childSlug}`);
      stats.created++;
      drained++;
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

function extractTimeOfDay(dateTime: string, filePath: string): string {
  const match = /^\d{4}-\d{2}-\d{2} (\d{2}:\d{2})$/.exec(dateTime);
  if (!match) throw new Error(`Cannot extract time from dateTime in ${filePath}: ${dateTime}`);
  return match[1];
}

function formatYMDTokyo(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
