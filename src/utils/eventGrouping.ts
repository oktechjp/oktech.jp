import type { EventEnriched } from "@/content";

import { isEventUpcoming } from "./eventFilters";

export interface EventGroup {
  label: string;
  events: EventEnriched[];
  isUpcoming?: boolean;
}

const UPCOMING_LABEL = "Upcoming Events";
const getYearLabel = (year: number) => `Events in ${year}`;

/**
 * Groups events by year and upcoming status
 * Upcoming events are grouped together, past events are grouped by year
 * Preserves the original sort order within each group
 * Groups are ordered based on sortOrder parameter
 */
export function groupEventsByYearAndUpcoming(
  events: EventEnriched[],
  sortOrder: "date-desc" | "date-asc" = "date-desc",
  currentTime: Date = new Date(),
): EventGroup[] {
  const groups: EventGroup[] = [];
  const upcomingEvents: EventEnriched[] = [];
  const eventsByYear = new Map<number, EventEnriched[]>();

  // Group events while preserving original order
  events.forEach((event) => {
    if (isEventUpcoming(event, currentTime)) {
      upcomingEvents.push(event);
    } else {
      const year = event.data.dateTime.getFullYear();
      if (!eventsByYear.has(year)) {
        eventsByYear.set(year, []);
      }
      eventsByYear.get(year)!.push(event);
    }
  });

  // reverse upcoming events
  upcomingEvents.reverse();

  // Sort years based on sortOrder
  const years = Array.from(eventsByYear.keys()).sort((a, b) => {
    return sortOrder === "date-desc" ? b - a : a - b;
  });

  if (sortOrder === "date-desc") {
    // Newest first: Upcoming events go first, then years in descending order
    if (upcomingEvents.length > 0) {
      groups.push({
        label: UPCOMING_LABEL,
        events: upcomingEvents,
        isUpcoming: true,
      });
    }
    years.forEach((year) => {
      const yearEvents = eventsByYear.get(year)!;
      if (yearEvents.length > 0) {
        groups.push({
          label: getYearLabel(year),
          events: yearEvents,
        });
      }
    });
  } else {
    // Oldest first: Years in ascending order, then upcoming events last
    years.forEach((year) => {
      const yearEvents = eventsByYear.get(year)!;
      if (yearEvents.length > 0) {
        groups.push({
          label: getYearLabel(year),
          events: yearEvents,
        });
      }
    });
    if (upcomingEvents.length > 0) {
      groups.push({
        label: UPCOMING_LABEL,
        events: upcomingEvents,
        isUpcoming: true,
      });
    }
  }

  return groups;
}
