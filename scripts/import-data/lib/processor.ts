import matter from "gray-matter";
import { existsSync, readdirSync } from "node:fs";
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import slugify from "slugify";
import { parse, stringify } from "yaml";

import { config } from "./config";
import { GitHubService } from "./github";
import { logger } from "./logger";
import { MapService } from "./maps";
import { type ExternalPhoto, type GalleryStats, PhotoService } from "./photos";
import { normalizeMarkdown, pathExists, writeFileEnsured } from "./utils";

/**
 * Custom YAML engine for gray-matter that uses double quotes for strings
 */
const doubleQuoteYamlEngine = {
  parse: (str: string) => {
    return parse(str);
  },
  stringify: (obj: any) => {
    return stringify(obj, {
      defaultStringType: "PLAIN",
      defaultKeyType: "PLAIN",
      lineWidth: 0,
      doubleQuotedAsJSON: true,
      singleQuote: false,
    });
  },
};

// External JSON types for events and venues
export type ExternalEvent = {
  description: string;
  duration: number;
  feeSettings: null;
  id: string;
  isCancelled?: boolean;
  image?: {
    location: string; // Path to the image file
    date?: number; // Timestamp when image was added
  };
  maxTickets: number;
  numberOfAllowedGuests: number;
  time: number;
  title: string;
  topics: string[];
  venue: string;
  howToFindUs?: string;
  links?: Record<string, string>;
};

export type ExternalVenue = {
  address: string;
  city: string;
  country: string;
  crossStreet: string | null;
  gmaps?: string;
  id: string;
  lat: number;
  lng: number;
  name: string;
  postalCode: string;
  state: string;
};

/**
 * Base processor for content items
 */
export abstract class ContentProcessor<T> {
  constructor(
    protected github: GitHubService,
    protected mapService: MapService,
    protected photoService: PhotoService,
  ) {}

  abstract getSlug(item: T): string;
  abstract getFrontmatter(item: T): Record<string, unknown>;
  abstract getContentPath(item: T): string;
  abstract getContentBody(item: T): string;

  /**
   * Process a content item
   */
  async process(item: T): Promise<{ created: boolean; updated: boolean; unchanged: boolean }> {
    const contentPath = this.getContentPath(item);
    const newFrontmatter = this.getFrontmatter(item);
    const body = this.getContentBody(item);

    return this.writeContent(contentPath, newFrontmatter, body);
  }

  /**
   * Create new content
   */
  protected async createContent(
    contentPath: string,
    frontmatter: Record<string, unknown>,
    body: string,
  ): Promise<{ created: boolean; updated: boolean; unchanged: boolean }> {
    const content = matter.stringify(body, frontmatter, {
      engines: { yaml: doubleQuoteYamlEngine },
    });

    await writeFileEnsured(contentPath, content);
    logger.success(`Created → ${contentPath}`);

    return { created: true, updated: false, unchanged: false };
  }

  /**
   * Update existing content
   */
  protected async updateContent(
    contentPath: string,
    newFrontmatter: Record<string, unknown>,
    newBody: string,
  ): Promise<{ created: boolean; updated: boolean; unchanged: boolean }> {
    const existing = matter.read(contentPath);
    const merged = { ...existing.data, ...newFrontmatter };

    // Preserve existing body if no new body provided
    const body = newBody || existing.content || "";

    const content = matter.stringify(body, merged, {
      engines: { yaml: doubleQuoteYamlEngine },
    });

    const existingContent = await fs.readFile(contentPath, "utf-8");

    if (content !== existingContent) {
      await writeFileEnsured(contentPath, content);
      logger.info(`Updated → ${contentPath}`);
      return { created: false, updated: true, unchanged: false };
    } else {
      return { created: false, updated: false, unchanged: true };
    }
  }

  /**
   * Persist content to disk, creating or updating as needed
   */
  protected async writeContent(
    contentPath: string,
    frontmatter: Record<string, unknown>,
    body: string,
  ): Promise<{ created: boolean; updated: boolean; unchanged: boolean }> {
    if (existsSync(contentPath)) {
      return this.updateContent(contentPath, frontmatter, body);
    }

    return this.createContent(contentPath, frontmatter, body);
  }
}

/**
 * Event processor
 */
export class EventProcessor extends ContentProcessor<ExternalEvent> {
  private photos: Record<string, ExternalPhoto[]> = {};
  private existingSlugsByMeetupId = new Map<string, string>();
  private slugIndexInitialized = false;

