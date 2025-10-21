"use client";

import clsx from "clsx";
import { LuCalendarX } from "react-icons/lu";

import type { EventEnriched } from "@/content";
import { isEventUpcoming } from "@/utils/eventFilters";

import EventCountdown from "./EventCountdown";

interface EventStatusBadgeProps {
  event: EventEnriched;
  className?: string;
}

export default function EventStatusBadge({ event, className = "badge-lg" }: EventStatusBadgeProps) {
  const isCancelled = event.data.isCancelled === true;

  if (isCancelled) {
    return (
      <div className={clsx("badge badge-error text-dark-neutral gap-2", className)}>
        <LuCalendarX />
        Cancelled
      </div>
    );
  }

  if (!isEventUpcoming(event)) {
    return null;
  }

  return <EventCountdown event={event} className={className} />;
}
