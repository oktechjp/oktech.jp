import fs from "node:fs/promises";
import path from "node:path";

import { filterUpcomingEvents, getEventEndTimeWithBuffer } from "@/utils/eventFilters";

import { config, getDataUrls } from "./config";
import { GitHubService } from "./github";
import { logger } from "./logger";
import { MapService } from "./maps";
import { type ExternalPhotoJSON, PhotoService } from "./photos";
import {
  EventProcessor,
  type ExternalEvent,
  type ExternalVenue,
  VenueProcessor,
} from "./processor";

/**
 * Format a number with optional suffix for display
 */
function formatNumber(n: number, suffix?: string): string {
  if (n === 0) return "-";
  return suffix ? `${n} ${suffix}` : n.toString();
}

// External JSON types for combined events and venues data
export type ExternalEventJSON = {
  groups: {
    [key: string]: {
      city: string;
      country: string;
      description: string;
      events: ExternalEvent[];
    };
  };
};

export type ExternalVenueJSON = {
  venues: ExternalVenue[];
};

// Combined type for the events.json that includes both groups and venues
export type ExternalEventsWithVenuesJSON = ExternalEventJSON & ExternalVenueJSON;

/**
 * Statistics tracking for import operations
 */
export class ImportStatistics {
  // Events
  eventsCreated = 0;
  eventsUpdated = 0;
  eventsUnchanged = 0;
  eventsTotal = 0;

  // Venues
  venuesCreated = 0;
  venuesUpdated = 0;
  venuesUnchanged = 0;
  venuesTotal = 0;

  // Photos
  photoBatchesTotal = 0;
  photoBatchesAssigned = 0;
  photoBatchesUnassigned = 0;

  // Gallery images
  galleryImagesDownloaded = 0;
  galleryImagesUnchanged = 0;
  galleryImagesDeleted = 0;

  // Maps
  mapsGenerated = 0;
  mapsUnchanged = 0;
  mapsFailed = 0;

  /**
   * Display formatted statistics summary
   */
  displaySummary(): void {
    logger.section("Import Summary");

    const rows = [
      ["", "Total", "Created", "Updated", "Unchanged", "Other"],
      [
        "Events",
        formatNumber(this.eventsTotal),
        formatNumber(this.eventsCreated),
        formatNumber(this.eventsUpdated),
        formatNumber(this.eventsUnchanged),
        "-",
      ],
      [
        "Venues",
        formatNumber(this.venuesTotal),
        formatNumber(this.venuesCreated),
        formatNumber(this.venuesUpdated),
        formatNumber(this.venuesUnchanged),
        "-",
      ],
      [
        "Maps",
        formatNumber(this.venuesTotal * 2), // Light and dark
        formatNumber(this.mapsGenerated),
        "-",
        formatNumber(this.mapsUnchanged),
        formatNumber(this.mapsFailed, "failed"),
      ],
      ["", "", "", "", "", ""],
      [
        "Photo Batches",
        formatNumber(this.photoBatchesTotal),
        "-",
        "-",
        formatNumber(this.photoBatchesAssigned),
        formatNumber(this.photoBatchesUnassigned, "unassigned"),
      ],
      [
        "Gallery Images",
        formatNumber(this.galleryImagesDownloaded + this.galleryImagesUnchanged),
        formatNumber(this.galleryImagesDownloaded),
        "-",
        formatNumber(this.galleryImagesUnchanged),
        formatNumber(this.galleryImagesDeleted, "deleted"),
      ],
    ];

    // Calculate column widths
    const colWidths = rows[0].map((_, colIndex) => {
      return Math.max(...rows.map((row) => row[colIndex].length)) + 2;
    });

    // Print header
    const header = rows[0]
      .map((cell, i) => {
        return i === 0 ? cell.padEnd(colWidths[i]) : cell.padStart(colWidths[i]);
      })
      .join("");
    logger.info(header);
    logger.info("─".repeat(header.length));

    // Print data rows
    rows.slice(1).forEach((row) => {
      if (row[0] === "") return; // Skip separator rows

      const formattedRow = row
        .map((cell, i) => {
          return i === 0 ? cell.padEnd(colWidths[i]) : cell.padStart(colWidths[i]);
        })
        .join("");
      logger.info(formattedRow);
    });

    // Warnings
    if (this.photoBatchesUnassigned > 0) {
      logger.warn(
        `${this.photoBatchesUnassigned} photo batch(es) could not be assigned to any event`,
      );
    }

    if (this.mapsFailed > 0) {
      logger.section("Map Generation Issues");
      if (this.mapsFailed === this.venuesTotal * 2) {
        logger.warn("All map generations failed. Common causes:");
        logger.warn("  1. Missing API key - Create .env.local with STADIA_MAPS_API_KEY");
        logger.warn("  2. Or change default provider in config/index.ts to a free provider");
      } else {
        logger.warn(`${this.mapsFailed} map(s) failed to generate. Check error messages above.`);
      }
    }
  }
}

/**
 * Main import orchestrator
 */
export class Importer {
  private stats = new ImportStatistics();
  private github: GitHubService;
  private mapService: MapService;
  private photoService: PhotoService;
  private eventProcessor: EventProcessor;
  private venueProcessor: VenueProcessor;

  constructor() {
    this.github = new GitHubService();
    this.mapService = new MapService();
    this.photoService = new PhotoService(this.github);
    this.eventProcessor = new EventProcessor(this.github, this.mapService, this.photoService);
    this.venueProcessor = new VenueProcessor(this.github, this.mapService, this.photoService);
  }

