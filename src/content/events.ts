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
import { memoize } from "@/utils/memoize";
import {
  type RepeatOverride,
  extractTimeOfDay,
  mergeRepeatOverride,
  parseEventDateTime,
  parseRepeatKey,
} from "@/utils/recurringDates";
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
  space?: string;
  howToFindUs?: string;
  meetupId?: number | string;
  links?: Record<string, string>;
  isCancelled?: boolean;
  attachments?: EventAttachment[];
  recurredFrom?: string;
  repeat?: Record<string, RepeatOverride>;
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
    space: z.string().optional(),
    howToFindUs: z.string().optional(),
    meetupId: z.union([z.number(), z.string()]).optional(),
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
    recurredFrom: z.string().optional(),
    bodySlug: z.string().optional(),
    isNextRecurringOccurrence: z.boolean().optional(),
    calendarOnly: z.boolean().optional(),
  });
}

type LoadedEvent = ReturnType<typeof buildEntry>;

function buildRepeatInstances(
  filePath: string,
  frontmatter: EventFrontmatter,
  parentSlug: string,
  materializedChildSlugs: Set<string>,
  now: Date,
): LoadedEvent[] {
  if (!frontmatter.repeat) return [];

  const entries = Object.entries(frontmatter.repeat)
    .map(([rawKey, raw]) => {
      const override = raw ?? {};
      const time = override.time ?? extractTimeOfDay(frontmatter.dateTime, filePath);
      const { date, slugPrefix } = parseRepeatKey(rawKey, time, filePath);
      return { date, slugPrefix, override };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const baseFrontmatter: EventFrontmatter = {
    ...frontmatter,
    repeat: undefined,
    recurredFrom: parentSlug,
  };
  const firstFutureIndex = entries.findIndex(({ date }) => date.getTime() > now.getTime());

  return entries.flatMap(({ date, slugPrefix, override }, index) => {
    const instanceSlug = `${slugPrefix}-${parentSlug}`;
    if (materializedChildSlugs.has(instanceSlug)) return [];

    const isFuture = date.getTime() > now.getTime();
    const isNext = index === firstFutureIndex;
    const instanceFrontmatter = mergeRepeatOverride(baseFrontmatter, override);

    return [
      buildEntry(filePath, instanceFrontmatter, {
        id: instanceSlug,
        dateTime: date,
        bodySlug: parentSlug,
        isCancelled: instanceFrontmatter.isCancelled || undefined,
        isNextRecurringOccurrence: isNext,
        calendarOnly: isFuture && !isNext,
      }),
    ];
  });
}

function buildEntry(
  filePath: string,
  frontmatter: EventFrontmatter,
  overrides: {
    id?: string;
    dateTime?: Date;
    bodySlug?: string;
    isNextRecurringOccurrence?: boolean;
    isCancelled?: boolean;
    calendarOnly?: boolean;
  } = {},
) {
  const directory = path.dirname(filePath);
  const dateTime = overrides.dateTime ?? parseEventDateTime(frontmatter.dateTime, filePath);
  return {
    id: overrides.id ?? path.basename(directory),
    dateTime,
    cover: frontmatter.cover ? path.join(directory, frontmatter.cover) : FALLBACK_COVER,
    venue: frontmatter.venue ? String(frontmatter.venue) : undefined,
    devOnly: Boolean(frontmatter.devOnly),
    title: frontmatter.title,
    description: frontmatter.description,
    duration: frontmatter.duration,
    topics: frontmatter.topics,
    space: frontmatter.space,
    howToFindUs: frontmatter.howToFindUs,
    meetupId: frontmatter.meetupId,
    links: frontmatter.links,
    isCancelled: overrides.isCancelled ?? frontmatter.isCancelled,
    attachments: frontmatter.attachments,
    recurredFrom: frontmatter.recurredFrom,
    bodySlug: overrides.bodySlug,
    isNextRecurringOccurrence: overrides.isNextRecurringOccurrence,
    calendarOnly: overrides.calendarOnly,
  };
}

export async function eventsLoader() {
  const files = Object.entries(
    import.meta.glob<MarkdownInstance<EventFrontmatter>>("/content/events/**/event.md", {
      eager: true,
    }),
  );

  const standalone: LoadedEvent[] = [];
  const repeatParents: { filePath: string; frontmatter: EventFrontmatter; parentSlug: string }[] = [];
  const materializedChildSlugs = new Set<string>();

  for (const [filePath, mod] of files) {
    const { frontmatter } = mod;
    const parentSlug = path.basename(path.dirname(filePath));
    if (frontmatter.repeat) {
      repeatParents.push({ filePath, frontmatter, parentSlug });
      continue;
    }
    if (frontmatter.recurredFrom) materializedChildSlugs.add(parentSlug);
    standalone.push(buildEntry(filePath, frontmatter));
  }

  const now = new Date();
  const ephemeral = repeatParents.flatMap(({ filePath, frontmatter, parentSlug }) =>
    buildRepeatInstances(filePath, frontmatter, parentSlug, materializedChildSlugs, now),
  );

  return [...standalone, ...ephemeral];
}

export const getEvent = memoize(async (eventSlug: string) => {
  const event = await getEntry("events", eventSlug);
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

export const getEvents = memoize(
  async (
    limitRecent?: number,
    options?: { includeCalendarOnly?: boolean },
  ): Promise<EventEnriched[]> => {
    const events = await getCollection("events");
    let relevant = SHOW_DEV_ENTRIES ? events : events.filter((entry) => !entry.data.devOnly);
    if (!options?.includeCalendarOnly) {
      relevant = relevant.filter((entry) => !entry.data.calendarOnly);
    }
    const enriched = await Promise.all(relevant.map((entry) => getEvent(entry.id)));
    const prioritized = enriched
      .sort((a, b) => new Date(b.data.dateTime).getTime() - new Date(a.data.dateTime).getTime())
      .map((event, index) => ({ ...event, priority: index < 16 }));
    if (limitRecent === undefined) return prioritized;
    const upcomingIndex = prioritized.findIndex((event) => !isEventUpcoming(event));
    return prioritized.slice(0, upcomingIndex + limitRecent);
  },
);
