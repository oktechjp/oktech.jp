import { existsSync } from "fs";
import * as fs from "fs/promises";
import * as path from "path";

import matter from "gray-matter";
import { parse, stringify } from "yaml";

import {
  type RecurringFrontmatter,
  getRecurringInstanceDates,
  parseEventDateTime,
  parseRecurringConfig,
  toSlugDate,
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
  recurring?: RecurringFrontmatter;
  upcoming?: Record<string, Record<string, unknown>>;
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
    if (!frontmatter.recurring) continue;
    stats.parentsScanned++;

    if (frontmatter.devOnly === true) {
      stats.skippedDevOnly++;
      continue;
    }

    const startDateTime = parseEventDateTime(frontmatter.dateTime, parentPath);
    const config = parseRecurringConfig(frontmatter.recurring, parentPath);
    const { past } = getRecurringInstanceDates(config, startDateTime);
    const parentTime = frontmatter.dateTime.split(" ")[1];
    const cancelledSet = new Set(config.cancelled ?? []);
    const upcoming = normalizeUpcoming(frontmatter.upcoming, parentPath);

    for (const occurrence of past) {
      const childSlug = `${toSlugDate(occurrence)}-${parentSlug}`;
      const childDir = path.join(eventsDir, childSlug);
      const childPath = path.join(childDir, "event.md");
      if (existsSync(childPath)) continue;

      const occurrenceYMD = formatYMDTokyo(occurrence);
      const override = upcoming[toSlugDate(occurrence)] ?? {};
      const childFrontmatter: Record<string, unknown> = {
        ...frontmatter,
        ...override,
      };
      const parentLinks = frontmatter.links as Record<string, string> | undefined;
      const overrideLinks = override.links as Record<string, string> | undefined;
      if (parentLinks || overrideLinks) {
        childFrontmatter.links = { ...parentLinks, ...overrideLinks };
      }
      delete childFrontmatter.recurring;
      delete childFrontmatter.upcoming;
      childFrontmatter.recurredFrom = parentSlug;
      childFrontmatter.dateTime = `${occurrenceYMD} ${parentTime}`;
      if (cancelledSet.has(occurrenceYMD)) childFrontmatter.isCancelled = true;
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
    }
  }

  return stats;
}

function formatYMDTokyo(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizeUpcoming(
  upcoming: ParentFrontmatter["upcoming"],
  filePath: string,
): Record<string, Record<string, unknown>> {
  if (!upcoming) return {};
  const out: Record<string, Record<string, unknown>> = {};
  for (const [rawKey, value] of Object.entries(upcoming)) {
    const key = String(rawKey);
    if (!/^\d{6}$/.test(key)) {
      throw new Error(
        `Invalid upcoming date key in ${filePath}: ${key} (expected YYMMDD, e.g. 260530)`,
      );
    }
    out[key] = value;
  }
  return out;
}
