import Container from "@/components/Common/Container";
import { EventsFilter } from "@/components/Events/EventsFilter";
import { EventFilterProvider } from "@/components/Events/EventsFilterProvider";
import { useEventsFilter } from "@/components/Events/EventsFilterProvider";
import type { EventEnriched } from "@/content";

import EventsView from "./EventsView";

export type EventsOrganizerViews = "grid" | "compact" | "album";

function EventsOrganizerInner({
  events,
  view,
}: {
  events: EventEnriched[];
  view: EventsOrganizerViews;
}) {
  const { availableFilters } = useEventsFilter();

  return (
    <div className="bg-base-100 -mt-22 flex flex-col pt-32">
      <EventsFilter availableFilters={availableFilters} currentView={view} />
      <div className="">
        <EventsView events={events} view={view} />
      </div>
    </div>
  );
}

export default function EventsOrganizer({
  events,
  view,
}: {
  events: EventEnriched[];
  view: EventsOrganizerViews;
}) {
  return (
    <EventFilterProvider events={events}>
      <EventsOrganizerInner events={events} view={view} />
    </EventFilterProvider>
  );
}
