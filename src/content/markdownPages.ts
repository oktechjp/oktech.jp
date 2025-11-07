import { defineCollection, z } from "astro:content";

const EXCLUDED_DIRECTORIES = ["events/", "venues/", "people/"];

export const markdownPagesCollection = defineCollection({
  loader: markdownPagesLoader,
  schema: markdownPagesSchema,
});

export function normalizeMarkdownSlug(rawSlug: string): string {
  const trimmed = rawSlug.replace(/^\/+|\/+$/g, "");
  const withoutExtension = trimmed.replace(/\.(md|mdx|html)$/i, "");
  const withoutIndex = withoutExtension.replace(/\/index$/i, "");
  return withoutIndex || "index";
}

function markdownPagesLoader() {
  const markdownFiles = import.meta.glob("/content/**/*.md", {
    query: "?url",
    import: "default",
    eager: true,
  });

  return Object.keys(markdownFiles)
    .map((absolutePath) => absolutePath.replace(/^\/content\//, ""))
    .filter((relativePath) => !EXCLUDED_DIRECTORIES.some((dir) => relativePath.startsWith(dir)))
    .map((relativePath) => ({
      id: normalizeMarkdownSlug(relativePath),
      filePath: relativePath,
    }));
}

function markdownPagesSchema() {
  return z.object({
    filePath: z.string(),
  });
}
