import { SITE } from "@/constants";
import { getVenue } from "@/content";
import { getOGImageWithFallback } from "@/utils/og";

import type { SEOMetadata } from ".";

export async function decorateVenueSEO(
  baseSEO: SEOMetadata,
  venueId: string,
  pathname: string,
): Promise<SEOMetadata> {
  try {
    const venue = await getVenue(venueId);

    const description =
      venue.data.description ||
      `${venue.data.title} - A venue for tech meetups and events in the Kansai region. Located in ${venue.data.city || "Osaka"}.`;

    const ogImage = getOGImageWithFallback(pathname, { venueId, title: venue.data.title });

    const keywords = ["venue", venue.data.title, venue.data.city, "tech meetup venue"].filter(
      (keyword): keyword is string => Boolean(keyword),
    );

    return {
      ...baseSEO,
      title: venue.data.title,
      fullTitle: SITE.title.template.replace("%s", `${venue.data.title} - Venues`),
      description,
      ogImage,
      type: "website",
      keywords,
      entity: {
        type: "venue",
        data: venue,
        shouldGenerateOG: true,
      },
    };
  } catch (error) {
    console.error(`Failed to load venue ${venueId}:`, error);
    return baseSEO;
  }
}
