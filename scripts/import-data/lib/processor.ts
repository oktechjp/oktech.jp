import matter from "gray-matter";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import slugify from "slugify";
import { parse, stringify } from "yaml";

import { config } from "./config";
import { GitHubService } from "./github";
import { logger } from "./logger";
import { MapService } from "./maps";
import { type ExternalPhoto, PhotoService } from "./photos";

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
    const contentDir = path.dirname(contentPath);

    // Ensure directory exists
    await fs.mkdir(contentDir, { recursive: true });

    // Get frontmatter and body
    const newFrontmatter = this.getFrontmatter(item);
    const body = this.getContentBody(item);

    // Check if content already exists
    if (existsSync(contentPath)) {
      return await this.updateContent(contentPath, newFrontmatter, body);
    } else {
      return await this.createContent(contentPath, newFrontmatter, body);
    }
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

    await fs.writeFile(contentPath, content);
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
      await fs.writeFile(contentPath, content);
      logger.info(`Updated → ${contentPath}`);
      return { created: false, updated: true, unchanged: false };
    } else {
      return { created: false, updated: false, unchanged: true };
    }
  }
}

/**
 * Event processor
 */
export class EventProcessor extends ContentProcessor<ExternalEvent> {
  private photos: Record<string, ExternalPhoto[]> = {};

  setPhotos(photos: Record<string, ExternalPhoto[]>) {
    this.photos = photos;
  }

  getSlug(event: ExternalEvent): string {
    return slugify(`${event.id}-${event.title}`, { lower: true, strict: true });
  }

  getContentPath(event: ExternalEvent): string {
    const slug = this.getSlug(event);
    return path.join(config.paths.events, slug, "event.md");
  }

  getFrontmatter(event: ExternalEvent): Record<string, unknown> {
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

    if (event.duration) {
      frontmatter.duration = Math.round(event.duration / 60000);
    }

    if (event.topics && event.topics.length > 0) {
      frontmatter.topics = event.topics;
    }

    frontmatter.meetupId = parseInt(event.id);
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

  getContentBody(event: ExternalEvent): string {
    return `\n${event.description || ""}`;
  }

  /**
   * Process event with photos and cover image
   */
  async processWithExtras(
    event: ExternalEvent,
    group: string,
  ): Promise<{ created: boolean; updated: boolean; unchanged: boolean; galleryStats: any }> {
    const slug = this.getSlug(event);
    const eventDir = path.join(config.paths.events, slug);
    const contentPath = this.getContentPath(event);

    // Process cover image if available
    let coverFilename: string | undefined;
    if (event.image && event.image.location) {
      coverFilename = await this.processCoverImage(event, eventDir);
    }

    // Build frontmatter in the correct order
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

    if (event.duration) {
      frontmatter.duration = Math.round(event.duration / 60000);
    }

    // Add cover after dateTime/duration
    if (coverFilename) {
      frontmatter.cover = `./${coverFilename}`;
    }

    if (event.topics && event.topics.length > 0) {
      frontmatter.topics = event.topics;
    }

    frontmatter.meetupId = parseInt(event.id);
    frontmatter.group = parseInt(group);
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

    // Get body content
    const body = this.getContentBody(event);

    // Create or update the content with modified frontmatter
    await fs.mkdir(eventDir, { recursive: true });
    let result: { created: boolean; updated: boolean; unchanged: boolean };

    if (existsSync(contentPath)) {
      result = await this.updateContent(contentPath, frontmatter, body);
    } else {
      result = await this.createContent(contentPath, frontmatter, body);
    }

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
    try {
      await fs.access(coverLocalPath);
      // logger.info(`Cover already exists → ${coverLocalPath}`);
      return coverBasename;
    } catch {
      // File doesn't exist, download it
    }

    try {
      // Ensure directory exists before downloading
      await fs.mkdir(eventDir, { recursive: true });

      // Build full URL for the image
      const imageUrl = config.github.getRawBaseUrl() + event.image.location;
      const imageBuffer = await this.github.downloadFile(imageUrl);

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

      await fs.writeFile(coverLocalPath, processedBuffer);
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

  getContentBody(venue: ExternalVenue): string {
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
