import type { Root } from "mdast";
import { toString } from "mdast-util-to-string";
import path from "path";
import getReadingTime from "reading-time";
import { visit } from "unist-util-visit";

/**
 * Remark plugin to add reading time to frontmatter
 */
export function remarkReadingTime() {
  return function (tree: Root, file: any) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);

    // Add reading time to frontmatter
    file.data.astro.frontmatter.readingTime = readingTime.text;
    file.data.astro.frontmatter.readingTimeMinutes = readingTime.minutes;
  };
}

/**
 * Remark plugin to extract description from first paragraph
 */
export function remarkDescription() {
  return function (tree: Root, file: any) {
    // Only set if not already defined in frontmatter
    if (!file.data.astro.frontmatter.description) {
      let description = "";
      let foundFirstParagraph = false;

      // Visit all nodes to find the first paragraph
      visit(tree, "paragraph", (node) => {
        if (!foundFirstParagraph) {
          // Extract text from the first paragraph
          description = toString(node);
          foundFirstParagraph = true;
        }
      });

      // Truncate if too long
      if (description.length > 160) {
        description = description.substring(0, 157) + "...";
      }

      file.data.astro.frontmatter.description = description;
    }
  };
}

/**
 * Remark plugin to rewrite asset paths inside Markdown so relative paths resolve from the markdown file's directory.
 */
export function remarkRelativeAssets() {
  return function (tree: Root, file: any) {
    const filePath = file.history?.[0] as string | undefined;
    if (!filePath) return;
    const normalizedFilePath = filePath.replace(/\\/g, "/");
    const contentIndex = normalizedFilePath.indexOf("/content/");
    if (contentIndex === -1) return;
    const relativePath = normalizedFilePath.slice(contentIndex + "/content/".length);
    const fileDirRelative = path.posix.dirname(relativePath);
    const fileDir = fileDirRelative === "." ? "/" : `/${fileDirRelative.replace(/^\/+/, "")}`;

    visit(tree, (node: any) => {
      if (node.type === "image") {
        return;
      }
      if (node.type === "link" || node.type === "linkReference") {
        rewritePath(node, "url", fileDir);
      }
      if (node.type === "html") {
        node.value = rewriteHtmlSources(node.value, fileDir);
      }
    });
  };
}

function rewritePath(node: any, key: string, fileDir: string) {
  const value: string | undefined = node[key];
  if (!value || typeof value !== "string") return;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return;
  node[key] = path.posix.normalize(path.posix.join(fileDir, value));
}

function rewriteHtmlSources(value: string, fileDir: string): string {
  return value.replace(/(src|href)\s*=\s*(["'])([^"']+)\2/g, (match, attr, quote, url) => {
    if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) {
      return match;
    }
    const rewritten = path.posix.normalize(path.posix.join(fileDir, url));
    return `${attr}=${quote}${rewritten}${quote}`;
  });
}
