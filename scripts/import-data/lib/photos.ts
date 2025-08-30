import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { stringify as yamlStringify } from "yaml";

import { INFER_EVENTS } from "./constants";
import { logger } from "./logger";
import type { ImportStatistics } from "./statistics";
import type { Event, EventsWithVenuesJSON, Photo, PhotoJSON } from "./types";
import { downloadImage } from "./utils";

interface PhotoBatch {
  timestamp: number;
  photos: Photo[];
}

export interface PhotoAssignmentResult {
  photosByEvent: Record<string, Photo[]>;
  unassignedBatches: number;
}

// Attempt to infer the most likely event for a set of photos based on the upload timestamp.
function inferEventByTimestamp(
  timestamp: number,
  eventsJSON: EventsWithVenuesJSON,
): { event: Event; groupId: string } | null {
  let closestMatch: { event: Event; groupId: string } | null = null;
  let smallestPositiveDiff = Number.POSITIVE_INFINITY;

  for (const [groupId, groupData] of Object.entries(eventsJSON.groups)) {
    for (const ev of groupData.events) {
      const eventTime = new Date(ev.time).getTime();
      const diff = timestamp - eventTime;
      if (diff >= 0 && diff < smallestPositiveDiff) {
        smallestPositiveDiff = diff;
        closestMatch = { event: ev, groupId };
      }
    }
  }

  return closestMatch;
}

interface InferredBatch extends PhotoBatch {
  isInferred: boolean;
}

interface PatchMapping {
  [timestamp: string]: string;
}

const PATCH_FILE_PATH = path.join("scripts", "import-data", "patch_events.json");

