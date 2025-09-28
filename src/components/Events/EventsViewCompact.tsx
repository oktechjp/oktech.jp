import { EventCardList } from "@/components/Common/EventCard";
import type { EventEnriched } from "@/content";
import { groupEventsByYearAndUpcoming } from "@/utils/eventGrouping";

import SubSection from "../Common/SubSection";
import { useEventsFilter } from "./EventsFilterProvider";

interface Props {
  events: EventEnriched[];
}

export default function EventsViewCompact({ events }: Props) {
  const { currentFilters } = useEventsFilter();
  const eventGroups = groupEventsByYearAndUpcoming(events, currentFilters.sort);

  return (
    <>
      {eventGroups.map((group) => (
        <SubSection key={group.label} title={group.label}>
          <EventCardList events={group.events} />
        </SubSection>
      ))}
    </>
  );
}
