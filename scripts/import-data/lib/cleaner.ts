import { existsSync } from "node:fs";
import { glob, readdir, rm, rmdir } from "node:fs/promises";
import path from "node:path";

import { config } from "./config";
import { logger } from "./logger";

export type ClearTarget =
  | "markdown"
  | "events"
  | "venues"
  | "image-files"
  | "image-metadata"
  | "images"
  | "maps"
  | "empty-dirs"
  | "all";

interface ClearStrategy {
  patterns: string[];
  dirs: string[];
  description: string;
}

/**
 * Unified cleaner for all data clearing operations
 */
export class Cleaner {
  private strategies: Record<string, ClearStrategy> = {
    markdown: {
      patterns: ["**/*.md"],
      dirs: [config.paths.events, config.paths.venues],
      description: "all markdown files",
    },
    events: {
      patterns: ["**/*.md"],
      dirs: [config.paths.events],
      description: "event markdown files",
    },
    venues: {
      patterns: ["**/*.md"],
      dirs: [config.paths.venues],
      description: "venue markdown files",
    },
    "image-files": {
      patterns: ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.gif", "**/*.webp"],
      dirs: [config.paths.events],
      description: "image files",
    },
    "image-metadata": {
      patterns: ["**/*.yaml", "**/*.json"],
      dirs: [config.paths.events],
      description: "image metadata files",
    },
    images: {
      patterns: [
        "**/*.jpg",
        "**/*.jpeg",
        "**/*.png",
        "**/*.gif",
        "**/*.webp",
        "**/*.yaml",
        "**/*.json",
      ],
      dirs: [config.paths.events],
      description: "images and metadata",
    },
    maps: {
      patterns: ["**/map.jpg", "**/map-dark.jpg"],
      dirs: [config.paths.venues],
      description: "venue map files",
    },
  };

  /**
   * Clear data based on target type
   */
  async clear(target: ClearTarget): Promise<void> {
    switch (target) {
      case "all":
        await this.clearAll();
        break;
      case "empty-dirs":
        await this.clearEmptyDirectories();
        break;
      default:
        await this.clearByStrategy(target);
        break;
    }
  }

  /**
   * Clear files using a specific strategy
   */
  private async clearByStrategy(strategyName: string): Promise<void> {
    const strategy = this.strategies[strategyName];
    if (!strategy) {
      throw new Error(`Unknown clear strategy: ${strategyName}`);
    }

    logger.info(`Clearing ${strategy.description}...`);

    let filesDeleted = 0;
    for (const dir of strategy.dirs) {
      for (const pattern of strategy.patterns) {
        const files = glob(pattern, { cwd: dir });
        for await (const file of files) {
          await rm(path.join(dir, file), { force: true });
          filesDeleted++;
        }
      }
    }

    // Clean up empty directories
    for (const dir of strategy.dirs) {
      await this.removeEmptyDirectories(dir);
    }

    logger.success(`Cleared ${filesDeleted} ${strategy.description}.`);
  }

  /**
   * Clear all data
   */
  private async clearAll(): Promise<void> {
    logger.info("Clearing all data...");

    // Clear all strategies
    for (const strategyName of Object.keys(this.strategies)) {
      await this.clearByStrategy(strategyName);
    }

    // Final cleanup of empty directories
    await this.clearEmptyDirectories();

    logger.success("All data cleared.");
  }

  /**
   * Clear empty directories
   */
  private async clearEmptyDirectories(): Promise<void> {
    logger.info("Clearing empty directories...");

    await this.removeEmptyDirectories(config.paths.events);
    await this.removeEmptyDirectories(config.paths.venues);

    logger.success("Empty directories cleared.");
  }

  /**
   * Recursively remove empty directories
   */
  private async removeEmptyDirectories(dir: string): Promise<void> {
    if (!existsSync(dir)) return;

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      // Recursively process subdirectories first
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dir, entry.name);
          await this.removeEmptyDirectories(fullPath);
        }
      }

      // Check if directory is now empty and remove it
      const remainingEntries = await readdir(dir);
      if (
        remainingEntries.length === 0 &&
        dir !== config.paths.events &&
        dir !== config.paths.venues
      ) {
        await rmdir(dir);
        logger.info(`Removed empty directory → ${dir}`);
      }
    } catch (error) {
      // Silently ignore errors (directory might not exist or permission issues)
    }
  }

  /**
   * Get valid clear targets for help display
   */
  static getValidTargets(): string[] {
    return [
      "markdown",
      "events",
      "venues",
      "image-files",
      "image-metadata",
      "images",
      "maps",
      "empty-dirs",
      "all",
    ];
  }
}
