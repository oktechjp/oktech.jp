/**
 * URL helper for Playwright tests
 * Contains test constants and page paths for testing
 */

// Test event constants - these are development-only events that should be used in tests
export const TEST_EVENTS = {
  PRIMARY: "999999999-example-dev-event-2027-04-15",
  SECONDARY: "999999998-example-dev-event-2-2027-03-15",
  REAL_EVENT: "308580120-agentic-sentiments-2025-07-19", // Real event for slug testing
} as const;

// Test venue constants that are used by test events
export const TEST_VENUES = {
  TEST_VENUE_1: "999999997-test-venue-1", // Used by PRIMARY test event
  TEST_VENUE_2: "999999996-test-venue-2", // Used by SECONDARY test event
  REAL_VENUE: "24529555-cybozu-osaka-office", // Real venue for slug testing
} as const;

// Regular page paths for testing
export const PAGE_PATHS = {
  HOME: "/",
  ABOUT: "/about",
  EVENTS: "/events",
  EVENTS_LIST_VIEW: "/events/list",
  EVENTS_PHOTO_ALBUM: "/events/album",
  CODE_OF_CONDUCT: "/code-of-conduct",
  SITEMAP: "/sitemap",
  // Dynamic pages with slugs
  EVENT_DETAIL: `/events/${TEST_EVENTS.REAL_EVENT}`,
  VENUE_DETAIL: `/venue/${TEST_VENUES.REAL_VENUE}`,
} as const;

// Special page paths (non-HTML content)
export const SPECIAL_PAGE_PATHS = {
  RSS_FEED: "/rss.xml",
  ICS_CALENDAR: "/oktech-events.ics",
  XML_SITEMAP: "/sitemap.xml",
} as const;
