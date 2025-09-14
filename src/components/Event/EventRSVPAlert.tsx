import { LuCalendarCheck, LuTicket } from "react-icons/lu";

import Alert from "@/components/Common/Alert";
import { MEETUP_EVENT_URL } from "@/constants";
import type { EventEnriched } from "@/content";
import { isEventUpcoming } from "@/utils/eventFilters";

interface EventRSVPAlertProps {
  event: EventEnriched;
}

export default function EventRSVPAlert({ event }: EventRSVPAlertProps) {
  // Only show for upcoming events with a meetup ID
  if (!isEventUpcoming(event) || !event.data.meetupId) {
    return null;
  }

  const meetupUrl = `${MEETUP_EVENT_URL}/${event.data.meetupId}/`;

  return (
    <Alert
      icon={<LuCalendarCheck />}
      message="This event is starting soon! Reserve your spot now on Meetup.com before it's too late."
      ctaText="RSVP Now"
      ctaHref={meetupUrl}
      ctaIcon={<LuTicket />}
      variant="warning"
      dismissible={false}
    />
  );
}
