import { LuCalendarDays, LuSparkles } from "react-icons/lu";

import type { EventEnriched } from "@/content";
import { filterRecentEvents, filterUpcomingEvents } from "@/utils/eventFilters";

import Button from "../Common/Button";
import Container from "../Common/Container";
import EventCarousel from "../Common/EventCarousel";

function UpcomingSection({ events }: { events: EventEnriched[] }) {
  return (
    <>
      <Container className="gap-responsive flex flex-col md:items-center">
        <h2 className="section-title">Upcoming Events</h2>
      </Container>
      <EventCarousel events={events} moreText="...and more coming soon!" moreIcon={LuSparkles} />
    </>
  );
}

function RecentSection({ events, remaining }: { events: EventEnriched[]; remaining: number }) {
  return (
    <>
      <Container wide className="gap-responsive flex justify-between">
        <h2 className="section-title">Recent Events</h2>
        <div className="hidden md:block">
          <Button text="All Events" href="/events" className="btn-lg btn-neutral" />
        </div>
      </Container>

      <EventCarousel
        events={events}
        variant="polaroid"
        moreText={`...and ${remaining} past events!`}
        moreIcon={LuCalendarDays}
        cta={
          <div className="block md:hidden">
            <Button text="All Events" href="/events" className="btn-lg btn-neutral" />
          </div>
        }
      />
    </>
  );
}

export default function EventsSection({
  events,
  variant,
  totalEvents,
}: {
  events: EventEnriched[];
  totalEvents: number;
  variant: "upcoming" | "recent";
}) {
  const upcomingEvents = filterUpcomingEvents(events).reverse();
  const recentEvents = filterRecentEvents(events);
  const hasUpcoming = upcomingEvents.length > 0;

  const remaining = totalEvents - events.length;

  // show the recent events, or upcoming if there aren't any recents.

  if (variant === "upcoming") {
    return hasUpcoming ? (
      <UpcomingSection events={upcomingEvents} />
    ) : (
      <RecentSection events={recentEvents} remaining={remaining} />
    );
  }
  if (variant === "recent") {
    return hasUpcoming ? <RecentSection events={recentEvents} remaining={remaining} /> : null;
  }
}
