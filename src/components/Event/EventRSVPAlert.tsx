"use client";

import clsx from "clsx";
import { LuCalendarCheck, LuTicket } from "react-icons/lu";

import Alert from "@/components/Common/Alert";
import EventCountdown from "@/components/Common/EventCountdown";
import { MEETUP_EVENT_URL } from "@/constants";
import type { EventEnriched } from "@/content";
import { isEventUpcoming } from "@/utils/eventFilters";

interface EventRSVPAlertProps {
  event: EventEnriched;
  variant?: "compact" | "default";
}

export default function EventRSVPAlert({ event, variant = "default" }: EventRSVPAlertProps) {
  // Only show for upcoming events with a meetup ID
  if (!isEventUpcoming(event) || !event.data.meetupId) {
    return null;
  }
  const meetupUrl = `${MEETUP_EVENT_URL}/${event.data.meetupId}/`;

  const isCompact = variant === "compact";

  return (
    <div
      className={clsx(
        "alert alert-warning flex gap-6 p-6",
        isCompact
          ? "flex-col items-start xl:flex-row xl:items-center"
          : "flex-col items-start sm:flex-row sm:items-center",
      )}
    >
      <div className="flex flex-grow flex-col gap-2">
        <div className="flex flex-grow items-center gap-2">
          <div>
            <LuCalendarCheck />
          </div>
          <div className={clsx(isCompact ? "text-base xl:text-sm" : "text-lg")}>
            This event{" "}
            <b>
              <EventCountdown event={event} asString capitalize={false} />
            </b>
            !
          </div>
        </div>
        <div className={clsx(isCompact ? "text-base xl:text-sm" : "text-base")}>
          Reserve your spot on Meetup.com
          {isCompact ? "!" : " before it's too late!"}
        </div>
      </div>
      <div className={clsx(isCompact ? "w-full xl:w-auto" : "w-full sm:w-auto")}>
        <a
          href={meetupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "btn btn-neutral whitespace-nowrap",
            isCompact ? "xl:btn-sm 2xl:!btn-md btn-lg w-full" : "btn-lg",
          )}
        >
          <LuTicket />
          RSVP Now
        </a>
      </div>
    </div>
  );
}
