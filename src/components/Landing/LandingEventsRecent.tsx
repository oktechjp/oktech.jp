import clsx from "clsx";

import EventCard from "@/components/Common/EventCard";
import type { EventEnriched } from "@/content";
import { filterRecentEvents } from "@/utils/eventFilters";

export default function LandingEventsRecent({
  events,
  limit = 6,
}: {
  events: EventEnriched[];
  limit?: number;
}) {
  const recentEvents = filterRecentEvents(events).slice(0, limit);

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      data-testid="events-recent"
    >
      {recentEvents.map((event, index) => (
        <div
          key={event.id}
          data-testid="event-card"
          className={clsx([
            index === 3 && "hidden sm:block",
            index === 4 && "hidden lg:block xl:hidden",
            index === 5 && "hidden lg:block xl:hidden",
          ])}
        >
          <EventCard event={event} variant="polaroid" />
        </div>
      ))}
    </div>
  );
}
