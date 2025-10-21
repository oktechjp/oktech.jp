import type { GetStaticPaths } from "astro";
import path from "path";

import OGEvent from "@/components/OGImage/OGEvent";
import { getEvents } from "@/content";
import { isLegacyEvent } from "@/utils/eventFilters";
import { createOGImageRoute, loadImageAsBase64 } from "@/utils/og";

export const GET = createOGImageRoute(async ({ params }) => {
  const eventSlug = params.eventSlug;

  if (!eventSlug) {
    return null; // Will return 404
  }

  // Get event data
  const events = await getEvents();
  const event = events.find((e) => e.id === eventSlug);

  if (!event) {
    return null; // Will return 404
  }

  // Skip generation for legacy events
  if (isLegacyEvent(event)) {
    return null; // Will return 404
  }

  // Get local map image if venue has one
  let mapImageBase64 = null;
  if (event.venue?.id) {
    const mapPath = path.join(process.cwd(), "content", "venues", event.venue.id, "map.jpg");
    mapImageBase64 = await loadImageAsBase64(mapPath);
  }

  // Get event cover image if it exists
  let coverImageBase64 = null;
  if (event.data.coverPage) {
    // Extract the actual file path from the Vite virtual file system path
    const coverSrc = event.data.coverPage.src;
    const match = coverSrc.match(/\/@fs(.+?)\?/);
    if (match) {
      const actualPath = match[1];
      coverImageBase64 = await loadImageAsBase64(actualPath);
    }
  }

  return {
    component: OGEvent,
    props: {
      event,
      mapImageBase64,
      coverImageBase64,
    },
    cacheKeyData: {
      id: event.id,
      title: event.data.title,
      dateTime: event.data.dateTime,
      topics: event.data.topics,
      venueId: event.venue?.id,
      venueTitle: event.venue?.title,
      venueCity: event.venue?.city,
      hasMapImage: !!mapImageBase64,
      hasCoverImage: !!coverImageBase64,
    },
  };
});

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await getEvents();
  return events.map((event) => ({
    params: { eventSlug: event.id },
  }));
};
