import type { GetStaticPaths } from "astro";

import OGVenue from "@/components/OGImage/OGVenue";
import { getVenue, getVenues } from "@/content";
import { createOGImageRoute } from "@/utils/og";

export const GET = createOGImageRoute(async ({ params }) => {
  const venueSlug = params.venueSlug;

  // Get venue data
  const venue = await getVenue(venueSlug);

  if (!venue) {
    return null; // Will return 404
  }

  return {
    component: OGVenue,
    props: { venue },
    cacheKeyData: {
      id: venue.id,
      name: venue.data?.title,
      address: venue.data?.address,
      city: venue.data?.city,
    },
  };
});

export const getStaticPaths: GetStaticPaths = async () => {
  const venues = await getVenues();
  return venues.map((venue) => ({
    params: { venueSlug: venue.id },
  }));
};
