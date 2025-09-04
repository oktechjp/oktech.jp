import { Children } from "react";

import clsx from "clsx";
import { LuArrowUpRight, LuBuilding2, LuCalendar, LuClock } from "react-icons/lu";

import type { EventEnriched } from "@/content";
import { formatDate, formatDuration, formatTime, getEndTime } from "@/utils/formatDate";

import CityBadge from "./CityBadge";
import EventCardCountdown from "./EventCardCountdown";

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
    <div
      className={clsx(
        "flex items-center gap-2",
        variant === "compact" ? "text-sm whitespace-nowrap md:text-base" : "line-clamp-2",
      )}
    >
      {Icon && <Icon />}
      {children}
    </div>
  );
}

function Info({ event, variant }: { event: EventEnriched; variant: Variant }) {
  return (
    <div
      className={clsx(
        "text-base-content/70 flex",
        variant === "compact" && "fade-overflow flex-row items-center gap-4",
        variant === "polaroid" && "flex-col gap-2",
        variant === "big" && "flex-col gap-2 sm:text-lg",
      )}
    >
      {variant === "compact" && (
        <EventCardCountdown
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
        {event.venue?.title}
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
        smallPolaroid && "justify-between gap-4 px-6 py-4",
      )}
    >
      {/* title and info */}
      <div
        className={clsx(
          "flex flex-grow flex-col",
          variant === "compact" && "gap-2 px-5 py-4",
          smallPolaroid && "gap-4",
          variant === "big" && "md:justify-center md:gap-6",
        )}
      >
        <div className="flex justify-between gap-8">
          <h3
            className={clsx(
              "line-clamp-2",
              variant === "compact" && "truncate text-base sm:text-lg md:text-xl",
              smallPolaroid && "text-xl",
              variant === "big" && "sm:text-2xl",
            )}
          >
            {event.data.title}
          </h3>
          {variant === "compact" && <CityBadge city={event.venue?.city} />}
        </div>
        <Info event={event} variant={variant} />
      </div>
      {/* footer */}
      {variant !== "compact" && (
        <div className="flex items-center justify-between gap-4">
          <CityBadge city={event.venue?.city} />
          <div className="fade-overflow flex gap-2 whitespace-nowrap">
            {event.data.topics?.map((topic) => (
              <span key={topic} className="text-base-content/70 text-sm">
                #{topic.replace(" ", "")}
              </span>
            ))}
          </div>

          <div className="btn btn-sm btn-circle">
            <LuArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
}