  private ensureSlugIndex(): void {
    if (this.slugIndexInitialized) return;
    this.slugIndexInitialized = true;

    let entries: Dirent[] = [];

    try {
      entries = readdirSync(config.paths.events, { withFileTypes: true });
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code !== "ENOENT") {
        logger.warn(`Unable to index existing events directory: ${error.message}`);
      }
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const slug = entry.name;
      const eventFilePath = path.join(config.paths.events, slug, "event.md");
      if (!existsSync(eventFilePath)) continue;

      try {
        const existing = matter.read(eventFilePath);
        const meetupId = existing.data?.meetupId;
        if (meetupId === undefined || meetupId === null) continue;

        const meetupIdKey = meetupId.toString();
        const knownSlug = this.existingSlugsByMeetupId.get(meetupIdKey);

        if (knownSlug && knownSlug !== slug) {
          logger.warn(
            `Multiple slugs detected for meetupId ${meetupIdKey}. Keeping existing slug "${knownSlug}", ignoring "${slug}".`,
          );
          continue;
        }

        this.existingSlugsByMeetupId.set(meetupIdKey, slug);
      } catch (err) {
        const error = err as Error;
        logger.warn(`Failed to read existing event metadata at ${eventFilePath}: ${error.message}`);
      }
    }
  }

  setPhotos(photos: Record<string, ExternalPhoto[]>) {
    this.photos = photos;
  }

  getSlug(event: ExternalEvent): string {
    this.ensureSlugIndex();

    const meetupIdKey = event.id.toString();
    const existingSlug = this.existingSlugsByMeetupId.get(meetupIdKey);
    if (existingSlug) {
      return existingSlug;
    }

    const newSlug = slugify(`${event.id}-${event.title}`, { lower: true, strict: true });
    this.existingSlugsByMeetupId.set(meetupIdKey, newSlug);
    return newSlug;
  }

  getContentPath(event: ExternalEvent): string {
    const slug = this.getSlug(event);
    return path.join(config.paths.events, slug, "event.md");
  }

  private buildEventFrontmatter(
    event: ExternalEvent,
    context: { group?: number | string; cover?: string } = {},
  ): Record<string, unknown> {
    const date = new Date(event.time).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo",
    });
    const time = new Date(event.time).toLocaleTimeString("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Tokyo",
    });

    const frontmatter: Record<string, unknown> = {
      title: event.title.trim(),
      dateTime: `${date} ${time}`,
    };

    const { cover, group } = context;

    if (event.duration) {
      frontmatter.duration = Math.round(event.duration / 60000);
    }

    if (cover) {
      frontmatter.cover = cover;
    }

    if (event.topics && event.topics.length > 0) {
      frontmatter.topics = event.topics;
    }

    if (typeof event.isCancelled === "boolean") {
      frontmatter.isCancelled = event.isCancelled;
    }

    frontmatter.meetupId = parseInt(event.id);
    if (group !== undefined) {
      const parsedGroup =
        typeof group === "string" ? Number.parseInt(group, 10) : Math.trunc(group);
      if (!Number.isNaN(parsedGroup)) {
        frontmatter.group = parsedGroup;
      }
    }
    frontmatter.venue = parseInt(event.venue);

    if (event.howToFindUs) {
      frontmatter.howToFindUs = event.howToFindUs;
    }

    // Handle links structure
    if (event.links) {
      // Validate known link types
      const knownLinkTypes = ["linkedIn", "luma", "discord"];
      for (const key of Object.keys(event.links)) {
        if (key === "meetup") {
          logger.warn(
            `Event ${event.id} has "meetup" in links object. Meetup URLs should be generated from meetupId field instead.`,
          );
        } else if (!knownLinkTypes.includes(key)) {
          logger.warn(
            `Unknown link type "${key}" in event ${event.id}. Consider adding it to the presets.`,
          );
        }
      }
      frontmatter.links = event.links;
    }

    return frontmatter;
  }

  getFrontmatter(event: ExternalEvent): Record<string, unknown> {
    return this.buildEventFrontmatter(event);
  }

  getContentBody(event: ExternalEvent): string {
    const description = normalizeMarkdown(event.description || "");
    return `\n${description}`;
  }

  /**
   * Process event with photos and cover image
   */
  async processWithExtras(
    event: ExternalEvent,
    group: string,
  ): Promise<{
    created: boolean;
    updated: boolean;
    unchanged: boolean;
    galleryStats: GalleryStats;
  }> {
    const slug = this.getSlug(event);
    const eventDir = path.join(config.paths.events, slug);
    const contentPath = this.getContentPath(event);

    // Process cover image if available
    let coverFilename: string | undefined;
    if (event.image && event.image.location) {
      coverFilename = await this.processCoverImage(event, eventDir);
    }

    const frontmatter = this.buildEventFrontmatter(event, {
      group,
      cover: coverFilename ? `./${coverFilename}` : undefined,
    });
    const body = this.getContentBody(event);

    const result = await this.writeContent(contentPath, frontmatter, body);

    // Process photo gallery
    const eventPhotos = this.photos[event.id] || [];
    const galleryStats = await this.photoService.processGallery(eventDir, eventPhotos);

    return { ...result, galleryStats };
  }

  /**
   * Process cover image for event
   */
  private async processCoverImage(
    event: ExternalEvent,
    eventDir: string,
  ): Promise<string | undefined> {
    if (!event.image?.location) return undefined;

    const coverBasename = path.basename(event.image.location);
    const coverLocalPath = path.join(eventDir, coverBasename);

    // Check if the cover image already exists
    const coverExists = await pathExists(coverLocalPath);
    if (coverExists) {
      return coverBasename;
    }

    try {
      // Build full URL for the image
      const imageBuffer = await this.github.downloadFile(event.image.location);

      // Write cover image as-is without transformation
      await writeFileEnsured(coverLocalPath, imageBuffer);
      logger.success(`Downloaded cover → ${coverLocalPath}`);
      return coverBasename;
    } catch (err) {
      logger.warn(`Failed to download cover image for event ${event.id}: ${err}`);
      return undefined;
    }
  }
}

