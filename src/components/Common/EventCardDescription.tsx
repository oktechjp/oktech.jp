import clsx from "clsx";

import type { EventEnriched } from "@/content";

import CityBadge from "./CityBadge";
import EventCardInfo from "./EventCardInfo";

type Variant = "compact" | "polaroid" | "big";

interface EventCardDescriptionProps {
  event: EventEnriched;
  variant: Variant;
}

export default function EventCardDescription({ event, variant }: EventCardDescriptionProps) {
  const smallPolaroid = variant === "big" || variant === "polaroid";
  const isCompact = variant === "compact";
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
          isCompact && "gap-2 pr-2 pl-1 md:gap-4 md:p-4",
          smallPolaroid && "gap-4",
          variant === "big" && "md:justify-center md:gap-6",
        )}
      >
        <div className={clsx("flex items-start justify-between", isCompact ? "gap-2" : "gap-8")}>
          <h3
            className={clsx(
              "line-clamp-2",
              isCompact && "text-sm sm:truncate sm:text-base md:text-xl",
              smallPolaroid && "text-xl",
              variant === "big" && "text-xl",
            )}
          >
            {event.data.title}
          </h3>
          {isCompact && <CityBadge className="badge-xs sm:badge-md" city={event.venue?.city} />}
        </div>
        <div className="text-xs sm:text-sm md:text-base">
          <EventCardInfo event={event} variant={variant} />
        </div>
      </div>
      {variant !== "compact" && (
        <div className="flex items-center justify-start gap-4">
          <CityBadge city={event.venue?.city} />
          <div className="fade-overflow flex flex-grow gap-2 overflow-hidden whitespace-nowrap">
            {event.data.topics?.map((topic) => (
              <span key={topic} className="text-base-500 text-xs">
                #{topic.replace(" ", "")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
