import EventCard from "@/components/Common/EventCard";
import type { EventEnriched } from "@/content";
import { filterUpcomingEvents } from "@/utils/eventFilters";

export default function LandingEventsUpcoming({ events }: { events: EventEnriched[] }) {
  const futureEvents = filterUpcomingEvents(events).reverse();
  const [nextEvent] = futureEvents;

  if (!nextEvent) {
    return null;
  }

  // Use "big" variant for 2 or fewer events, "polaroid" for more
  const variant = futureEvents.length <= 2 ? "big" : "polaroid";

  return (
    <div
      className={
        variant === "big"
          ? "flex flex-col gap-8"
          : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {futureEvents.map((event) => (
        <EventCard key={event.id} event={event} variant={variant} />
      ))}
    </div>
  );
}
