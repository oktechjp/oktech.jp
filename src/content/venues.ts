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

// Type definitions
export type Venue = InferEntrySchema<"venues">;

// Enhanced venue type with processed images
export type ProcessedVenue = Omit<Venue, "cover" | "mapImage" | "mapDarkImage"> & {
  cover?: ResponsiveImageData;
  mapImage?: ResponsiveImageData;
  mapDarkImage?: ResponsiveImageData;
};

// Enriched venue type that combines CollectionEntry with processed data
export type VenueEnriched = Omit<CollectionEntry<"venues">, "data"> & {
  data: ProcessedVenue;
};

// Collection definition
export const venuesCollection = defineCollection({
  loader: async () => {
    const imports = import.meta.glob("/content/venues/**/venue.md", {
      eager: true,
    });

    const mapImages = import.meta.glob("/content/venues/**/map.jpg");

    const mapDarkImages = import.meta.glob("/content/venues/**/map-dark.jpg");

    return Object.entries(imports).map(([fileName, module]) => {
      const basePath = fileName.replace("/venue.md", "");
      const slug = basePath.split("/").pop() as string;

      const { frontmatter } = module as {
        frontmatter: Record<string, unknown>;
      };

      const cover = frontmatter.cover && path.join(basePath, frontmatter.cover as string);

      const mapImagePath = path.join(basePath, "map.jpg");
      const mapImage = mapImages[mapImagePath] ? mapImagePath : undefined;

      const mapDarkImagePath = path.join(basePath, "map-dark.jpg");
      const mapDarkImage = mapDarkImages[mapDarkImagePath] ? mapDarkImagePath : undefined;

      const devOnly = frontmatter.devOnly as boolean | undefined;

      return {
        id: slug,
        title: frontmatter.title as string,
        city: frontmatter.city as string | undefined,
        country: frontmatter.country as string | undefined,
        address: frontmatter.address as string | undefined,
        state: frontmatter.state as string | undefined,
        postalCode: frontmatter.postalCode as string | undefined,
        url: frontmatter.url as string | undefined,
        gmaps: frontmatter.gmaps as string | undefined,
        coordinates: frontmatter.coordinates as { lat: number; lng: number } | undefined,
        meetupId: frontmatter.meetupId as number,
        hasPage: frontmatter.hasPage as boolean | undefined,
        description: frontmatter.description as string | undefined,
        readingTime: frontmatter.readingTime as string | undefined,
        devOnly: devOnly ?? false,
        cover,
        mapImage,
        mapDarkImage,
      };
    });
  },
  schema: () =>
    z.object({
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
      cover: z.string().optional(), // Changed from image() to z.string()
      mapImage: z.string().optional(), // Changed from image() to z.string()
      mapDarkImage: z.string().optional(), // Changed from image() to z.string()
    }),
});

// Helper function to process venue with images
const processVenue = memoize(async function processVenue(
  venue: CollectionEntry<"venues">,
): Promise<ProcessedVenue> {
  // Generate responsive images for paths that exist
  let cover: ResponsiveImageData | undefined;
  let mapImage: ResponsiveImageData | undefined;
  let mapDarkImage: ResponsiveImageData | undefined;

  // Only process images that actually exist
  if (venue.data.cover) {
    cover = await getResponsiveImage(venue.data.cover, "sidebarLayoutHero");
  }
  if (venue.data.mapImage) {
    mapImage = await getResponsiveImage(venue.data.mapImage, "venueMap");
  }
  if (venue.data.mapDarkImage) {
    mapDarkImage = await getResponsiveImage(venue.data.mapDarkImage, "venueMap");
  }

  return {
    ...venue.data,
    cover,
    mapImage,
    mapDarkImage,
  };
});

// Export memoized functions
export const getVenues = memoize(async (): Promise<CollectionEntry<"venues">[]> => {
  const allVenues = await getCollection("venues");

  // Filter out devOnly venues in production
  const filteredVenues = SHOW_DEV_ENTRIES
    ? allVenues
    : allVenues.filter((venue) => !venue.data.devOnly);

  // Only return venues that have a page
  return filteredVenues.filter((venue) => venue.data.hasPage);
});

export const getVenue = memoize(async (venueSlug: string | undefined): Promise<VenueEnriched> => {
  if (!venueSlug) {
    throw new Error("Venue slug not defined");
  }
  const venue = await getEntry("venues", venueSlug);
  if (!venue) {
    throw new Error(`No venue found for slug ${venueSlug}`);
  }

  // Process venue to include map image
  const processedVenueData = await processVenue(venue);

  return {
    ...venue,
    data: processedVenueData,
  };
});

export { processVenue };