async function loadPatchMappings(): Promise<PatchMapping> {
  try {
    if (existsSync(PATCH_FILE_PATH)) {
      const content = await fs.readFile(PATCH_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    logger.warn(`Failed to load patch_events.json: ${err instanceof Error ? err.message : String(err)}`);
  }
  return {};
}

async function savePatchMappings(mappings: PatchMapping): Promise<void> {
  try {
    await fs.writeFile(PATCH_FILE_PATH, JSON.stringify(mappings, null, 2));
    logger.success(`Saved patch mappings to ${PATCH_FILE_PATH}`);
  } catch (err) {
    logger.error(`Failed to save patch_events.json: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function findEventById(eventId: string, eventsJSON: EventsWithVenuesJSON): Event | null {
  for (const groupData of Object.values(eventsJSON.groups)) {
    for (const event of groupData.events) {
      if (event.id === eventId) {
        return event;
      }
    }
  }
  return null;
}

export async function assignPhotosToEvents(
  photosJSON: PhotoJSON,
  eventsWithVenuesJSON: EventsWithVenuesJSON,
  stats: ImportStatistics,
): Promise<PhotoAssignmentResult> {
  const photosByEvent: Record<string, Photo[]> = {};
  const photoBatchesByEvent: Record<string, InferredBatch[]> = {};
  let unassignedBatches = 0;

  // Track total batches
  stats.photoBatchesTotal = Object.keys(photosJSON.groups).length;

  const inferredAssignments: Array<{ eventId: string; eventTitle: string; timestamp: number }> = [];
  
  // Load existing patch mappings
  const patchMappings = await loadPatchMappings();
  const newPatchMappings: PatchMapping = { ...patchMappings };
  let patchMappingsUsed = 0;
  let newMappingsCreated = 0;

  Object.entries(photosJSON.groups).forEach(([key, grp]) => {
    if (grp.event) {
      // Event id explicitly provided - these are confirmed assignments
      const list = photosByEvent[grp.event] ?? [];
      list.push(...grp.photos);
      photosByEvent[grp.event] = list;

      const batches = photoBatchesByEvent[grp.event] ?? [];
      batches.push({ timestamp: grp.timestamp, photos: grp.photos, isInferred: false });
      photoBatchesByEvent[grp.event] = batches;

      stats.photoBatchesAssigned++;
      stats.photoBatchesUnchanged++; // Confirmed assignments are unchanged
    } else {
      // First check patch mappings (always, regardless of INFER_EVENTS)
      const timestampKey = grp.timestamp.toString();
      const patchedEventId = patchMappings[timestampKey];
      
      if (patchedEventId) {
        // Use patched mapping
        const event = findEventById(patchedEventId, eventsWithVenuesJSON);
        if (event) {
          const list = photosByEvent[patchedEventId] ?? [];
          list.push(...grp.photos);
          photosByEvent[patchedEventId] = list;

          const batches = photoBatchesByEvent[patchedEventId] ?? [];
          batches.push({ timestamp: grp.timestamp, photos: grp.photos, isInferred: false });
          photoBatchesByEvent[patchedEventId] = batches;

          stats.photoBatchesAssigned++;
          stats.photoBatchesUnchanged++;
          patchMappingsUsed++;
          logger.debug(`Used patch mapping for batch ${timestampKey} → ${patchedEventId}`);
        } else {
          logger.warn(`Patch mapping references non-existent event ${patchedEventId} for batch ${timestampKey}`);
          unassignedBatches++;
          stats.photoBatchesUnassigned++;
        }
      } else if (INFER_EVENTS) {
        // Attempt to infer the event based on timestamp
        const inferred = inferEventByTimestamp(grp.timestamp, eventsWithVenuesJSON);
        if (inferred) {
          inferredAssignments.push({
            eventId: inferred.event.id,
            eventTitle: inferred.event.title,
            timestamp: grp.timestamp,
          });

          const list = photosByEvent[inferred.event.id] ?? [];
          list.push(...grp.photos);
          photosByEvent[inferred.event.id] = list;

          const batches = photoBatchesByEvent[inferred.event.id] ?? [];
          batches.push({ timestamp: grp.timestamp, photos: grp.photos, isInferred: true });
          photoBatchesByEvent[inferred.event.id] = batches;

          stats.photoBatchesAssigned++;
          stats.photoBatchesCreated++; // Inferred assignments are new/created
          
          // Save this inference to the patch file only if not already defined
          if (!patchMappings[timestampKey]) {
            newPatchMappings[timestampKey] = inferred.event.id;
            newMappingsCreated++;
          }
        } else {
          logger.warn(`Could not infer event for photos batch with timestamp ${grp.timestamp}`);
          unassignedBatches++;
          stats.photoBatchesUnassigned++;
        }
      } else {
        logger.debug(
          `Skipping photos batch ${key} (timestamp: ${grp.timestamp}) because INFER_EVENTS is disabled and no patch mapping exists.`,
        );
        unassignedBatches++;
        stats.photoBatchesUnassigned++;
      }
    }
  });

  // Redistribute only inferred photo batches and get redistribution info
  const redistributions = redistributeInferredBatches(
    photosByEvent,
    photoBatchesByEvent,
    eventsWithVenuesJSON,
    stats,
  );

  // Save updated patch mappings if we created new ones
  if (newMappingsCreated > 0) {
    await savePatchMappings(newPatchMappings);
    logger.info(`Created ${newMappingsCreated} new patch mappings`);
  }
  
  // Combined reporting for photo assignments
  if (inferredAssignments.length > 0 || redistributions.length > 0 || patchMappingsUsed > 0) {
    logger.section("Photo Batch Processing");
    
    if (patchMappingsUsed > 0) {
      logger.info(`Used ${patchMappingsUsed} existing patch mappings`);
    }

    if (inferredAssignments.length > 0) {
      logger.info(`Inferred ${inferredAssignments.length} photo batch assignments:`);
      inferredAssignments.forEach(({ eventId, eventTitle, timestamp }) => {
        logger.info(`  • Batch ${timestamp} → Event ${eventId} (${eventTitle})`);
      });
    }

    if (redistributions.length > 0) {
      logger.info("");
      logger.info(
        `Redistributed ${redistributions.length} inferred batches from events with multiple batches:`,
      );
      redistributions.forEach(({ fromEvent, toEvent, timestamp }) => {
        logger.info(`  • ${fromEvent.title} → ${toEvent.title} (batch ${timestamp})`);
      });
    }
  }

  return { photosByEvent, unassignedBatches };
}

interface RedistributionInfo {
  fromEvent: { id: string; title: string };
  toEvent: { id: string; title: string };
  timestamp: number;
}

function redistributeInferredBatches(
  photosByEvent: Record<string, Photo[]>,
  photoBatchesByEvent: Record<string, InferredBatch[]>,
  eventsWithVenuesJSON: EventsWithVenuesJSON,
  stats: ImportStatistics,
): RedistributionInfo[] {
  const redistributions: RedistributionInfo[] = [];

  // Build list of all events
  const allEvents: Array<{ id: string; title: string; timestamp: number }> = [];
  for (const groupData of Object.values(eventsWithVenuesJSON.groups)) {
    for (const event of groupData.events) {
      allEvents.push({
        id: event.id,
        title: event.title,
        timestamp: new Date(event.time).getTime(),
      });
    }
  }

  // Sort all events by timestamp (newest first)
  allEvents.sort((a, b) => b.timestamp - a.timestamp);

  // Find events with multiple batches that have at least one inferred batch
  const eventsWithInferredBatches = Object.entries(photoBatchesByEvent)
    .filter(([_, batches]) => {
      // Only consider events with multiple batches AND at least one inferred batch
      return batches.length > 1 && batches.some((b) => b.isInferred);
    })
    .map(([eventId, batches]) => ({
      eventId,
      batches,
      event: allEvents.find((e) => e.id === eventId)!,
    }))
    .filter((item) => item.event)
    .sort((a, b) => b.event.timestamp - a.event.timestamp);

  const eventsWithoutPhotos = allEvents.filter((event) => !photosByEvent[event.id]);

  if (eventsWithInferredBatches.length > 0 && eventsWithoutPhotos.length > 0) {
    for (const { eventId, batches, event: eventInfo } of eventsWithInferredBatches) {
      // Only redistribute inferred batches, keep confirmed batches
      const inferredBatches = batches.filter((b) => b.isInferred);
      const sortedInferredBatches = [...inferredBatches].sort((a, b) => a.timestamp - b.timestamp);

      const nearbyEventsWithoutPhotos = eventsWithoutPhotos
        .filter((e) => e.timestamp < eventInfo.timestamp)
        .sort((a, b) => b.timestamp - a.timestamp);

      const availableEmptyEvents = nearbyEventsWithoutPhotos.length;

      if (sortedInferredBatches.length > 0 && availableEmptyEvents > 0) {
        // Redistribute all but one inferred batch (keep at least one batch per event)
        const confirmedBatchCount = batches.filter((b) => !b.isInferred).length;
        const maxBatchesToRedistribute =
          confirmedBatchCount > 0
            ? sortedInferredBatches.length // Can redistribute all inferred if there are confirmed batches
            : Math.max(0, sortedInferredBatches.length - 1); // Keep at least one batch if all are inferred

        const batchesToRedistribute = Math.min(maxBatchesToRedistribute, availableEmptyEvents);

        for (let i = 0; i < batchesToRedistribute; i++) {
          const batch = sortedInferredBatches[i];
          const targetEvent = nearbyEventsWithoutPhotos.shift()!;

          redistributions.push({
            fromEvent: { id: eventId, title: eventInfo.title },
            toEvent: { id: targetEvent.id, title: targetEvent.title },
            timestamp: batch.timestamp,
          });

          // Track redistribution as an update
          stats.photoBatchesUpdated++;
          stats.photoBatchesCreated--; // Was counted as created, now it's updated

          // Move photos from source to target
          photosByEvent[eventId] = photosByEvent[eventId].filter(
            (photo) => !batch.photos.includes(photo),
          );
          photosByEvent[targetEvent.id] = batch.photos;

          // Remove from events without photos list
          const index = eventsWithoutPhotos.findIndex((e) => e.id === targetEvent.id);
          if (index > -1) {
            eventsWithoutPhotos.splice(index, 1);
          }
        }
      }
    }
  }

  return redistributions;
}

// Helper function to process a batch of photos with concurrency control
async function processBatch<T>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));
  }
}

export async function processGallery(
  eventDir: string,
  photos: Photo[],
  stats: ImportStatistics,
): Promise<void> {
  const galleryDir = path.join(eventDir, "gallery");

  if (photos.length > 0) {
    await fs.mkdir(galleryDir, { recursive: true });

    // Process photos in parallel batches of 5
    const PARALLEL_DOWNLOADS = 5;

    // Filter out invalid photos first
    const validPhotos = photos.filter((photo) => {
      if (!photo.location) {
        logger.warn(`Photo without location property found, skipping`);
        return false;
      }
      if (photo.removed) {
        return false; // Skip removed images silently
      }
      return true;
    });

    // Process photos in parallel batches
    await processBatch(validPhotos, PARALLEL_DOWNLOADS, async (photo) => {
      const galleryImageFileName = path.basename(photo.location!);
      const galleryImageLocalPath = path.join(galleryDir, galleryImageFileName);

      try {
        const wasDownloaded = await downloadImage(photo.location!, galleryImageLocalPath);
        if (wasDownloaded) {
          stats.galleryImagesDownloaded++;
          logger.success(`Downloaded → ${galleryImageLocalPath}`);
        } else {
          stats.galleryImagesUnchanged++;
        }
      } catch (err) {
        logger.warn(
          `Failed to download image ${photo.location}: ${err instanceof Error ? err.message : String(err)}`,
        );
        // Don't count this as a failure, just skip it
      }

      // Process caption/metadata
      if (photo.caption) {
        const yamlPath = `${galleryImageLocalPath}.yaml`;
        const yamlContent = yamlStringify(
          { caption: photo.caption },
          { lineWidth: 0, defaultKeyType: "PLAIN", defaultStringType: "QUOTE_DOUBLE" },
        );

        if (!existsSync(yamlPath)) {
          await fs.writeFile(yamlPath, yamlContent);
          stats.metadataCreated++;
        } else {
          const existingYaml = await fs.readFile(yamlPath, "utf-8");
          if (existingYaml !== yamlContent) {
            await fs.writeFile(yamlPath, yamlContent);
            stats.metadataCreated++;
          } else {
            stats.metadataUnchanged++;
          }
        }
      } else {
        stats.metadataNotApplicable++;
      }
    });
  }

  // Clean up any local files that are no longer part of the gallery
  if (existsSync(galleryDir)) {
    const expectedFiles = new Set<string>();
    for (const photo of photos) {
      if (!photo.location || photo.removed) continue;
      const base = path.basename(photo.location);
      expectedFiles.add(base);
      if (photo.caption) {
        expectedFiles.add(`${base}.yaml`);
      }
    }

    const currentFiles = await fs.readdir(galleryDir);
    for (const fileName of currentFiles) {
      if (!expectedFiles.has(fileName)) {
        await fs.unlink(path.join(galleryDir, fileName));
        stats.galleryImagesDeleted++;
        logger.warn(`Removed stale gallery file → ${path.join(galleryDir, fileName)}`);
      }
    }

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
