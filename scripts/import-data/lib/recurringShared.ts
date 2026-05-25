import * as fs from "fs/promises";
import * as path from "path";

import matter from "gray-matter";

import type { RepeatOverride } from "../../../src/utils/recurringDates";

import { yamlEngine } from "./yamlEngine";

export type ParentFrontmatter = {
  dateTime: string;
  cover?: string;
  devOnly?: boolean;
  duration?: number;
  title?: string;
  links?: Record<string, string>;
  repeat?: Record<string, RepeatOverride | null>;
};

export type RepeatingParent = {
  parentSlug: string;
  parentPath: string;
  parsed: matter.GrayMatterFile<string>;
  frontmatter: ParentFrontmatter & { repeat: Record<string, RepeatOverride | null> };
};

export async function* iterRepeatParents(eventsDir: string): AsyncGenerator<RepeatingParent> {
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
    const data = parsed.data as ParentFrontmatter;
    const repeat = data.repeat;
    if (!repeat) continue;
    yield { parentSlug, parentPath, parsed, frontmatter: { ...data, repeat } };
  }
}
