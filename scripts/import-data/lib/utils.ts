import fs from "node:fs/promises";
import path from "node:path";

type WriteFileOptions = Parameters<typeof fs.writeFile>[2];
type WriteFileData = Parameters<typeof fs.writeFile>[1];

/**
 * Normalize markdown content from external sources (e.g., Meetup).
 * Fixes common issues like escaped list markers and other formatting problems.
 */
export function normalizeMarkdown(content: string): string {
  if (!content) return content;

  return (
    content
      // Convert escaped dash sequences to horizontal rules with proper spacing
      .replace(/^(?:\\-){3,}$/gm, "\n---\n")
      // Fix escaped list markers: \- → - (at start of line or after whitespace)
      .replace(/^\\-/gm, "-")
      .replace(/(\s)\\-/g, "$1-")
      // Fix escaped parentheses in list items: \( and \) → ( and )
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      // Fix escaped asterisks that break bold/italic: \* → *
      .replace(/\\\*/g, "*")
      // Fix escaped periods: \. → .
      .replace(/\\\./g, ".")
      // Normalize multiple blank lines to max 2
      .replace(/\n{3,}/g, "\n\n")
      // Trim trailing whitespace from lines
      .replace(/[ \t]+$/gm, "")
  );
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function writeFileEnsured(
  filePath: string,
  data: WriteFileData,
  options?: WriteFileOptions,
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, data, options);
}
