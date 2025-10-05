import { Children } from "react";

import clsx from "clsx";
import { LuBuilding2, LuCalendar, LuClock } from "react-icons/lu";

import type { EventEnriched } from "@/content";
import { isEventUpcoming } from "@/utils/eventFilters";
import { formatDate, formatDuration, formatTime, getEndTime } from "@/utils/formatDate";

import CityBadge from "./CityBadge";
import EventCountdown from "./EventCountdown";
import Link from "./Link";

type Variant = "compact" | "polaroid" | "big";

function InfoItem({
  children,
  variant,
  Icon,
}: {
  children: React.ReactNode;
  variant: Variant;
  Icon?: React.ElementType;
}) {
  // Return null if children is falsy or if it's an empty React fragment/array
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

export function EventCardInfo({
  event,
  variant,
  linkToVenue,
}: {
  event: EventEnriched;
  variant: Variant;
  linkToVenue?: string;
}) {
  return (
    <div
      className={clsx(
        "text-base-700 flex",
        variant === "compact" && "fade-overflow flex-row items-center gap-4",
        variant === "polaroid" && "flex-col gap-2",
        variant === "big" && "flex-col gap-2",
      )}
    >
      {variant === "compact" && isEventUpcoming(event) && (
        <EventCountdown
          event={event}
          className="badge-md"
          wrapper={(content) => <InfoItem variant={variant}>{content}</InfoItem>}
        />
      )}
      <InfoItem variant={variant} Icon={LuCalendar}>
        {formatDate(event.data.dateTime, "long")}
      </InfoItem>
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
      {variant === "compact" && <InfoItem variant={variant}>{event.venue?.address}</InfoItem>}
    </div>
  );
}

interface EventCardDescriptionProps {
  event: EventEnriched;
  variant: Variant;
}

export default function EventCardDescription({ event, variant }: EventCardDescriptionProps) {
  const smallPolaroid = variant === "big" || variant === "polaroid";
  return (
    <div
      className={clsx(
        "flex min-w-0 flex-1 flex-col justify-between",
        smallPolaroid && "justify-between gap-4 px-4 py-4",
      )}
    >
      {/* title and info */}
      <div
        className={clsx(
          "flex flex-grow flex-col",
          variant === "compact" && "gap-2 p-2 md:gap-4 md:p-4",
          smallPolaroid && "gap-4",
          variant === "big" && "md:justify-center md:gap-6",
        )}
      >
        <div className={clsx("flex justify-between", variant === "compact" ? "gap-4" : "gap-8")}>
          <h3
            className={clsx(
              "line-clamp-2",
              variant === "compact" && "truncate text-base sm:text-xl md:text-xl",
              smallPolaroid && "text-xl",
              variant === "big" && "text-xl",
            )}
          >
            {event.data.title}
          </h3>
          {variant === "compact" && (
            <CityBadge className="badge-sm sm:badge-md" city={event.venue?.city} />
          )}
        </div>
        <div className="text-sm md:text-base">
          <EventCardInfo event={event} variant={variant} />
        </div>
      </div>
      {/* footer */}
      {variant !== "compact" && (
        <div className="flex items-center justify-between gap-4">
          <CityBadge city={event.venue?.city} />
          <div className="fade-overflow flex gap-2 whitespace-nowrap">
            {event.data.topics?.map((topic) => (
              <span key={topic} className="text-base-500 text-xs">
                #{topic.replace(" ", "")}
              </span>
            ))}
          </div>

          {/* <div className="btn btn-sm btn-circle">
            <LuArrowUpRight className="h-4 w-4" />
          </div> */}
        </div>
      )}
    </div>
  );
}
