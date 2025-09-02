import type { Root } from "mdast";
import { toString } from "mdast-util-to-string";
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
