"use client";

import { LuCalendarCheck, LuTicket } from "react-icons/lu";

import Alert from "@/components/Common/Alert";
import EventCountdown from "@/components/Common/EventCountdown";
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
      message={
        <div className="flex flex-wrap">
          <div className="mr-4 text-xl">
            This event{" "}
            <b>
              <EventCountdown event={event} asString capitalize={false} />
            </b>
            !
          </div>
          <div>Reserve your spot now on Meetup.com before it's too late.</div>
        </div>
      }
      ctaText="RSVP Now"
      ctaHref={meetupUrl}
      ctaIcon={<LuTicket />}
      variant="warning"
      dismissible={false}
    />
  );
}
