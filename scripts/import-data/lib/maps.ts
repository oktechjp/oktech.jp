import fs from "node:fs/promises";
import path from "node:path";
// @ts-ignore
import osmStaticMaps from "osm-static-maps";

import { config, getMapProviderConfig } from "./config";
import { logger } from "./logger";

export interface MapOptions {
  lat: number;
  lng: number;
  width?: number;
  height?: number;
  zoom?: number;
  theme?: "light" | "dark";
}

/**
 * Service for generating static maps for venues
 */
export class MapService {
  /**
   * Generate a static map for a venue
   */
  async generate(outputPath: string, options: MapOptions): Promise<boolean> {
    const {
      lat,
      lng,
      width = config.maps.defaultOptions.width,
      height = config.maps.defaultOptions.height,
      zoom = config.maps.defaultOptions.zoom,
      theme = "light",
    } = options;

    try {
      // Get provider based on theme
      const providerKey =
        theme === "dark" ? config.maps.darkModeProvider : config.maps.defaultProvider;

      const provider = getMapProviderConfig(providerKey);

      // Create map options for osm-static-maps
      const mapOptions = {
        center: `${lng},${lat}`,
        zoom,
        width,
        height,
        tileserverUrl: provider.url,
        attribution: provider.attribution,
        type: config.maps.defaultOptions.type,
        quality: config.maps.defaultOptions.quality,
      };

      // Generate the map
      const imageBuffer = await osmStaticMaps(mapOptions);

      // Ensure directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Write the image
      await fs.writeFile(outputPath, imageBuffer);

      logger.success(`Generated ${theme} map → ${outputPath}`);
      return true;
    } catch (error) {
      this.handleError(error, outputPath);
      return false;
    }
  }

  /**
   * Generate maps for a venue with optional overwrite control
   */
  async generateMaps(
    venueDir: string,
    lat: number,
    lng: number,
    overwrite: boolean | "light" | "dark" = false,
  ): Promise<{ generated: number; failed: number; unchanged: number }> {
    const stats = { generated: 0, failed: 0, unchanged: 0 };

    const lightPath = path.join(venueDir, "map.jpg");
    const darkPath = path.join(venueDir, "map-dark.jpg");

    // Check existing files
    const [lightExists, darkExists] = await Promise.all([
      this.fileExists(lightPath),
      this.fileExists(darkPath),
    ]);

    // Determine which maps to generate based on overwrite parameter
    const shouldGenerateLight = overwrite === true || overwrite === "light" || !lightExists;
    const shouldGenerateDark = overwrite === true || overwrite === "dark" || !darkExists;

    // Generate light map if needed
    if (shouldGenerateLight) {
      if (!lightExists || overwrite) {
        const success = await this.generate(lightPath, { lat, lng, theme: "light" });
        if (success) stats.generated++;
        else stats.failed++;
      } else {
        stats.unchanged++;
      }
    } else if (lightExists) {
      stats.unchanged++;
    }

    // Generate dark map if needed
    if (shouldGenerateDark) {
      if (!darkExists || overwrite) {
        const success = await this.generate(darkPath, { lat, lng, theme: "dark" });
        if (success) stats.generated++;
        else stats.failed++;
      } else {
        stats.unchanged++;
      }
    } else if (darkExists) {
      stats.unchanged++;
    }

    return stats;
  }

  /**
   * Check if a file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle map generation errors with specific messages
   */
  private handleError(error: unknown, outputPath: string): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("STADIA_API_KEY")) {
      logger.error(
        `Map generation failed - Missing API key. Set STADIA_MAPS_API_KEY in .env.local`,
      );
    } else if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("ETIMEDOUT")) {
      logger.error(`Map generation failed - Could not connect to tile server: ${errorMessage}`);
    } else if (errorMessage.includes("status code")) {
      logger.error(`Map generation failed - Tile server error: ${errorMessage}`);
    } else {
      logger.error(`Map generation failed for ${outputPath}: ${errorMessage}`);
    }
  }
}
