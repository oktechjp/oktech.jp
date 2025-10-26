"use client";

import type { ReactNode } from "react";

import clsx from "clsx";
import { LuCalendarCheck, LuCalendarX, LuTicket } from "react-icons/lu";

import EventCountdown from "@/components/Common/EventCountdown";
import { MEETUP_EVENT_URL } from "@/constants";
import type { EventEnriched } from "@/content";
import { isEventUpcoming } from "@/utils/eventFilters";

interface EventActionAlertProps {
  event: EventEnriched;
  variant?: "compact" | "default";
}

type AlertColor = "info" | "success" | "warning" | "error";

const alertVariantClass: Record<AlertColor, string> = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
};

export default function EventActionAlert({ event, variant = "default" }: EventActionAlertProps) {
  const isCancelled = event.data.isCancelled === true;
  const hasMeetupLink = Boolean(event.data.meetupId);

  if (!isCancelled && (!isEventUpcoming(event) || !hasMeetupLink)) {
    return null;
  }

  const isCompact = variant === "compact";

  const meetupUrl = hasMeetupLink ? `${MEETUP_EVENT_URL}/${event.data.meetupId}/` : undefined;

  const title: ReactNode = isCancelled ? (
    <b>Sorry, this event has been cancelled!</b>
  ) : (
    <>
      This event{" "}
      <b>
        <EventCountdown event={event} asString capitalize={false} />
      </b>
      !
    </>
  );

  const description = isCancelled
    ? "We hope to see you at another meetup soon."
    : `Reserve your spot on Meetup.com${isCompact ? "!" : " before it's too late!"}`;

  const color: AlertColor = isCancelled ? "error" : "warning";
  const IconComponent = isCancelled ? LuCalendarX : LuCalendarCheck;
  const buttonHref = !isCancelled ? meetupUrl : undefined;

  return (
    <div
      className={clsx(
        "alert text-dark-neutral flex gap-6 p-6",
        alertVariantClass[color],
        isCompact
          ? "flex-col items-start 2xl:!flex-row 2xl:!items-center"
          : "flex-col items-start sm:flex-row sm:items-center",
      )}
    >
      <div className="flex flex-grow flex-col gap-2">
        <div className="flex flex-grow items-center gap-3">
          <div>
            <IconComponent size={24} />
          </div>
          <div className={clsx(isCompact ? "text-lg 2xl:!text-sm" : "text-lg")}>{title}</div>
        </div>
        {description && (
          <div className={clsx(isCompact ? "text-lg 2xl:!text-sm" : "text-base")}>
            {description}
          </div>
        )}
      </div>
      {buttonHref && (
        <div className={clsx(isCompact ? "w-full 2xl:!w-auto" : "w-full sm:w-auto")}>
          <a
            href={buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "btn btn-neutral whitespace-nowrap",
              isCompact ? "btn-lg w-full" : "btn-lg",
            )}
          >
            <LuTicket />
            RSVP Now
          </a>
        </div>
      )}
    </div>
  );
}
