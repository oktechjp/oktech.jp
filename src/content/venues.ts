import type { MarkdownInstance } from "astro";
import {
  type CollectionEntry,
  type InferEntrySchema,
  defineCollection,
  getCollection,
  getEntry,
  z,
} from "astro:content";
import path from "path";

import { SHOW_DEV_ENTRIES } from "@/constants";
import { memoize } from "@/utils/memoize";
import { type ResponsiveImageData, getResponsiveImage } from "@/utils/responsiveImage";

type VenueFrontmatter = {
  title: string;
  city?: string;
  country?: string;
  address?: string;
  state?: string;
  postalCode?: string;
  url?: string;
  gmaps?: string;
  coordinates?: { lat: number; lng: number };
  meetupId: number;
  hasPage?: boolean;
  description?: string;
  readingTime?: string;
  devOnly?: boolean;
  cover?: string;
};
type VenueMarkdownModule = MarkdownInstance<VenueFrontmatter>;

export type Venue = InferEntrySchema<"venues">;
export type ProcessedVenue = Omit<Venue, "cover" | "mapImage" | "mapDarkImage"> & {
  cover?: ResponsiveImageData;
  mapImage?: ResponsiveImageData;
  mapDarkImage?: ResponsiveImageData;
};
export type VenueEnriched = Omit<CollectionEntry<"venues">, "data"> & { data: ProcessedVenue };

export const venuesCollection = defineCollection({ loader: venuesLoader, schema: venuesSchema });

export async function venuesLoader() {
  const mapImages = import.meta.glob("/content/venues/**/map.jpg");
  const mapDarkImages = import.meta.glob("/content/venues/**/map-dark.jpg");

  return Object.entries(
    import.meta.glob<VenueMarkdownModule>("/content/venues/**/venue.md", {
      eager: true,
    }),
  ).map(([filePath, { frontmatter }]) => {
    const directory = path.dirname(filePath);
    const mapImagePath = path.join(directory, "map.jpg");
    const mapDarkImagePath = path.join(directory, "map-dark.jpg");
    return {
      id: path.basename(directory),
      title: frontmatter.title,
      city: frontmatter.city,
      country: frontmatter.country,
      address: frontmatter.address,
      state: frontmatter.state,
      postalCode: frontmatter.postalCode,
      url: frontmatter.url,
      gmaps: frontmatter.gmaps,
      coordinates: frontmatter.coordinates,
      meetupId: frontmatter.meetupId,
      hasPage: frontmatter.hasPage,
      description: frontmatter.description,
      readingTime: frontmatter.readingTime,
      devOnly: Boolean(frontmatter.devOnly),
      cover: frontmatter.cover ? path.join(directory, frontmatter.cover) : undefined,
      mapImage: mapImages[mapImagePath] ? mapImagePath : undefined,
      mapDarkImage: mapDarkImages[mapDarkImagePath] ? mapDarkImagePath : undefined,
    };
  });
}

function venuesSchema() {
  return z.object({
    id: z.string(),
    title: z.string(),
    city: z.string().optional(),
    country: z.string().optional(),
    address: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    url: z.string().optional(),
    gmaps: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    meetupId: z.number(),
    hasPage: z.boolean().optional(),
    description: z.string().optional(),
    readingTime: z.string().optional(),
    devOnly: z.boolean().optional().default(false),
    cover: z.string().optional(),
    mapImage: z.string().optional(),
    mapDarkImage: z.string().optional(),
  });
}

export const getVenues = memoize(async (): Promise<CollectionEntry<"venues">[]> => {
  const venues = await getCollection("venues");
  const relevant = SHOW_DEV_ENTRIES ? venues : venues.filter((venue) => !venue.data.devOnly);
  return relevant.filter((venue) => venue.data.hasPage);
});

async function loadOptionalImage(
  imagePath: string | undefined,
  preset: Parameters<typeof getResponsiveImage>[1],
): Promise<ResponsiveImageData | undefined> {
  if (!imagePath) {
    return undefined;
  }
  return getResponsiveImage(imagePath, preset);
}

export async function processVenue(venue: CollectionEntry<"venues">): Promise<ProcessedVenue> {
  const [cover, mapImage, mapDarkImage] = await Promise.all([
    loadOptionalImage(venue.data.cover, "sidebarLayoutHero"),
    loadOptionalImage(venue.data.mapImage, "venueMap"),
    loadOptionalImage(venue.data.mapDarkImage, "venueMap"),
  ]);
  return { ...venue.data, cover, mapImage, mapDarkImage };
}

export const getVenue = memoize(async (venueSlug: string | undefined): Promise<VenueEnriched> => {
  if (!venueSlug) throw new Error("Venue slug not defined");
  const venue = await getEntry("venues", venueSlug);
  if (!venue) throw new Error(`No venue found for slug ${venueSlug}`);

  return { ...venue, data: await processVenue(venue) };
});
