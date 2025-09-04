import SimpleSection from "@/components/Common/SimpleSection";
import type { EventEnriched } from "@/content";
import { filterUpcomingEvents } from "@/utils/eventFilters";

import LandingEventsRecent from "./LandingEventsRecent";
import LandingEventsUpcoming from "./LandingEventsUpcoming";

function UpcomingSection({ events }: { events: EventEnriched[] }) {
  return (
    <SimpleSection title="Upcoming Events">
      <LandingEventsUpcoming events={events} />
    </SimpleSection>
  );
}

function RecentSection({ events }: { events: EventEnriched[] }) {
  return (
    <SimpleSection title="Recent Events" wide button={{ text: "All Events", href: "/events" }}>
      <LandingEventsRecent events={events} />
    </SimpleSection>
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
