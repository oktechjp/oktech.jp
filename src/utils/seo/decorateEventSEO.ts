import { SITE } from "@/constants";
import { getEvent } from "@/content";
import { isLegacyEvent } from "@/utils/eventFilters";
import { getOGImageWithFallback } from "@/utils/og";

import type { SEOMetadata } from ".";

export async function decorateEventSEO(
  baseSEO: SEOMetadata,
  eventId: string,
  pathname: string,
): Promise<SEOMetadata> {
  try {
    const event = await getEvent(eventId);
    const topics = event.data.topics ?? [];

    let description = event.data.description;
    if (!description || description.length < 50) {
      description = topics.length
        ? `Topics: ${topics.join(", ")}. Join us for this tech meetup event!`
        : "Join us for this exciting tech meetup event!";
    }

    const isLegacy = isLegacyEvent(event);
    const ogImage =
      isLegacy && event.data.coverPage?.src
        ? event.data.coverPage.src
        : getOGImageWithFallback(pathname, { eventId, title: event.data.title });

    const baseKeywords = ["Event", "Technology", "Meetup"];
    const additionalKeywords = topics.filter((keyword): keyword is string => Boolean(keyword));
    const allKeywords = [...baseKeywords, ...additionalKeywords];
    const keywords = allKeywords.slice(0, 5);

    return {
      ...baseSEO,
      title: event.data.title,
      fullTitle: SITE.title.template.replace("%s", `${event.data.title} - Events`),
      description,
      ogImage,
      type: "article",
      article: {
        publishedTime: event.data.dateTime.toISOString(),
        tags: topics,
      },
      keywords,
      entity: {
        type: "event",
        data: event,
        isLegacy,
        shouldGenerateOG: !isLegacy,
      },
    };
  } catch (error) {
    console.error(`Failed to load event ${eventId}:`, error);
    return baseSEO;
  }
}
