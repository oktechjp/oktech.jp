import type { EventEnriched } from "@/content";

// an event is considered "ended" if it has ended + 30 min buffer
const BUFFER_MINUTES = 30;

// Minimal event data interface that can be satisfied by both EventEnriched and import data
interface EventWithDateTime {
  data: {
    dateTime: Date;
    duration?: number;
  };
}

/**
 * Calculates the end time of an event including a buffer period
 */
export function getEventEndTimeWithBuffer(event: EventWithDateTime): Date {
  const startTime = new Date(event.data.dateTime);
  const durationMinutes = event.data.duration || 120; // Default 2 hours if not specified
  const totalMinutes = durationMinutes + BUFFER_MINUTES;

  return new Date(startTime.getTime() + totalMinutes * 60 * 1000);
}

/**
 * Checks if an event should be shown as upcoming
 * Events are considered upcoming if they haven't ended (including 30 min buffer)
 */
export function isEventUpcoming(event: EventWithDateTime, currentTime: Date = new Date()): boolean {
  const endTimeWithBuffer = getEventEndTimeWithBuffer(event);
  return endTimeWithBuffer > currentTime;
}

/**
 * Checks if an event should be shown as recent
 * Events are considered recent if they have ended (including 30 min buffer)
 */
export function isEventRecent(event: EventWithDateTime, currentTime: Date = new Date()): boolean {
  const endTimeWithBuffer = getEventEndTimeWithBuffer(event);
  return endTimeWithBuffer <= currentTime;
}

/**
 * Filters events to get upcoming ones (haven't ended + 30 min buffer)
 */
export function filterUpcomingEvents<T extends EventWithDateTime>(
  events: T[],
  currentTime: Date = new Date(),
): T[] {
  return events.filter((event) => isEventUpcoming(event, currentTime));
}

/**
 * Filters events to get recent ones (have ended + 30 min buffer)
 */
export function filterRecentEvents<T extends EventWithDateTime>(
  events: T[],
  currentTime: Date = new Date(),
): T[] {
  return events.filter((event) => isEventRecent(event, currentTime));
}

/**
 * Sorts upcoming events with non-recurring first, then recurring, then dev-only —
 * each tier sorted ascending by date. Keeps regular meetups prominent on the
 * landing page while still surfacing recurring series and dev fixtures.
 */
export function sortUpcomingByTier<
  T extends EventWithDateTime & { data: { recurredFrom?: string; devOnly?: boolean } },
>(events: T[]): T[] {
  const tier = (event: T): number => {
    if (event.data.devOnly) return 2;
    if (event.data.recurredFrom) return 1;
    return 0;
  };
  return [...events].sort((a, b) => {
    const diff = tier(a) - tier(b);
    if (diff !== 0) return diff;
    return new Date(a.data.dateTime).getTime() - new Date(b.data.dateTime).getTime();
  });
}

/**
 * Collapses recurring-event instances so each parent appears at most once.
 * Iterates the array in order; for past instances, the first hit per parent wins —
 * so callers should pass an array sorted most-recent-first to keep the freshest one.
 */
export function dedupeRecurringInstances<T extends { data: { recurredFrom?: string } }>(
  events: T[],
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const event of events) {
    const parent = event.data.recurredFrom;
    if (parent) {
      if (seen.has(parent)) continue;
      seen.add(parent);
    }
    result.push(event);
  }
  return result;
}

/**
 * Checks if an event is a "legacy" event (OG images are not generated for them)
 */
export function isLegacyEvent(_event: EventWithDateTime | EventEnriched): boolean {
  // TODO: When enabling generated OG images, switch to a specific cutoff date (see below).
  // const eventDate = new Date(event.data.dateTime);
  // const legacyCutoff = new Date("2025-10-10T23:59:59");
  // return eventDate <= legacyCutoff;
  return true;
}
