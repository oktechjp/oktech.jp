import fs from "node:fs/promises";
import path from "node:path";

import { filterUpcomingEvents, getEventEndTimeWithBuffer } from "@/utils/eventFilters";

import { CONTENT_DIR, getGithubRawUrl } from "./constants";
import { processEvent } from "./events";
import { githubFetchJSON } from "./github-fetch";
import { logger } from "./logger";
import { assignPhotosToEvents } from "./photos";
import { createStatistics } from "./statistics";
import type { EventsWithVenuesJSON, PhotoJSON } from "./types";
import { fetchLatestCommitInfo } from "./utils";
import { processVenue, unmatchedCities } from "./venues";

export async function handleImport(args: string[]) {
  const overwriteMaps = args.includes("--overwrite-maps");

  // Check for --overwrite-maps-theme parameter
  let overwriteMapsTheme: "light" | "dark" | "both" | null = null;
  const themeIndex = args.findIndex((arg) => arg === "--overwrite-maps-theme");
  if (themeIndex !== -1 && args[themeIndex + 1]) {
    const theme = args[themeIndex + 1];
    if (theme === "light" || theme === "dark") {
      overwriteMapsTheme = theme;
    } else {
      logger.error(`Invalid theme for --overwrite-maps-theme: ${theme}. Use 'light' or 'dark'.`);
      process.exit(1);
    }
  }

  if (overwriteMaps) {
    logger.info("Map overwrite mode enabled - existing maps will be regenerated");
  } else if (overwriteMapsTheme) {
    logger.info(`Map overwrite mode enabled for ${overwriteMapsTheme} theme only`);
  }

  // Initialize statistics
  const stats = createStatistics();

  // Fetch commit info
  logger.section("Fetching Repository Info");
  const commitInfo = await fetchLatestCommitInfo();
  logger.info(`Latest commit: ${commitInfo.sha}`);
  logger.info(`Commit date: ${commitInfo.date}`);

  // Build URLs using the specific commit hash
  const eventsUrl = getGithubRawUrl(commitInfo.sha, "events.json");
  const photosUrl = getGithubRawUrl(commitInfo.sha, "photos.json");

  // Fetch data
  logger.section("Fetching Data");
  const [eventsWithVenuesJSON, photosJSON] = await Promise.all([
    githubFetchJSON<EventsWithVenuesJSON>(eventsUrl),
    githubFetchJSON<PhotoJSON>(photosUrl),
  ]);

  // Process photos
  const { photosByEvent } = await assignPhotosToEvents(photosJSON, eventsWithVenuesJSON, stats);

  // Process events
  logger.section("Processing Events");
  for (const [group, groupData] of Object.entries(eventsWithVenuesJSON.groups)) {
    for (const event of groupData.events) {
      stats.totalEvents++;
      const photos = photosByEvent[event.id] ?? [];
      await processEvent(event, group, photos, stats);
    }
  }

  // Process venues
  logger.section("Processing Venues");
  if (eventsWithVenuesJSON.venues) {
    for (const venue of eventsWithVenuesJSON.venues) {
      stats.totalVenues++;
      await processVenue(venue, overwriteMaps || !!overwriteMapsTheme, stats, overwriteMapsTheme);
    }
  }

  // Report results
  logger.section("Import Summary");

  // Helper to format numbers with alignment
  const fmt = (n: number): string => {
    return n === 0 ? "-" : n.toString();
  };

  // Helper to format with suffix
  const fmtWithSuffix = (n: number, suffix: string): string => {
    return n === 0 ? "-" : `${n} ${suffix}`;
  };

  // Create summary rows
  const rows = [
    ["", "Total", "Created", "Updated", "Unchanged", "Other"],
    [
      "Events",
      fmt(stats.totalEvents),
      fmt(stats.markdownCreated),
      fmt(stats.markdownUpdated),
      fmt(stats.markdownUnchanged),
      "-",
    ],
    [
      "Venues",
      fmt(stats.totalVenues),
      fmt(stats.venuesCreated),
      fmt(stats.venuesUpdated),
      fmt(stats.venuesUnchanged),
      "-",
    ],
    [
      "Maps",
      fmt(stats.totalVenues),
      fmt(stats.mapsGenerated),
      "-",
      fmt(stats.mapsUnchanged),
      fmtWithSuffix(stats.mapsFailed, "failed"),
    ],
    ["", "", "", "", "", ""],
    [
      "Photo Batches",
      fmt(stats.photoBatchesTotal),
      "-",
      "-",
      fmt(stats.photoBatchesTotal),
      // Show inferred count in Other column
      stats.photoBatchesCreated + stats.photoBatchesUpdated > 0 || stats.photoBatchesUnassigned > 0
        ? `${stats.photoBatchesCreated + stats.photoBatchesUpdated} inferred${stats.photoBatchesUnassigned > 0 ? `, ${stats.photoBatchesUnassigned} unassigned` : ""}`
        : "-",
    ],
    [
      "Gallery Images",
      fmt(stats.galleryImagesDownloaded + stats.galleryImagesUnchanged),
      fmt(stats.galleryImagesDownloaded),
      "-",
      fmt(stats.galleryImagesUnchanged),
      fmtWithSuffix(stats.galleryImagesDeleted, "deleted"),
    ],
  ];

  // Calculate column widths dynamically
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
    if (row[0] === "") {
      return; // Skip empty separator rows
    }
    const formattedRow = row
      .map((cell, i) => {
        return i === 0 ? cell.padEnd(colWidths[i]) : cell.padStart(colWidths[i]);
      })
      .join("");
    logger.info(formattedRow);
  });

  if (stats.photoBatchesUnassigned > 0) {
    logger.warn(
      `${stats.photoBatchesUnassigned} photo batch(es) could not be assigned to any event`,
    );
  }

  // Report map generation issues
  if (stats.mapsFailed > 0) {
    logger.section("Map Generation Issues");
    if (stats.mapsFailed === stats.totalVenues) {
      logger.warn("All map generations failed. Common causes:");
      logger.warn("  1. Missing API key - Create .env.local with STADIA_MAPS_API_KEY");
      logger.warn(
        "  2. Or change CHOSEN_PROVIDER in scripts/import-data/maps.ts to a free provider",
      );
      logger.info("See .env.local.example for more details");
    } else {
      logger.warn(`${stats.mapsFailed} map(s) failed to generate. Check error messages above.`);
    }
  }

  if (unmatchedCities.length > 0) {
    logger.section("Unmatched Cities (not found in cityMap)");
    unmatchedCities.forEach(({ city, venueId, venueName }) => {
      logger.warn(`  - "${city}" (Venue ID: ${venueId}, Name: "${venueName}")`);
    });
    logger.warn(`Total unmatched cities: ${unmatchedCities.length}`);
  } else {
    logger.success("All cities were successfully mapped!");
  }

  // Create meta.json
  logger.section("Creating Metadata");

  // Calculate nextEventEnds - the end time of the next upcoming event
  let nextEventEnds: string | null = null;

  // Convert events to match the EventWithDateTime interface
  const allEvents = [];
  for (const [, groupData] of Object.entries(eventsWithVenuesJSON.groups)) {
    for (const event of groupData.events) {
      allEvents.push({
        data: {
          dateTime: new Date(event.time),
          duration: event.duration ? Math.round(event.duration / 60000) : undefined,
        },
        // Keep additional properties for logging
        title: event.title,
        id: event.id,
      });
    }
  }

  // Get upcoming events using the existing filter
  const upcomingEvents = filterUpcomingEvents(allEvents);

  if (upcomingEvents.length > 0) {
    // Sort by end time to get the event that will end soonest
    upcomingEvents.sort((a, b) => {
      const aEndTime = getEventEndTimeWithBuffer(a).getTime();
      const bEndTime = getEventEndTimeWithBuffer(b).getTime();
      return aEndTime - bEndTime;
    });

    // Get the event that will end soonest
    const nextEventToEnd = upcomingEvents[0];
    const endTime = getEventEndTimeWithBuffer(nextEventToEnd);
    nextEventEnds = endTime.toISOString();

    logger.info(`Next event ends: ${nextEventEnds} (Event: "${nextEventToEnd.title}")`);
  } else {
    logger.info("No upcoming events found");
  }

  const metaData = {
    commitDate: commitInfo.date,
    commitHash: commitInfo.sha,
    repository: "https://github.com/oktechjp/public",
    nextEventEnds,
  };

  const metaPath = path.join(CONTENT_DIR, "meta.json");
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.writeFile(metaPath, JSON.stringify(metaData, null, 2));
  logger.success(`Created ${metaPath}`);
}
