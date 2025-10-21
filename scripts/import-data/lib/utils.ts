import fs from "node:fs/promises";
import path from "node:path";

type WriteFileOptions = Parameters<typeof fs.writeFile>[2];
type WriteFileData = Parameters<typeof fs.writeFile>[1];

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
