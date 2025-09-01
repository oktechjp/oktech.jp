import matter from "gray-matter";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import slugify from "slugify";

import { VENUES_BASE_DIR } from "./constants";
import { logger } from "./logger";
import { generateStaticMap } from "./maps";
import type { ImportStatistics } from "./statistics";
import type { Venue } from "./types";
import { doubleQuoteYamlEngine } from "./yaml-engine";

interface UnmatchedCity {
  city: string;
  venueId: string;
  venueName: string;
}

export const unmatchedCities: UnmatchedCity[] = [];

// Fuzzy match function for cities with Japanese support
function fuzzyMatchCity(city: string): string | null {
  const lowercaseCity = city.toLowerCase();

  const patternCollection = [
    { patterns: ["osaka", "大阪", "おおさか"], result: "osaka" },
    { patterns: ["kyoto", "京都", "きょうと"], result: "kyoto" },
  ];

  for (const { patterns, result } of patternCollection) {
    for (const pattern of patterns) {
      if (city.includes(pattern) || lowercaseCity.includes(pattern.toLowerCase())) {
        return result;
      }
    }
  }

  return null;
}

export async function processVenue(
  venue: Venue,
  overwriteMaps: boolean,
  stats: ImportStatistics,
  overwriteMapsTheme?: "light" | "dark" | null,
): Promise<void> {
  // IMPORTANT: This function preserves existing markdown body content in venue files
  // Only the frontmatter is updated during import - any manually written descriptions
  // in the markdown body will be preserved

  const nameSlug = slugify(venue.name, { lower: true, strict: true });
  const slugSuffix = nameSlug || slugify(venue.address, { lower: true, strict: true }) || "venue";
  const slug = slugify(`${venue.id}-${slugSuffix}`, { lower: true, strict: true });

  const venueDir = path.join(VENUES_BASE_DIR, slug);
  await fs.mkdir(venueDir, { recursive: true });
  const mdPath = path.join(venueDir, "venue.md");

  const newFrontmatter: Record<string, unknown> = {
    title: venue.name.trim(),
  };

  // Add non-empty fields to frontmatter
  if (venue.city) {
    const fuzzyMatch = fuzzyMatchCity(venue.city);
    if (fuzzyMatch) {
      newFrontmatter.city = fuzzyMatch;
      if (venue.city.toLowerCase() !== fuzzyMatch) {
        logger.debug(`Fuzzy matched "${venue.city}" → "${fuzzyMatch}" for venue "${venue.name}"`);
      }
    } else {
      const lowercaseCity = venue.city.toLowerCase();
      newFrontmatter.city = lowercaseCity;
      unmatchedCities.push({
        city: venue.city,
        venueId: venue.id,
        venueName: venue.name,
      });
    }
  }

  if (venue.address) {
    newFrontmatter.address = venue.address.trim();
  }

  if (venue.state) {
    newFrontmatter.state = venue.state.trim();
  }

  if (venue.gmaps) {
    newFrontmatter.gmaps = venue.gmaps.trim();
  }

  if (venue.lat && venue.lng) {
    newFrontmatter.coordinates = {
      lat: venue.lat,
      lng: venue.lng,
    };
  }

  newFrontmatter.meetupId = parseInt(venue.id);

  // Check if venue already exists
  if (existsSync(mdPath)) {
    const existing = matter.read(mdPath);
    const merged = { ...existing.data, ...newFrontmatter };

    // Preserve existing markdown body content
    const existingBody = existing.content || "";
    const content = matter.stringify(existingBody, merged, {
      engines: { yaml: doubleQuoteYamlEngine },
    });
    const existingContent = await fs.readFile(mdPath, "utf-8");

    if (content !== existingContent) {
      await fs.writeFile(mdPath, content);
      logger.info(`Updated venue → ${mdPath}`);
      stats.venuesUpdated++;
    } else {
      stats.venuesUnchanged++;
    }
  } else {
    const content = matter.stringify("", newFrontmatter, {
      engines: { yaml: doubleQuoteYamlEngine },
    });
    await fs.writeFile(mdPath, content);
    logger.success(`Created venue → ${mdPath}`);
    stats.venuesCreated++;
  }

  // Handle map generation
  if (venue.lat && venue.lng) {
    const mapFileName = "map.jpg";
    const mapDarkFileName = "map-dark.jpg";
    const mapPath = path.join(venueDir, mapFileName);
    const mapDarkPath = path.join(venueDir, mapDarkFileName);

    // Check if both maps already exist first to avoid unnecessary API calls
    const lightMapExists = existsSync(mapPath);
    const darkMapExists = existsSync(mapDarkPath);

    // Determine which maps to generate based on theme parameter
    const shouldGenerateLight =
      overwriteMapsTheme === null ||
      overwriteMapsTheme === undefined ||
      overwriteMapsTheme === "light";
    const shouldGenerateDark =
      overwriteMapsTheme === null ||
      overwriteMapsTheme === undefined ||
      overwriteMapsTheme === "dark";

    if (lightMapExists && darkMapExists && !overwriteMaps) {
      stats.mapsUnchanged += 2;
    } else {
      // Generate light mode map if needed
      if (shouldGenerateLight && (!lightMapExists || overwriteMaps)) {
        const mapGenerated = await generateStaticMap(
          mapPath,
          {
            lat: venue.lat,
            lng: venue.lng,
          },
          false,
        );
        if (mapGenerated) {
          stats.mapsGenerated++;
        } else {
          stats.mapsFailed++;
        }
      } else {
        stats.mapsUnchanged++;
      }

      // Generate dark mode map if needed
      if (shouldGenerateDark && (!darkMapExists || overwriteMaps)) {
        const darkMapGenerated = await generateStaticMap(
          mapDarkPath,
          {
            lat: venue.lat,
            lng: venue.lng,
          },
          true,
        );
        if (darkMapGenerated) {
          stats.mapsGenerated++;
        } else {
          stats.mapsFailed++;
        }
      } else {
        stats.mapsUnchanged++;
      }
    }
  } else {
    logger.debug(`No coordinates for venue ${venue.id} (${venue.name}), skipping map generation`);
    stats.mapsFailed += 2; // Count both light and dark as failed
  }
}
