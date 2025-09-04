import EventCard from "@/components/Common/EventCard";
import type { EventEnriched } from "@/content";
import { filterUpcomingEvents } from "@/utils/eventFilters";

export default function LandingEventsUpcoming({ events }: { events: EventEnriched[] }) {
  const futureEvents = filterUpcomingEvents(events).reverse();
  const [nextEvent] = futureEvents;

  if (!nextEvent) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {futureEvents.map((event) => (
        <EventCard key={event.id} event={event} variant="big" />
      ))}
    </div>
  );
}