/**
 * Venue processor
 */
export class VenueProcessor extends ContentProcessor<ExternalVenue> {
  private cityMappings: Record<string, string> = {
    osaka: "osaka",
    大阪: "osaka",
    おおさか: "osaka",
    kyoto: "kyoto",
    京都: "kyoto",
    きょうと: "kyoto",
  };

  getSlug(venue: ExternalVenue): string {
    const nameSlug = slugify(venue.name, { lower: true, strict: true });
    const slugSuffix = nameSlug || slugify(venue.address, { lower: true, strict: true }) || "venue";
    return slugify(`${venue.id}-${slugSuffix}`, { lower: true, strict: true });
  }

  getContentPath(venue: ExternalVenue): string {
    const slug = this.getSlug(venue);
    return path.join(config.paths.venues, slug, "venue.md");
  }

  getFrontmatter(venue: ExternalVenue): Record<string, unknown> {
    const frontmatter: Record<string, unknown> = {
      title: venue.name.trim(),
    };

    // Handle city mapping
    if (venue.city) {
      const normalizedCity = this.normalizeCity(venue.city);
      frontmatter.city = normalizedCity;

      if (!this.cityMappings[venue.city.toLowerCase()]) {
        logger.debug(`Unmatched city: "${venue.city}" for venue "${venue.name}"`);
      }
    }

    if (venue.address) {
      frontmatter.address = venue.address.trim();
    }

    if (venue.state) {
      frontmatter.state = venue.state.trim();
    }

    if (venue.gmaps) {
      frontmatter.gmaps = venue.gmaps.trim();
    }

    if (venue.lat && venue.lng) {
      frontmatter.coordinates = {
        lat: venue.lat,
        lng: venue.lng,
      };
    }

    frontmatter.meetupId = parseInt(venue.id);

    return frontmatter;
  }

  getContentBody(_venue: ExternalVenue): string {
    return ""; // Venues don't have body content by default
  }

  /**
   * Normalize city name
   */
  private normalizeCity(city: string): string {
    const lowercaseCity = city.toLowerCase();

    // Check for exact match
    if (this.cityMappings[lowercaseCity]) {
      return this.cityMappings[lowercaseCity];
    }

    // Check for partial match
    for (const [pattern, result] of Object.entries(this.cityMappings)) {
      if (city.includes(pattern) || lowercaseCity.includes(pattern)) {
        return result;
      }
    }

    // Return lowercase version as fallback
    return lowercaseCity;
  }

  /**
   * Process venue with map generation
   */
  async processWithMaps(
    venue: ExternalVenue,
    overwrite: boolean | "light" | "dark" = false,
  ): Promise<{
    created: boolean;
    updated: boolean;
    unchanged: boolean;
    mapStats: { generated: number; failed: number; unchanged: number };
  }> {
    // Process main content
    const result = await this.process(venue);

    // Generate maps if coordinates available
    let mapStats = { generated: 0, failed: 0, unchanged: 0 };

    if (venue.lat && venue.lng) {
      const slug = this.getSlug(venue);
      const venueDir = path.join(config.paths.venues, slug);

      mapStats = await this.mapService.generateMaps(venueDir, venue.lat, venue.lng, overwrite);
    } else {
      logger.debug(`No coordinates for venue ${venue.id} (${venue.name}), skipping map generation`);
      mapStats.failed = 2; // Count both light and dark as failed
    }

    return { ...result, mapStats };
  }
}
