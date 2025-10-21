import { useEventsFilter } from "@/components/Events/EventsFilterProvider";
import type { EventEnriched } from "@/content";

import EventsViewAlbum from "./EventsViewAlbum";
import EventsViewCollection from "./EventsViewCollection";

interface Props {
  events: EventEnriched[];
  view: "grid" | "compact" | "album";
}

export default function EventsView({ events, view }: Props) {
  const { filteredItems } = useEventsFilter();

  // Create a map of filtered event IDs for quick lookup
  const filteredIds = new Set(filteredItems.map((item) => item.id));

  // Filter the full event objects based on filtered IDs
  const filteredEvents = events.filter((event) => filteredIds.has(event.id));

  // Sort the filtered events to match the order from filteredItems
  const sortedEvents = filteredItems
    .map((item) => filteredEvents.find((event) => event.id === item.id))
    .filter((event): event is EventEnriched => event !== undefined);

  return (
    <div className="flex flex-col gap-24">
      {view === "grid" && <EventsViewCollection events={sortedEvents} variant="grid" />}
      {view === "compact" && <EventsViewCollection events={sortedEvents} variant="list" />}
      {view === "album" && <EventsViewAlbum events={sortedEvents} />}
    </div>
  );
}
