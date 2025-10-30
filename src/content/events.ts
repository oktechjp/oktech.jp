import type { MarkdownInstance } from "astro";
import {
  type CollectionEntry,
  defineCollection,
  getCollection,
  getEntry,
  reference,
  z,
} from "astro:content";
import path from "path";

import { SHOW_DEV_ENTRIES } from "@/constants";
import { isEventUpcoming } from "@/utils/eventFilters";
import { memoize } from "@/utils/memoize";
import {
  type ImageDimensions,
  type ResponsiveImageData,
  getImageDimensions,
  getResponsiveImage,
} from "@/utils/responsiveImage";

import { type ProcessedVenue, processVenue } from "./venues";

// Type definitions
export type GalleryImage = CollectionEntry<"eventGalleryImage"> & {
  thumbnail: ResponsiveImageData;
  full: ResponsiveImageData;
  dimensions: ImageDimensions;
};

// Enriched event type that combines CollectionEntry with processed data
export type EventEnriched = Omit<CollectionEntry<"events">, "data"> & {
  data: Omit<CollectionEntry<"events">["data"], "cover"> & {
    coverCompact: ResponsiveImageData;
    coverPolaroid: ResponsiveImageData;
    coverBig: ResponsiveImageData;
    coverPage: ResponsiveImageData;
    coverProjector: ResponsiveImageData;
    isCancelled?: boolean;
  };
  venue?: ProcessedVenue;
  venueSlug?: string;
  galleryImages?: GalleryImage[];
  priority?: boolean; // For image loading optimization
};

// TODO ?
type Attachment = {
  icon: string;
  title: string;
  description?: string;
  url: string;
};

type EventFrontmatter = {
  cover?: string;
  dateTime: string;
  devOnly?: boolean;
  venue: number;
  title: string;
  description: string;
  duration?: number;
  topics?: string[];
  howToFindUs?: string;
  meetupId: number;
  links?: Record<string, string>;
  isCancelled?: boolean;
  attachments?: Attachment[];
};

type EventMarkdownModule = MarkdownInstance<EventFrontmatter>;

const TIMESTAMP_REGEX = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/;

// Events collection definition
export const eventsCollection = defineCollection({
  loader: eventsLoader,
  schema: eventsSchema,
});

async function eventsLoader() {
  const imports = import.meta.glob<EventMarkdownModule>("/content/events/**/event.md", {
    eager: true,
  });
  return Object.entries(imports).map(([filePath, { frontmatter }]) => {
    const dirname = path.dirname(filePath);

    // Ensure YYYY-MM-DD HH:MM format
    if (!TIMESTAMP_REGEX.test(frontmatter.dateTime)) {
      throw new Error(`Invalid date/time format for ${filePath}: ${frontmatter.dateTime}`);
    }
    // Convert to UTC from JST (+09:00)
    const [date, time] = frontmatter.dateTime.split(" ");
    const dateTimeStr = `${date}T${time}:00+09:00`;
    const dateTime = new Date(dateTimeStr);
    if (isNaN(dateTime.getTime())) {
      throw new Error(`Invalid date/time for ${filePath}: ${dateTimeStr}`);
    }

    return {
      id: path.basename(dirname),
      dateTime,
      cover: frontmatter.cover && path.join(dirname, frontmatter.cover),
      venue: frontmatter.venue ? String(frontmatter.venue) : undefined,
      devOnly: !!frontmatter.devOnly,
      title: frontmatter.title,
      description: frontmatter.description,
      duration: frontmatter.duration,
      topics: frontmatter.topics,
      howToFindUs: frontmatter.howToFindUs,
      meetupId: frontmatter.meetupId,
      links: frontmatter.links,
      isCancelled: frontmatter.isCancelled,
      attachments: frontmatter.attachments,
    };
  });
}

const attachmentSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string().optional(),
  url: z.string(),
});

