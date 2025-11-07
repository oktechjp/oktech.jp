import type { AstroIntegration } from "astro";
import {
  copyFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect } from "vite";

type Section = { routePrefix: string; sourceDir: string };

const CONTENT_SECTIONS: Section[] = [
  { routePrefix: "/articles/", sourceDir: "content/articles" },
  { routePrefix: "/events/", sourceDir: "content/events" },
];

const SKIP_EXTENSIONS = new Set([
  ".md",
  ".mdx",
  ".markdown",
  ".json",
  ".yaml",
  ".yml",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".avif",
  ".bmp",
  ".tif",
  ".tiff",
  ".ico",
]);

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".ics": "text/calendar; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
};

export default function relativeStaticAssets(): AstroIntegration {
  let projectRoot = "";

  return {
    name: "content-assets",
    hooks: {
      "astro:config:setup"({ config }) {
        projectRoot = fileURLToPath(config.root);
      },
      "astro:server:setup"({ server }) {
        server.middlewares.use(createAssetMiddleware(projectRoot));
      },
      "astro:build:done"({ dir }) {
        const outputDir = fileURLToPath(dir);
        for (const section of CONTENT_SECTIONS) {
          const sectionRoot = path.join(projectRoot, section.sourceDir);
          copyContentAssets({
            rootDir: sectionRoot,
            currentDir: sectionRoot,
            outputDir: path.join(outputDir, section.routePrefix.replace(/^\//, "")),
          });
        }
      },
    },
  };
}

function createAssetMiddleware(projectRoot: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    const requestPath = req.url ? decodeURIComponent(req.url.split("?")[0]) : "";
    if (!requestPath) return next();
    const target = resolveContentAssetPath(projectRoot, requestPath);
    if (!target) return next();
    const ext = path.extname(target).toLowerCase();
    res.setHeader("Content-Type", MIME_TYPES[ext] ?? "application/octet-stream");
    createReadStream(target).on("error", next).pipe(res);
  };
}

function resolveContentAssetPath(projectRoot: string, urlPath: string): string | undefined {
  const normalizedUrlPath = urlPath.split("#")[0]!;
  if (!normalizedUrlPath.includes(".")) return undefined;
  for (const section of CONTENT_SECTIONS) {
    if (!normalizedUrlPath.startsWith(section.routePrefix)) continue;
    const relativePath = normalizedUrlPath.slice(section.routePrefix.length);
    if (!relativePath || relativePath.endsWith("/")) continue;
    const sanitizedRelative = path.normalize(relativePath);
    if (sanitizedRelative.startsWith("..")) continue;
    const absolutePath = path.join(projectRoot, section.sourceDir, sanitizedRelative);
    if (!absolutePath.startsWith(path.join(projectRoot, section.sourceDir))) continue;
    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) continue;
    if (!shouldCopyAsset(absolutePath)) continue;
    return absolutePath;
  }
  return undefined;
}

function copyContentAssets({
  rootDir,
  currentDir,
  outputDir,
}: {
  rootDir: string;
  currentDir: string;
  outputDir: string;
}) {
  if (!existsSync(currentDir)) return;
  const entries = readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const currentPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      copyContentAssets({
        rootDir,
        currentDir: currentPath,
        outputDir,
      });
      continue;
    }
    if (!shouldCopyAsset(currentPath)) continue;
    const relativePath = path.relative(rootDir, currentPath);
    const destinationDir = path.join(outputDir, path.dirname(relativePath));
    mkdirSync(destinationDir, { recursive: true });
    copyFileSync(currentPath, path.join(outputDir, relativePath));
  }
}

function shouldCopyAsset(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  if (!ext || SKIP_EXTENSIONS.has(ext)) return false;
  return true;
}
