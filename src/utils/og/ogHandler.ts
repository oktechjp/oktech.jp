import React from "react";

import { Resvg } from "@resvg/resvg-js";
import type { APIContext } from "astro";
import satori from "satori";

import type { CacheKeyData } from "./ogCache";
import { OGImageCache } from "./ogCache";

// ============================================================================
// Types
// ============================================================================

export interface OGHandlerOptions {
  component: React.ComponentType<any>;
  props: Record<string, unknown>;
  cacheKeyData: CacheKeyData; // Required - be explicit about cache invalidation
  width?: number;
  height?: number;
}

// ============================================================================
// Font Management (Memoized)
// ============================================================================

interface FontData {
  name: string;
  data: Buffer;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal" | "italic";
}

let cachedFonts: FontData[] | null = null;

/**
 * Load fonts once and cache them for all subsequent requests
 */
async function loadFonts(): Promise<FontData[]> {
  if (cachedFonts) {
    return cachedFonts;
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const fontsDir = path.join(process.cwd(), "node_modules/@fontsource");

  const [notoRegular, notoBold, lexendBold] = await Promise.all([
    fs.readFile(path.join(fontsDir, "noto-sans-jp/files/noto-sans-jp-latin-400-normal.woff")),
    fs.readFile(path.join(fontsDir, "noto-sans-jp/files/noto-sans-jp-latin-700-normal.woff")),
    fs.readFile(path.join(fontsDir, "lexend/files/lexend-latin-700-normal.woff")),
  ]);

  cachedFonts = [
    { name: "Noto Sans JP", data: notoRegular, weight: 400 as const, style: "normal" as const },
    { name: "Noto Sans JP", data: notoBold, weight: 700 as const, style: "normal" as const },
    { name: "Lexend", data: lexendBold, weight: 700 as const, style: "normal" as const },
  ];

  return cachedFonts;
}

// ============================================================================
// Image Utilities
// ============================================================================

/**
 * Load an image file as base64 data URL
 * Handles WebP conversion for better Satori compatibility
 */
export async function loadImageAsBase64(imagePath: string): Promise<string | null> {
  try {
    const fs = await import("fs/promises");
    const imageBuffer = await fs.readFile(imagePath);
    const extension = imagePath.split(".").pop()?.toLowerCase();

    // Convert WebP to JPEG for better compatibility with Satori
    if (extension === "webp") {
      const sharp = await import("sharp");
      const convertedBuffer = await sharp
        .default(imageBuffer)
        .resize(1024, 1024, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();
      return `data:image/jpeg;base64,${convertedBuffer.toString("base64")}`;
    }

    // For other formats, use as-is
    const mimeType = extension === "png" ? "image/png" : "image/jpeg";
    return `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error loading image:", error);
    return null;
  }
}

// ============================================================================
// OG Image Generation
// ============================================================================

/**
 * Main OG image route handler
 * Combines route wrapper and image generation into a single function
 */
export function createOGImageRoute(
  handler: (context: APIContext) => Promise<OGHandlerOptions | null>,
) {
  return async (context: APIContext): Promise<Response> => {
    try {
      // Get handler options
      const options = await handler(context);
      if (!options) {
        return new Response("Not found", { status: 404 });
      }

      const { component, props, cacheKeyData, width = 1200, height = 630 } = options;

      // Initialize cache
      const cache = new OGImageCache();

      // Determine cache control based on version parameter
      const hasVersion = context.url.searchParams.has("v");
      const cacheControl = hasVersion
        ? "public, max-age=31536000, immutable" // 1 year with version
        : "public, max-age=3600"; // 1 hour without version

      // Check cache (always check, even in development for testing)
      const cachedBuffer = await cache.getCachedImage(cacheKeyData);
      if (cachedBuffer) {
        return new Response(cachedBuffer, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": cacheControl,
          },
        });
      }

      // Load fonts (memoized)
      const fonts = await loadFonts();

      // Generate SVG with Satori
      const markup = React.createElement(component, props);
      const svg = await satori(markup, { width, height, fonts });

      // Convert SVG to PNG with Resvg
      const resvg = new Resvg(svg, {
        fitTo: { mode: "width", value: width },
      });
      const pngBuffer = resvg.render().asPng();

      // Cache the generated image
      await cache.cacheImage(cacheKeyData, pngBuffer);

      // Return the image
      return new Response(pngBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": cacheControl,
        },
      });
    } catch (error) {
      console.error("Error generating OG image:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return new Response(`Error generating image: ${message}`, { status: 500 });
    }
  };
}
