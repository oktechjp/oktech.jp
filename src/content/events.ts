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

import { FALLBACK_COVER, SHOW_DEV_ENTRIES } from "@/constants";
import { type GalleryImage, getGalleryImages } from "@/content/gallery";
import { type ProcessedVenue, processVenue } from "@/content/venues";
import { isEventUpcoming } from "@/utils/eventFilters";
import { replaceDate } from "@/utils/formatSlug";
import { memoize } from "@/utils/memoize";
import { type ResponsiveImageData, getResponsiveImage } from "@/utils/responsiveImage";

type EventAttachment = { icon: string; title: string; description?: string; url: string };
type EventFrontmatter = {
  cover?: string;
  dateTime: string;
  devOnly?: boolean;
  venue?: number;
  title: string;
  description: string;
  duration?: number;
  topics?: string[];
  howToFindUs?: string;
  meetupId: number;
  links?: Record<string, string>;
  isCancelled?: boolean;
  attachments?: EventAttachment[];
};

type EventEntryData = CollectionEntry<"events">["data"];

export type EventEnriched = Omit<CollectionEntry<"events">, "data"> & {
  data: Omit<EventEntryData, "cover"> & {
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
  priority?: boolean;
};

export const eventsCollection = defineCollection({
  loader: eventsLoader,
  schema: eventsSchema,
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
    attachments: z
      .array(
        z.object({
          icon: z.string(),
          title: z.string(),
          description: z.string().optional(),
          url: z.string(),
        }),
      )
      .optional(),
  });
}

export async function eventsLoader() {
  return Object.entries(
    import.meta.glob<MarkdownInstance<EventFrontmatter>>("/content/events/**/event.md", {
      eager: true,
    }),
  ).map(([filePath, { frontmatter }]) => {
    // Validate date/time format
    if (!/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/.test(frontmatter.dateTime)) {
      throw new Error(`Invalid date/time format for ${filePath}: ${frontmatter.dateTime}`);
    }
    const [date, time] = frontmatter.dateTime.split(" ");
    const dateTime = new Date(`${date}T${time}:00+09:00`);
    if (Number.isNaN(dateTime.getTime())) {
      throw new Error(`Invalid date/time for ${filePath}: ${frontmatter.dateTime}`);
    }
    const directory = path.dirname(filePath);
    return {
      id: path.basename(directory),
      dateTime,
      cover: frontmatter.cover ? path.join(directory, frontmatter.cover) : FALLBACK_COVER,
      venue: frontmatter.venue ? String(frontmatter.venue) : undefined,
      devOnly: Boolean(frontmatter.devOnly),
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

export const getEvent = memoize(async (eventSlug: string) => {
  const eventSlugWithoutDate = replaceDate(eventSlug);
  const event = await getEntry("events", eventSlugWithoutDate);
  if (!event) throw new Error(`No event found for slug ${eventSlug}`);
  let venueSlug: string | undefined;
  let venueData: ProcessedVenue | undefined;
  if (event.data.venue) {
    const venues = await getCollection("venues");
    const venueId = typeof event.data.venue === "object" ? event.data.venue.id : event.data.venue;
    const venue = venues.find((v) => v.data.meetupId.toString() === venueId?.toString());
    if (venue) {
      venueData = await processVenue(venue);
      venueSlug = venue.id;
    }
  }
  const galleryImages = await getGalleryImages(event.id);
  const [coverCompact, coverPolaroid, coverBig, coverPage, coverProjector] = await Promise.all([
    getResponsiveImage(event.data.cover, "eventCompact"),
    getResponsiveImage(event.data.cover, "eventPolaroid"),
    getResponsiveImage(event.data.cover, "eventBig"),
    getResponsiveImage(event.data.cover, "sidebarLayoutHero"),
    getResponsiveImage(event.data.cover, "galleryLightbox"),
  ]);
  return {
    ...event,
    data: { ...event.data, coverCompact, coverPolaroid, coverBig, coverPage, coverProjector },
    venue: venueData,
    venueSlug,
    galleryImages,
  };
});

export const getEvents = memoize(async (limitRecent?: number): Promise<EventEnriched[]> => {
  const events = await getCollection("events");
  const relevant = SHOW_DEV_ENTRIES ? events : events.filter((entry) => !entry.data.devOnly);
  const enriched = await Promise.all(relevant.map((entry) => getEvent(entry.id)));
  const prioritized = enriched
    .sort((a, b) => new Date(b.data.dateTime).getTime() - new Date(a.data.dateTime).getTime())
    .map((event, index) => ({ ...event, priority: index < 16 }));
  if (limitRecent === undefined) return prioritized;
  const upcomingIndex = prioritized.findIndex((event) => !isEventUpcoming(event));
  return prioritized.slice(0, upcomingIndex + limitRecent);
});
