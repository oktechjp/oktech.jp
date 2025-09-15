import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import { normalizePathname, removeBasePath, resolveInternalHref } from "../urlResolver";
import { themeColorsHex } from "./theme-colors";

// ============================================================================
// Cache Key Data Type
// ============================================================================

/**
 * Cache key data passed from the template handler
 * This allows the handler to specify exactly which fields should
 * invalidate the cache, avoiding hardcoded field extraction
 */
export type CacheKeyData = Record<string, unknown>;

// ============================================================================
// OG Image Caching
// ============================================================================

/**
 * Manages caching of generated OG images to avoid regeneration
 */
export class OGImageCache {
  private cacheDir: string;
  private static OG_VERSION = "v1.2";
  private static themeHash: string | null = null;

  constructor() {
    // Use the same cache directory as Astro for consistency
    this.cacheDir = path.join(process.cwd(), "node_modules", ".astro", "assets", "og-images");
  }

  /**
   * Get hash of theme colors for cache invalidation
   */
  private static getThemeHash(): string {
    if (!OGImageCache.themeHash) {
      // Create a stable hash of the theme colors
      const themeContent = JSON.stringify(themeColorsHex);
      OGImageCache.themeHash = crypto
        .createHash("sha256")
        .update(themeContent)
        .digest("hex")
        .substring(0, 8);
    }
    return OGImageCache.themeHash;
  }

  /**
   * Generate a cache key from data
   * Includes OG version and theme hash to invalidate on changes
   */
  static generateCacheKey(data: any): string {
    const content = JSON.stringify(data, Object.keys(data).sort());
    // Include OG version, theme hash, and content in the cache key
    const combinedContent = OGImageCache.OG_VERSION + OGImageCache.getThemeHash() + content;
    return crypto.createHash("sha256").update(combinedContent).digest("hex").substring(0, 12);
  }

  /**
   * Get the OG image path for a given route
   * @param href - The route path (e.g. "/about", "/event/123")
   * @param data - Optional data to generate cache key from
   * @returns The OG image path (e.g. "/og.png?v=abc123", "/event/123/og.png?v=def456")
   */
  static getOGImagePath(href: string, data?: any): string {
    // Remove base path and normalize by removing .html extension
    const cleanHref = normalizePathname(removeBasePath(href));

    // Default path
    let ogPath = "/og.png";

    // Special handling for routes with custom OG handlers
    if (cleanHref !== "/sitemap.xml") {
      // Check if this route has a specific OG image handler
      const isHomePage = cleanHref === "/";
      const isEventsPage = cleanHref === "/events";
      const isEventsListPage = cleanHref === "/events/list";
      const isEventsAlbumPage = cleanHref === "/events/album";
      const isEventPage =
        cleanHref.startsWith("/events/") && !isEventsListPage && !isEventsAlbumPage;
      const isVenuePage = cleanHref.startsWith("/venue/");

      if (
        isEventsPage ||
        isEventsListPage ||
        isEventsAlbumPage ||
        isEventPage ||
        isVenuePage ||
        (isHomePage && cleanHref !== "/")
      ) {
        // For non-home pages with handlers, append og.png to the path
        ogPath = cleanHref.endsWith("/") ? `${cleanHref}og.png` : `${cleanHref}/og.png`;
      }
    }

    // Add cache key if data provided
    if (data) {
      const cacheKey = OGImageCache.generateCacheKey(data);
      return `${ogPath}?v=${cacheKey}`;
    }

    return ogPath;
  }

  /**
   * Get the cache file path for a given cache key
   */
  private getCacheFilePath(cacheKey: string): string {
    return path.join(this.cacheDir, `${cacheKey}.png`);
  }

  /**
   * Check if a cached version exists and is still valid
   */
  async isCached(cacheKeyData: CacheKeyData): Promise<boolean> {
    try {
      const cacheKey = OGImageCache.generateCacheKey(cacheKeyData);
      const cachePath = this.getCacheFilePath(cacheKey);

      await fs.access(cachePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get cached image buffer if it exists
   */
  async getCachedImage(cacheKeyData: CacheKeyData): Promise<Buffer | null> {
    try {
      const cacheKey = OGImageCache.generateCacheKey(cacheKeyData);
      const cachePath = this.getCacheFilePath(cacheKey);

      return await fs.readFile(cachePath);
    } catch {
      return null;
    }
  }

  /**
   * Cache a generated image buffer
   */
  async cacheImage(cacheKeyData: CacheKeyData, imageBuffer: Buffer): Promise<void> {
    try {
      const cacheKey = OGImageCache.generateCacheKey(cacheKeyData);
      const cachePath = this.getCacheFilePath(cacheKey);

      // Ensure cache directory exists
      await fs.mkdir(this.cacheDir, { recursive: true });

      // Write the image to cache
      await fs.writeFile(cachePath, imageBuffer);
    } catch (error) {
      console.error("Failed to cache OG image:", error);
    }
  }

  /**
   * Clear all cached images (useful for cache invalidation)
   */
  async clearCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const deletedFiles = await Promise.all(
        files
          .filter((file) => file.endsWith(".png"))
          .map((file) => fs.unlink(path.join(this.cacheDir, file)).then(() => file)),
      );
      console.log(`Cleared ${deletedFiles.length} cached OG images`);
    } catch (error) {
      // Cache directory might not exist yet
      if (
        error instanceof Error &&
        "code" in error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        console.log("OG cache directory does not exist yet");
      } else {
        console.error("Failed to clear OG image cache:", error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ count: number; totalSize: number }> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const pngFiles = files.filter((file) => file.endsWith(".png"));

      let totalSize = 0;
      for (const file of pngFiles) {
        const filePath = path.join(this.cacheDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      return {
        count: pngFiles.length,
        totalSize,
      };
    } catch {
      return { count: 0, totalSize: 0 };
    }
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get the OG image URL for a given route, with fallback to default
 * @param href - The route path (e.g. "/about", "/event/123")
 * @param data - Optional data to generate cache key from
 * @returns The OG image URL with base path
 */
export function getOGImageWithFallback(href: string, data?: any): string {
  // Always generate a cache key based on the route at minimum
  const cacheData = data || { route: href };
  const ogPath = OGImageCache.getOGImagePath(href, cacheData);
  return resolveInternalHref(ogPath);
}
