import EventCard, { EventCardList } from "@/components/Common/EventCard";
import type { EventEnriched } from "@/content";
import { groupEventsByYearAndUpcoming } from "@/utils/eventGrouping";

import SubSection from "../Common/SubSection";
import { useEventsFilter } from "./EventsFilterProvider";
import EventsSubscribeBox from "./EventsSubscribeBox";

type Variant = "grid" | "list";

interface Props {
  events: EventEnriched[];
  variant: Variant;
}

interface EventsBlockProps {
  title: string;
  events: EventEnriched[];
}

function EventsBlockList({ title, events }: EventsBlockProps) {
  return (
    <SubSection title={title}>
      <EventCardList events={events} />
    </SubSection>
  );
}

function EventBlockGrid({ title, events }: EventsBlockProps) {
  return (
    <SubSection title={title} grid={true}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} variant="polaroid" />
      ))}
    </SubSection>
  );
}

function EventsBlock({
  title,
  events,
  variant,
  isUpcoming,
}: EventsBlockProps & { variant: Variant; isUpcoming?: boolean }) {
  return (
    <>
      {variant === "list" ? (
        <EventsBlockList title={title} events={events} />
      ) : (
        <EventBlockGrid title={title} events={events} />
      )}
      {isUpcoming && (
        <>
          <EventsSubscribeBox />
          <div id="latest" className="invisible h-0" />
        </>
      )}
    </>
  );
}

export default function EventsViewCollection({ events, variant }: Props) {
  const { currentFilters } = useEventsFilter();

  if (!!currentFilters.search) {
    return (
      <EventsBlock
        title={events.length >= 1 ? "Search Results" : "No Results"}
        events={events}
        variant={variant}
      />
    );
  }

  const eventGroups = groupEventsByYearAndUpcoming(events, currentFilters.sort);

  return (
    <>
      {eventGroups.map((group) => (
        <EventsBlock
          key={group.label}
          title={group.label}
          events={group.events}
          variant={variant}
          isUpcoming={group.isUpcoming}
        />
      ))}
    </>
  );
}