  /**
   * Run the import process
   */
  async run(
    options: {
      overwriteMaps?: boolean | "light" | "dark";
      customRepo?: string;
      customCommit?: string;
    } = {},
  ): Promise<void> {
    const { overwriteMaps = false, customRepo, customCommit } = options;

    // Log options
    if (overwriteMaps === true) {
      logger.info("Map overwrite mode enabled - existing maps will be regenerated");
    } else if (overwriteMaps === "light" || overwriteMaps === "dark") {
      logger.info(`Map overwrite mode enabled for ${overwriteMaps} theme only`);
    }

    if (customRepo) {
      logger.info(`Using custom repository: ${customRepo}`);
    }

    if (customCommit) {
      logger.info(`Using custom commit: ${customCommit}`);
    }

    // Fetch commit info or use custom commit
    logger.section("Fetching Repository Info");
    let commitInfo: { sha: string; date: string };

    if (customCommit) {
      // Use provided commit SHA
      commitInfo = {
        sha: customCommit,
        date: new Date().toISOString(), // Use current date for custom commit
      };
      logger.info(`Using custom commit: ${commitInfo.sha}`);
    } else {
      commitInfo = await this.github.getLatestCommit(customRepo);
      logger.info(`Latest commit: ${commitInfo.sha}`);
      logger.info(`Commit date: ${commitInfo.date}`);
    }

    // Get data URLs
    const urls = getDataUrls(commitInfo.sha, customRepo);

    // Fetch data
    logger.section("Fetching Data");
    const [eventsWithVenuesJSON, photosJSON] = await Promise.all([
      this.github.fetchJSON<ExternalEventsWithVenuesJSON>(urls.events),
      this.github.fetchJSON<ExternalPhotoJSON>(urls.photos),
    ]);

    // Count total events
    let totalEvents = 0;
    for (const groupData of Object.values(eventsWithVenuesJSON.groups)) {
      totalEvents += groupData.events.length;
    }

    logger.info(
      `Got ${totalEvents} events and ${Object.keys(photosJSON.groups).length} photo batches`,
    );

    // Process photos
    logger.section("Processing Photos");
    const photoAssignment = this.photoService.assignPhotosToEvents(photosJSON);
    this.stats.photoBatchesTotal = Object.keys(photosJSON.groups).length;
    this.stats.photoBatchesAssigned = photoAssignment.assignedCount;
    this.stats.photoBatchesUnassigned = photoAssignment.unassignedCount;

    // Set photos for event processor
    this.eventProcessor.setPhotos(photoAssignment.photosByEvent);

    // Process events
    logger.section("Processing Events");
    for (const [group, groupData] of Object.entries(eventsWithVenuesJSON.groups)) {
      for (const event of groupData.events) {
        this.stats.eventsTotal++;

        const result = await this.eventProcessor.processWithExtras(event, group);

        if (result.created) this.stats.eventsCreated++;
        if (result.updated) this.stats.eventsUpdated++;
        if (result.unchanged) this.stats.eventsUnchanged++;

        this.stats.galleryImagesDownloaded += result.galleryStats.downloaded;
        this.stats.galleryImagesUnchanged += result.galleryStats.unchanged;
        this.stats.galleryImagesDeleted += result.galleryStats.deleted;
      }
    }

    // Process venues
    logger.section("Processing Venues");
    if (eventsWithVenuesJSON.venues) {
      for (const venue of eventsWithVenuesJSON.venues) {
        this.stats.venuesTotal++;

        const result = await this.venueProcessor.processWithMaps(venue, overwriteMaps);

        if (result.created) this.stats.venuesCreated++;
        if (result.updated) this.stats.venuesUpdated++;
        if (result.unchanged) this.stats.venuesUnchanged++;

        this.stats.mapsGenerated += result.mapStats.generated;
        this.stats.mapsUnchanged += result.mapStats.unchanged;
        this.stats.mapsFailed += result.mapStats.failed;
      }
    }

    // Create meta.json
    await this.createMetadata(eventsWithVenuesJSON, commitInfo);

    // Display statistics
    this.stats.displaySummary();
  }

  /**
   * Create metadata file
   */
  private async createMetadata(
    eventsJSON: ExternalEventsWithVenuesJSON,
    commitInfo: { sha: string; date: string },
  ): Promise<void> {
    logger.section("Creating Metadata");

    // Calculate next event end time
    let nextEventEnds: string | null = null;

    // Convert events for filtering
    const allEvents = [];
    for (const groupData of Object.values(eventsJSON.groups)) {
      for (const event of groupData.events) {
        allEvents.push({
          data: {
            dateTime: new Date(event.time),
            duration: event.duration ? Math.round(event.duration / 60000) : undefined,
          },
          title: event.title,
          id: event.id,
        });
      }
    }

    // Get upcoming events
    const upcomingEvents = filterUpcomingEvents(allEvents);

    if (upcomingEvents.length > 0) {
      // Sort by end time
      upcomingEvents.sort((a, b) => {
        const aEndTime = getEventEndTimeWithBuffer(a).getTime();
        const bEndTime = getEventEndTimeWithBuffer(b).getTime();
        return aEndTime - bEndTime;
      });

      const nextEventToEnd = upcomingEvents[0];
      const endTime = getEventEndTimeWithBuffer(nextEventToEnd);
      nextEventEnds = endTime.toISOString();

      logger.info(`Next event ends: ${nextEventEnds} (Event: "${nextEventToEnd.title}")`);
    } else {
      logger.info("No upcoming events found");
    }

    // Write metadata
    const metaData = {
      commitDate: commitInfo.date,
      commitHash: commitInfo.sha,
      repository: "https://github.com/oktechjp/public",
      nextEventEnds,
    };

    const metaPath = path.join(config.paths.content, "meta.json");
    await fs.mkdir(config.paths.content, { recursive: true });
    await fs.writeFile(metaPath, JSON.stringify(metaData, null, 2));
    logger.success(`Created ${metaPath}`);
  }
}
