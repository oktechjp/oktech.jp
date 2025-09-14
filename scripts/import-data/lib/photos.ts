import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { stringify as yamlStringify } from "yaml";

import { config } from "./config";
import { GitHubService } from "./github";
import { logger } from "./logger";

// External JSON types for photos
export type ExternalPhoto = {
  location: string; // Path to the image file
  caption?: string;
  date?: number;
  res?: [number, number][];
  corners?: string[];
  removed?: boolean;
  instructional?: boolean;
};

export type ExternalPhotoJSON = {
  groups: {
    [key: string]: {
      content: string;
      event?: string;
      photos: ExternalPhoto[];
      timestamp: number;
    };
  };
};

export interface PhotoAssignment {
  photosByEvent: Record<string, ExternalPhoto[]>;
  unassignedCount: number;
  assignedCount: number;
}

/**
 * Service for managing photo assignments and downloads
 */
export class PhotoService {
  constructor(private github: GitHubService) {}

  /**
   * Assign photos to events based on explicit IDs or config patches
   */
  assignPhotosToEvents(photosJSON: ExternalPhotoJSON): PhotoAssignment {
    const photosByEvent: Record<string, ExternalPhoto[]> = {};
    let assignedCount = 0;
    let unassignedCount = 0;

    // Process each photo batch
    for (const [, batch] of Object.entries(photosJSON.groups)) {
      // First check explicit assignment in JSON
      const eventId = batch.event || config.photoEventPatches[batch.timestamp];

      if (eventId) {
        if (!photosByEvent[eventId]) {
          photosByEvent[eventId] = [];
        }
        photosByEvent[eventId].push(...batch.photos.filter((photo) => !photo.instructional));
        assignedCount++;

        if (config.photoEventPatches[batch.timestamp]) {
          logger.info(
            `Applied patch: photo batch (timestamp: ${batch.timestamp}) → Event ${eventId}`,
          );
        }
      } else {
        unassignedCount++;
        logger.debug(`Unassigned photo batch (timestamp: ${batch.timestamp})`);
      }
    }

    return {
      photosByEvent,
      unassignedCount,
      assignedCount,
    };
  }

  /**
   * Process gallery photos for an event
   */
  async processGallery(
    eventDir: string,
    photos: ExternalPhoto[],
  ): Promise<{ downloaded: number; unchanged: number; deleted: number }> {
    const stats = { downloaded: 0, unchanged: 0, deleted: 0 };

    if (photos.length === 0) {
      // Clean up empty gallery if it exists
      const galleryDir = path.join(eventDir, "gallery");
      if (existsSync(galleryDir)) {
        await this.cleanupGallery(galleryDir, [], stats);
      }
      return stats;
    }

    const galleryDir = path.join(eventDir, "gallery");
    await fs.mkdir(galleryDir, { recursive: true });

    // Filter valid photos
    const validPhotos = photos.filter((photo) => {
      if (!photo.location) {
        logger.warn("Photo without location property found, skipping");
        return false;
      }
      if (photo.removed) {
        return false; // Skip removed images silently
      }
      return true;
    });

    // Process photos in parallel batches
    const BATCH_SIZE = config.features.parallelDownloads;
    for (let i = 0; i < validPhotos.length; i += BATCH_SIZE) {
      const batch = validPhotos.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (photo) => {
          await this.processPhoto(photo, galleryDir, stats);
        }),
      );
    }

    // Clean up stale files
    await this.cleanupGallery(galleryDir, validPhotos, stats);

    return stats;
  }

  /**
   * Process a single photo
   */
  private async processPhoto(
    photo: ExternalPhoto,
    galleryDir: string,
    stats: { downloaded: number; unchanged: number },
  ): Promise<void> {
    const fileName = path.basename(photo.location!);
    const localPath = path.join(galleryDir, fileName);

    try {
      // Check if image already exists
      if (existsSync(localPath)) {
        const fileStats = await fs.stat(localPath);
        if (fileStats.size > 0) {
          stats.unchanged++;
        } else {
          // Re-download if file is empty
          const imageUrl = config.github.getRawBaseUrl() + photo.location!;
          await this.downloadAndProcessImage(imageUrl, localPath);
          stats.downloaded++;
        }
      } else {
        const imageUrl = config.github.getRawBaseUrl() + photo.location!;
        await this.downloadAndProcessImage(imageUrl, localPath);
        stats.downloaded++;
        logger.success(`Downloaded → ${localPath}`);
      }
    } catch (err) {
      logger.warn(
        `Failed to download image ${photo.location}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    // Process caption metadata
    if (photo.caption) {
      await this.savePhotoMetadata(localPath, photo.caption);
    }
  }

  /**
   * Download and process an image
   */
  private async downloadAndProcessImage(url: string, localPath: string): Promise<void> {
    const imageBuffer = await this.github.downloadFile(url);

    // Process with Sharp for consistent encoding and resizing
    const sharp = await import("sharp");
    const processedBuffer = await sharp
      .default(imageBuffer)
      .resize(config.features.maxImageWidth, null, {
        withoutEnlargement: true, // Don't upscale smaller images
        fit: "inside", // Preserve aspect ratio
      })
      .webp({ quality: config.features.imageQuality }) // Convert to WebP with consistent quality
      .toBuffer();

    await fs.writeFile(localPath, processedBuffer);
  }

  /**
   * Save photo metadata as YAML
   */
  private async savePhotoMetadata(imagePath: string, caption: string): Promise<void> {
    const yamlPath = `${imagePath}.yaml`;
    const yamlContent = yamlStringify(
      { caption },
      { lineWidth: 0, defaultKeyType: "PLAIN", defaultStringType: "QUOTE_DOUBLE" },
    );

    await fs.writeFile(yamlPath, yamlContent);
  }

  /**
   * Clean up stale gallery files
   */
  private async cleanupGallery(
    galleryDir: string,
    validPhotos: ExternalPhoto[],
    stats: { deleted: number },
  ): Promise<void> {
    if (!existsSync(galleryDir)) return;

    // Build set of expected files
    const expectedFiles = new Set<string>();
    for (const photo of validPhotos) {
      if (!photo.location || photo.removed) continue;
      const base = path.basename(photo.location);
      expectedFiles.add(base);
      if (photo.caption) {
        expectedFiles.add(`${base}.yaml`);
      }
    }

    // Remove unexpected files
    const currentFiles = await fs.readdir(galleryDir);
    for (const fileName of currentFiles) {
      if (!expectedFiles.has(fileName)) {
        await fs.unlink(path.join(galleryDir, fileName));
        stats.deleted++;
        logger.warn(`Removed stale gallery file → ${path.join(galleryDir, fileName)}`);
      }
    }

    // Remove empty gallery directory
    const remainingFiles = await fs.readdir(galleryDir);
    if (remainingFiles.length === 0) {
      try {
        await fs.rmdir(galleryDir);
      } catch (err) {
        logger.error(`Failed to remove empty gallery ${galleryDir}:`, err);
      }
    }
  }
}