function eventsSchema() {
  return z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    readingTime: z.string().optional(),
    dateTime: z.date(),
    duration: z.number().optional(),
    cover: z.string(),
    devOnly: z.boolean().optional().default(false),
    venue: reference("venues").optional(),
    topics: z.array(z.string()).optional(),
    howToFindUs: z.string().optional(),
    meetupId: z.number(),
    links: z.record(z.string()).optional(),
    isCancelled: z.boolean().optional(),
    attachments: z.array(attachmentSchema).optional(),
  });
}
// Event gallery images collection definition
export const eventGalleryImageCollection = defineCollection({
  loader: async () => {
    const [images, metadata] = await Promise.all([
      import.meta.glob("/content/events/**/gallery/*.{webp,jpg,jpeg,png,gif,svg}"),
      import.meta.glob("/content/events/**/gallery/*.yaml", { eager: true }),
    ]);

    return Object.entries(images).map(([id]) => {
      const metaDataPath = `${id}.yaml`;
      const metaDataModule = metadata[metaDataPath] as
        | { default: Record<string, unknown> }
        | undefined;
      const imageMetadata = metaDataModule?.default as Record<string, unknown>;
      const event = id.split("/").slice(0, -2).pop();
      return { ...imageMetadata, id, event, image: id };
    });
  },
  schema: () =>
    z.object({
      id: z.string(),
      image: z.string(), // Changed from image() to z.string()
      event: reference("events"),
      caption: z.string().optional(), // todo add more metadatas?
    }),
});

// Helper function to get gallery images with responsive data
export const getGalleryImages = memoize(async (eventId: string): Promise<GalleryImage[]> => {
  const allGalleryImages = await getCollection("eventGalleryImage");
  const eventGalleryImages = allGalleryImages.filter((img) => img.data.event.id === eventId);

  return await Promise.all(
    eventGalleryImages.map(async (img) => {
      // Generate responsive data for thumbnail and full images directly from path
      const [thumbnail, full, dimensions] = await Promise.all([
        getResponsiveImage(img.data.image, "galleryThumbnail"),
        getResponsiveImage(img.data.image, "galleryLightbox"),
        getImageDimensions(img.data.image),
      ]);

      return {
        ...img,
        thumbnail,
        full,
        dimensions,
      };
    }),
  );
});

// Export memoized functions
export const getEvents = memoize(
  async (limitRecent: number | undefined = undefined): Promise<EventEnriched[]> => {
    const allEvents = await getCollection("events");

    // Filter out devOnly events in production

    const filteredEvents = SHOW_DEV_ENTRIES
      ? allEvents
      : allEvents.filter((event) => !event.data.devOnly);

    // Enrich each event with venue and gallery data using getEvent logic
    const enrichedEvents = await Promise.all(filteredEvents.map((event) => getEvent(event.id)));

    // Sort events by date (newest first) and add priority flag for first 16
    const sortedEvents = enrichedEvents.sort((a, b) => {
      const dateA = new Date(a.data.dateTime).getTime();
      const dateB = new Date(b.data.dateTime).getTime();
      return dateB - dateA;
    });

    // Add priority flag to first 16 events for optimized image loading
    const mappedEvents = sortedEvents.map((event, index) => ({
      ...event,
      priority: index < 16,
    }));

    if (limitRecent !== undefined) {
      const upcomingIndex = mappedEvents.findIndex((event) => !isEventUpcoming(event));
      return mappedEvents.slice(0, upcomingIndex + limitRecent);
    }

    return mappedEvents;
  },
);

export const getEvent = memoize(async (eventSlug: string): Promise<EventEnriched> => {
  const event = await getEntry("events", eventSlug);

  if (!event) {
    throw new Error(`No event found for slug ${eventSlug}`);
  }

  // Get venue data if the event has a venue reference
  let processedVenue: ProcessedVenue | undefined;
  let venueSlug: string | undefined;
  if (event.data.venue) {
    const venues = await getCollection("venues");
    // Handle both object with id and plain number/string
    const venueId = typeof event.data.venue === "object" ? event.data.venue.id : event.data.venue;
    const venue = venues.find((v) => v.data.meetupId.toString() === venueId?.toString());
    if (venue) {
      processedVenue = await processVenue(venue);
      venueSlug = venue.id;
    }
  }

  // Get gallery images for this event with responsive data
  const galleryImages = await getGalleryImages(event.id);

  // Generate responsive cover images for different layouts
  const [coverCompact, coverPolaroid, coverBig, coverPage, coverProjector] = await Promise.all([
    getResponsiveImage(event.data.cover, "eventCompact"),
    getResponsiveImage(event.data.cover, "eventPolaroid"),
    getResponsiveImage(event.data.cover, "eventBig"),
    getResponsiveImage(event.data.cover, "sidebarLayoutHero"),
    getResponsiveImage(event.data.cover, "galleryLightbox"),
  ]);

  return {
    ...event,
    data: {
      ...event.data,
      coverCompact,
      coverPolaroid,
      coverBig,
      coverPage,
      coverProjector,
    },
    venue: processedVenue,
    venueSlug,
    galleryImages,
  };
});
