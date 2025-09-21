import SimpleSection from "@/components/Common/SimpleSection";
import type { EventEnriched } from "@/content";
import { filterUpcomingEvents } from "@/utils/eventFilters";

import Button from "../Common/Button";
import Container from "../Common/Container";
import LandingEventsRecent from "./LandingEventsRecent";
import LandingEventsUpcoming from "./LandingEventsUpcoming";

function UpcomingSection({ events }: { events: EventEnriched[] }) {
  return (
    <Container className="gap-responsive flex flex-col md:items-center">
      <h2 className="section-title">Upcoming Events</h2>
      <LandingEventsUpcoming events={events} />
    </Container>
  );
}

function RecentSection({ events }: { events: EventEnriched[] }) {
  return (
    <Container className="gap-responsive flex flex-col items-center">
      <div className="flex w-full items-center justify-between gap-4">
        <h2 className="section-title">Recent Events</h2>
        <div className="hidden md:block">
          <Button text="All Events" href="/events" className="btn-lg btn-neutral" />
        </div>
      </div>
      <LandingEventsRecent events={events} />
      <div className="ml-auto md:hidden">
        <Button text="All Events" href="/events" className="btn-lg btn-neutral ml-auto md:hidden" />
      </div>
    </Container>
  );
}

export default function EventsSection({
  events,
  variant,
}: {
  events: EventEnriched[];
  variant: "upcoming" | "recent";
}) {
  const hasUpcoming = filterUpcomingEvents(events).length > 0;

  // show the recent events, or upcoming if there aren't any recents.

  if (variant === "upcoming") {
    return hasUpcoming ? <UpcomingSection events={events} /> : <RecentSection events={events} />;
  }
  if (variant === "recent") {
    return hasUpcoming ? <RecentSection events={events} /> : null;
  }
}
