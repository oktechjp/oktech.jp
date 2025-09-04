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
    // No grouping when search is active - show all results in one grid
    return (
      <SimpleSection title={events.length >= 1 ? "Search Results" : "No Results"} wide grid>
        {events.map((event) => (
          <div key={event.id} data-testid="event-card">
            <EventCard event={event} variant="polaroid" />
          </div>
        ))}
      </SimpleSection>
    );
  }

  // Apply year grouping when no search filter or only location/topic filters
  const eventGroups = groupEventsByYearAndUpcoming(events, currentFilters.sort);

  return (
    <>
      {eventGroups.map((group) => (
        <SimpleSection key={group.label} title={group.label} wide grid>
          {group.events.map((event) => (
            <div key={event.id} data-testid="event-card">
              <EventCard event={event} variant="polaroid" />
            </div>
          ))}
        </SimpleSection>
      ))}
    </>
  );
}
