import { Children } from "react";

import clsx from "clsx";
import { LuBuilding2, LuCalendar, LuClock } from "react-icons/lu";

import type { EventEnriched } from "@/content";
import { isEventUpcoming } from "@/utils/eventFilters";
import { formatDate, formatDuration, formatTime, getEndTime } from "@/utils/formatDate";

import EventCountdown from "./EventCountdown";
import Link from "./Link";

type Variant = "compact" | "polaroid" | "big";
type InfoField = "countdown" | "date" | "time" | "venue";

function InfoItem({
  children,
  variant,
  Icon,
}: {
  children: React.ReactNode;
  variant: Variant;
  Icon?: React.ElementType;
}) {
  if (!children || Children.count(children) === 0) return null;

  return (
    <div className={clsx("flex gap-2", variant === "compact" ? "items-center" : "items-start")}>
      {Icon && (
        <div
          className={clsx(
            "flex w-4 flex-shrink-0",
            variant === "compact" ? "items-center" : "mt-1 items-start",
          )}
        >
          <Icon />
        </div>
      )}
      <div
        className={clsx(
          "flex-shrink",
          variant === "compact" ? "whitespace-nowrap" : "line-clamp-3",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function EventCardInfo({
  event,
  variant,
  linkToVenue,
  fields = ["countdown", "date", "time", "venue"],
}: {
  event: EventEnriched;
  variant: Variant;
  linkToVenue?: string;
  fields?: InfoField[];
}) {
  const showCountdown = fields.includes("countdown");
  const showDate = fields.includes("date");
  const showTime = fields.includes("time");
  const showVenue = fields.includes("venue");

  return (
    <div
      className={clsx(
        "text-base-700 flex",
        variant === "compact" && "fade-overflow flex-row items-center gap-4",
        variant === "polaroid" && "flex-col gap-2",
        variant === "big" && "flex-col gap-2",
      )}
    >
      {showCountdown && variant === "compact" && isEventUpcoming(event) && (
        <EventCountdown
          event={event}
          className="badge-md"
          wrapper={(content) => <InfoItem variant={variant}>{content}</InfoItem>}
        />
      )}
      {showDate && (
        <InfoItem variant={variant} Icon={LuCalendar}>
          {formatDate(event.data.dateTime, "long")}
        </InfoItem>
      )}
      {showTime && (
        <InfoItem variant={variant} Icon={LuClock}>
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
      {showVenue && (
        <InfoItem variant={variant} Icon={LuBuilding2}>
          <div className={clsx("flex", variant !== "compact" ? "flex-col gap-1" : "gap-1")}>
            <div>
              {linkToVenue ? (
                <Link className="text-link" href={linkToVenue}>
                  {event.venue?.title}
                </Link>
              ) : (
                <span>{event.venue?.title}</span>
              )}
            </div>
            <div>{event.venue?.address}</div>
          </div>
        </InfoItem>
      )}
      {showVenue && variant === "compact" && (
        <InfoItem variant={variant}>{event.venue?.address}</InfoItem>
      )}
    </div>
  );
}
