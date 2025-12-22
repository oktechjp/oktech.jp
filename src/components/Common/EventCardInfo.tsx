import { Children } from "react";

import clsx from "clsx";
import { LuBuilding2, LuCalendar, LuClock } from "react-icons/lu";

import type { EventEnriched } from "@/content";
import { formatDate, formatDuration, formatTime, getEndTime } from "@/utils/formatDate";

import EventStatusBadge from "./EventStatusBadge";
import Link from "./Link";

type Variant = "compact" | "polaroid" | "big";
type InfoField = "countdown" | "date" | "time" | "venue";

function InfoItem({
  children,
  variant,
  Icon,
  noWrap,
}: {
  children: React.ReactNode;
  variant?: Variant;
  Icon?: React.ElementType;
  noWrap?: boolean;
}) {
  if (!children || Children.count(children) === 0) return null;
  const isCompact = variant === "compact";

  return (
    <div
      className={clsx(
        "flex",
        isCompact ? "items-center gap-1" : "items-start gap-2",
        !isCompact && noWrap && "fade-overflow overflow-hidden whitespace-nowrap",
      )}
    >
      {Icon && (
        <div
          className={clsx(
            "flex w-4 flex-shrink-0",
            isCompact ? "hidden items-center sm:block" : "mt-1 items-start",
          )}
        >
          <Icon />
        </div>
      )}
      <div className={clsx("flex-shrink", isCompact ? "whitespace-nowrap" : "line-clamp-3")}>
        {children}
      </div>
    </div>
  );
}

export default function EventCardInfo({
  event,
  variant,
  fullAddress = false,
  fields = ["countdown", "date", "time", "venue"],
}: {
  event: EventEnriched;
  variant?: Variant;
  fullAddress?: boolean;
  fields?: InfoField[];
}) {
  const isCompact = variant === "compact";
  const showCountdown = fields.includes("countdown");
  const showDate = fields.includes("date");
  const showTime = fields.includes("time");
  const showVenue = fields.includes("venue");
  const showBadge = showCountdown && isCompact;
  const address = event.venue?.address;
  const noWrap = !fullAddress;
  const linkToVenue = fullAddress && event.venue?.hasPage ? `/venue/${event.venue?.id}` : undefined;
  return (
    <div
      className={clsx(
        "text-base-700 flex",
        isCompact && "fade-overflow flex-row items-center gap-3",
        variant === "polaroid" && "flex-col gap-2",
        variant === "big" && "flex-col gap-2",
      )}
    >
      {showBadge && <EventStatusBadge event={event} className="badge-sm sm:badge-md" />}
      {showDate && (
        <InfoItem Icon={LuCalendar} {...{ noWrap, variant }}>
          {formatDate(event.data.dateTime, "long")}
        </InfoItem>
      )}
      {showTime && (
        <InfoItem Icon={LuClock} {...{ noWrap, variant }}>
          {formatTime(event.data.dateTime)}
          {event.data.duration && (
            <>
              {" to "}
              {formatTime(getEndTime(event.data.dateTime, event.data.duration)!)}
              {" ("}
              {formatDuration(event.data.duration)}
              {")"}
            </>
          )}
        </InfoItem>
      )}
      {showVenue && event.venue && (
        <InfoItem Icon={LuBuilding2} {...{ noWrap, variant }}>
          <div className={clsx("flex", !isCompact ? "flex-col gap-1" : "gap-1")}>
            <div>
              {linkToVenue ? (
                <Link className="text-link" href={linkToVenue}>
                  {event.venue.title}
                </Link>
              ) : (
                <span>{event.venue.title}</span>
              )}
            </div>
            {(fullAddress || isCompact) && address && <div>{address}</div>}
          </div>
        </InfoItem>
      )}
    </div>
  );
}
