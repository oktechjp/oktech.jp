import { getCollection } from "astro:content";

import { SEO_DATA } from "@/constants";
import { getEvents, getVenues } from "@/content";

import { getSEO } from "./seo";
import { resolveFullUrl } from "./urlResolver";

export interface Entry {
  title: string;
  href?: string;
  fullUrl?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

/**
 * Create a sitemap entry from a path
 */
async function getSitemapItem(path: string, overrideTitle?: string): Promise<Entry> {
  // For non-HTML resources, use SEO_DATA directly
  const isNonHtml = path.endsWith(".xml") || path.endsWith(".ics");
  if (isNonHtml) {
    const seoData = SEO_DATA[path];
    return {
      title: overrideTitle || seoData?.title || path,
      href: path,
      fullUrl: resolveFullUrl(path),
      description: seoData?.description,
      keywords: seoData?.keywords,
    };
  }

  // For HTML pages, use getSEO
  const seo = await getSEO(path);
  return {
    title: overrideTitle || seo.title,
    href: path,
    fullUrl: resolveFullUrl(path),
    description: seo.description,
    keywords: seo.keywords,
    ogImage: seo.ogImage,
  };
}

/**
 * Build all sitemap entries as a flat list
 */
export async function buildSitemapEntries(): Promise<Entry[]> {
  const entries: Entry[] = [];

  // Static pages
  entries.push(await getSitemapItem("/"));
  entries.push(await getSitemapItem("/about"));
  entries.push(await getSitemapItem("/events"));
  entries.push(await getSitemapItem("/events/list"));
  entries.push(await getSitemapItem("/events/album"));
  entries.push(await getSitemapItem("/sitemap"));

  // Non-HTML resources
  entries.push(await getSitemapItem("/rss.xml"));
  entries.push(await getSitemapItem("/oktech-events.ics"));
  entries.push(await getSitemapItem("/sitemap.xml"));

  // Dynamic markdown pages from content collection
  try {
    const markdownPages = await getCollection("markdownPages");
    const markdownEntries: Entry[] = await Promise.all(
      markdownPages.map(async (page) => {
        // Remove .md extension to get the URL path
        const slug = page.id.replace(/\.md$/, "");
        const href = `/${slug}`;
        const seo = await getSEO(href);
        return {
          href,
          title: seo.title,
          fullUrl: resolveFullUrl(href),
          description: seo.description,
          keywords: seo.keywords,
          ogImage: seo.ogImage,
        };
      }),
    );
    entries.push(...markdownEntries);
  } catch (error) {
    console.error("Error loading markdown pages for sitemap:", error);
  }

  // Dynamic event pages
  const events = await getEvents();
  const eventPages: Entry[] = await Promise.all(
    events.map(async (e) => {
      const href = `/events/${e.id}`;
      const seo = await getSEO(href);
      return {
        href,
        title: e.data.title,
        fullUrl: resolveFullUrl(href),
        ogImage: seo.ogImage,
        description: seo.description,
        keywords: seo.keywords,
      };
    }),
  );
  entries.push(...eventPages);

  // Dynamic venue pages
  const venues = await getVenues();
  const venuePages: Entry[] = await Promise.all(
    venues.map(async (v) => {
      const href = `/venue/${v.id}`;
      const seo = await getSEO(href);
      return {
        href,
        title: v.data.title,
        fullUrl: resolveFullUrl(href),
        description: seo.description,
        keywords: seo.keywords,
        ogImage: seo.ogImage,
      };
    }),
  );
  entries.push(...venuePages);

  return entries;
}

/**
 * Extract all URLs from sitemap entries
 */
export function extractUrlsFromEntries(entries: Entry[]): string[] {
  return entries.filter((entry) => entry.href).map((entry) => entry.href!);
}

/**
 * Generate a list of absolute URLs used in sitemaps.
 * Uses resolveFullUrl to ensure consistent URL generation.
 *
 * @returns Array of URL strings.
 */
export async function generateSitemapURLs(): Promise<string[]> {
  const entries = await buildSitemapEntries();
  const paths = extractUrlsFromEntries(entries);

  // Filter out non-HTML paths (XML, RSS, ICS)
  const htmlPaths = paths.filter((path) => !path.endsWith(".xml") && !path.endsWith(".ics"));

  // Convert to absolute URLs
  return htmlPaths.map((path) => resolveFullUrl(path));
}
