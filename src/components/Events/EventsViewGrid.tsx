import EventCard from "@/components/Common/EventCard";
import SimpleSection from "@/components/Common/SimpleSection";
import type { EventEnriched } from "@/content";
import { groupEventsByYearAndUpcoming } from "@/utils/eventGrouping";

import { useEventsFilter } from "./EventsFilterProvider";

interface Props {
  events: EventEnriched[];
}

export default function EventsViewGrid({ events }: Props) {
  const { currentFilters } = useEventsFilter();

  // Reason: Skip year grouping when search filter is active (but not for location filter)
  const hasSearchFilter = !!currentFilters.search;

  if (hasSearchFilter) {
    // Use "big" variant for 2 or fewer events, "polaroid" for more
    const variant = events.length <= 2 ? "big" : "polaroid";

    // No grouping when search is active - show all results in one grid
    return (
      <SimpleSection
        title={events.length >= 1 ? "Search Results" : "No Results"}
        wide
        grid={variant !== "big"}
      >
        {variant === "big" ? (
          <div className="flex flex-col gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} variant="big" />
            ))}
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} data-testid="event-card">
              <EventCard event={event} variant="polaroid" />
            </div>
          ))
        )}
      </SimpleSection>
    );
  }

  // Apply year grouping when no search filter or only location/topic filters
  const eventGroups = groupEventsByYearAndUpcoming(events, currentFilters.sort);

  // TODO: for upcoming events, use the caoursel
  return (
    <>
      {eventGroups.map((group) => {
        // Use "big" variant for 2 or fewer events in a group, "polaroid" for more
        const variant = group.events.length <= 2 ? "big" : "polaroid";

        return (
          <SimpleSection key={group.label} title={group.label} wide grid={variant !== "big"}>
            {variant === "big" ? (
              <div className="flex flex-col gap-8">
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} variant="big" />
                ))}
              </div>
            ) : (
              group.events.map((event) => (
                <EventCard key={event.id} event={event} variant="polaroid" />
              ))
            )}
          </SimpleSection>
        );
      })}
    </>
  );
}
