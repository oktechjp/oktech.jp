import { SEO_DATA, SITE } from "@/constants";
import { type EventEnriched, getEvent, getVenue } from "@/content";
import { type VenueEnriched } from "@/content/venues";
import { isLegacyEvent } from "@/utils/eventFilters";
import { getOGImageWithFallback } from "@/utils/og";
import { urls } from "@/utils/urls";

export interface SEOMetadata {
  title: string; // Plain title without site suffix
  fullTitle: string; // Full title with site suffix for SEO
  description: string;
  canonical: string;
  ogImage?: string;
  type: "website" | "article" | "profile";
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
  };
  noindex?: boolean;
  nofollow?: boolean;
  keywords?: string[];
  // Additional data for OG image generation
  entity?: {
    type: "event" | "venue";
    data: EventEnriched | VenueEnriched;
    isLegacy?: boolean;
    shouldGenerateOG?: boolean;
  };
}

/**
 * Determine the page type and extract relevant identifiers from pathname
 */
function parsePageType(pathname: string): {
  type: "static" | "event" | "venue" | "markdown" | "unknown";
  id: string;
} {
  // Check if it's a non-HTML resource first
  if (pathname.endsWith(".xml") || pathname.endsWith(".ics") || pathname.endsWith(".json")) {
    return { type: "unknown", id: pathname };
  }

  // Normalize pathname by removing .html extension
  const normalizedPathname = urls.normalize(pathname);

  // Check static pages first (including /events/album and /events/list)
  if (SEO_DATA[normalizedPathname]) {
    return { type: "static", id: normalizedPathname };
  }

  // Check event pages (but exclude static pages already handled above)
  const eventMatch = normalizedPathname.match(/^\/events\/([^/]+?)$/);
  if (eventMatch && eventMatch[1]) {
    return { type: "event", id: eventMatch[1] };
  }

  // Check venue pages
  const venueMatch = normalizedPathname.match(/^\/venue\/([^/]+?)$/);
  if (venueMatch && venueMatch[1]) {
    return { type: "venue", id: venueMatch[1] };
  }

  // These should never hit, as we're already hadnling them above, it's just a safety check
  // in case we mess up the config and don't include events or venues static SEO
  if (normalizedPathname.startsWith("/events") || normalizedPathname.startsWith("/venue")) {
    return { type: "unknown", id: normalizedPathname };
  }

  // Assume it's a markdown page if it doesn't match other patterns
  const slug = normalizedPathname.replace(/^\//, "");
  if (slug) {
    return { type: "markdown", id: slug };
  }

  return { type: "unknown", id: normalizedPathname };
}

/**
 * Decorate base SEO with static page data
 */
async function decorateStaticPageSEO(baseSEO: SEOMetadata, pathname: string): Promise<SEOMetadata> {
  const staticSEO = SEO_DATA[pathname];
  if (!staticSEO) return baseSEO;

  // Determine the title
  const fullTitle =
    pathname === "/" ? SITE.title.default : SITE.title.template.replace("%s", staticSEO.title);

  return {
    ...baseSEO,
    title: staticSEO.title,
    fullTitle,
    description: staticSEO.description,
    type: "website",
    keywords: staticSEO.keywords,
  };
}

/**
 * Decorate base SEO with markdown page data
 */
async function decorateMarkdownPageSEO(baseSEO: SEOMetadata, slug: string): Promise<SEOMetadata> {
  // Try to load the markdown file from /content/ to get frontmatter
  try {
    // Try to find the markdown file - it could be at /content/{slug}.md
    const markdownFiles = import.meta.glob("/content/**/*.md");
    const possiblePaths = [`/content/${slug}.md`, `/content/markdownPages/${slug}.md`];

    for (const fullPath of possiblePaths) {
      if (markdownFiles[fullPath]) {
        const module = (await markdownFiles[fullPath]()) as any;
        const { frontmatter } = module;

        if (frontmatter) {
          const title = frontmatter.title || baseSEO.title;
          const fullTitle = SITE.title.template.replace("%s", title);

          return {
            ...baseSEO,
            title,
            fullTitle,
            description: frontmatter.description || `Learn more about ${title} at OKTech`,
            type: frontmatter.type || "article",
            keywords: frontmatter.keywords || [title, "OKTech"],
            ogImage: frontmatter.ogImage || baseSEO.ogImage,
            article: frontmatter.publishedTime
              ? {
                  publishedTime: frontmatter.publishedTime,
                  modifiedTime: frontmatter.modifiedTime,
                  author: frontmatter.author,
                  tags: frontmatter.tags,
                }
              : undefined,
          };
        }
      }
    }

    // If no markdown file found, just update the type
    return {
      ...baseSEO,
      type: "article",
    };
  } catch (error) {
    console.error(`Error processing markdown page SEO for ${slug}:`, error);
    return baseSEO;
  }
}

/**
 * Decorate base SEO with event data
 */
async function decorateEventSEO(
  baseSEO: SEOMetadata,
  eventId: string,
  pathname: string,
): Promise<SEOMetadata> {
  try {
    const event = await getEvent(eventId);
    const topics = event.data.topics || [];

    // Use description from event data or fallback to topics
    let description = event.data.description;
    if (!description || description.length < 50) {
      description = topics.length
        ? `Topics: ${topics.join(", ")}. Join us for this tech meetup event!`
        : "Join us for this exciting tech meetup event!";
    }

    const isLegacy = isLegacyEvent(event);
    // For legacy events, use their cover image if available
    const ogImage =
      isLegacy && event.data.cover?.src
        ? event.data.cover.src
        : getOGImageWithFallback(pathname, { eventId, title: event.data.title });

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
      keywords: [...topics, "tech event", "meetup", event.venue?.title].filter(Boolean) as string[],
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

/**
 * Decorate base SEO with venue data
 */
async function decorateVenueSEO(
  baseSEO: SEOMetadata,
  venueId: string,
  pathname: string,
): Promise<SEOMetadata> {
  try {
    const venue = await getVenue(venueId);

    // Use venue description or fallback to default
    const description =
      venue.data.description ||
      `${venue.data.title} - A venue for tech meetups and events in the Kansai region. Located in ${venue.data.city || "Osaka"}.`;

    // Use venue's cover image if it exists, otherwise use base OG image
    const ogImage = venue.data.cover?.src
      ? venue.data.cover.src
      : getOGImageWithFallback(pathname, { venueId, title: venue.data.title });

    return {
      ...baseSEO,
      title: venue.data.title,
      fullTitle: SITE.title.template.replace("%s", `${venue.data.title} - Venues`),
      description,
      ogImage,
      type: "website",
      keywords: ["venue", venue.data.title, venue.data.city, "tech meetup venue"].filter(
        Boolean,
      ) as string[],
      entity: {
        type: "venue",
        data: venue,
        shouldGenerateOG: !venue.data.cover?.src,
      },
    };
  } catch (error) {
    console.error(`Failed to load venue ${venueId}:`, error);
    return baseSEO;
  }
}

/**
 * Get base SEO metadata that can be decorated by specific handlers
 */
function getBaseSEO(pathname: string): SEOMetadata {
  const canonical = urls.toAbsolute(pathname);
  const homeSEO = SEO_DATA["/"];

  // Create a basic title from the pathname as fallback
  const segments = pathname.split("/").filter(Boolean);
  const fallbackTitle =
    segments[segments.length - 1]
      ?.split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") || "OKTech";

  return {
    title: fallbackTitle,
    fullTitle: SITE.title.default,
    description: homeSEO.description,
    canonical,
    ogImage: getOGImageWithFallback(pathname),
    type: "website",
    keywords: homeSEO.keywords,
  };
}

/**
 * Determine SEO metadata based on URL
 */
export async function getSEO(url: string): Promise<SEOMetadata> {
  // Extract and normalize pathname using our URL helpers
  const pathname = urls.parse(url)?.pathname || url;

  // Start with base SEO that includes canonical and defaults
  const baseSEO = getBaseSEO(pathname);

  // Determine page type and decorate accordingly
  const pageInfo = parsePageType(pathname);

  if (pageInfo.type === "static") {
    return decorateStaticPageSEO(baseSEO, pathname);
  }

  if (pageInfo.type === "event") {
    return decorateEventSEO(baseSEO, pageInfo.id, pathname);
  }

  if (pageInfo.type === "venue") {
    return decorateVenueSEO(baseSEO, pageInfo.id, pathname);
  }

  if (pageInfo.type === "markdown") {
    return decorateMarkdownPageSEO(baseSEO, pageInfo.id);
  }

  // For unknown types, return the base SEO
  return baseSEO;
}
