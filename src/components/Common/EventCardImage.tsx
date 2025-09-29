import { memo } from "react";

import clsx from "clsx";

import type { EventEnriched } from "@/content";
import { isEventUpcoming } from "@/utils/eventFilters";

import EventCountdown from "./EventCountdown";

type Variant = "compact" | "polaroid" | "big";

interface EventCardImageProps {
  event: EventEnriched;
  variant: Variant;
  first?: boolean;
  last?: boolean;
  cityComponent?: React.ReactNode;
}

export default memo(function EventCardImage({ event, variant }: EventCardImageProps) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden !rounded-br-none",
        variant === "compact" && "rounded-box-inner-tight h-full w-32 md:w-42",
        variant !== "compact" && "rounded-box-inner",
      )}
    >
      {variant !== "compact" && isEventUpcoming(event) && (
        <div className="absolute top-3 left-3">
          <EventCountdown event={event} />
        </div>
      )}
      <figure className={clsx("bg-base-400 h-full w-full")}>
        <img
          src={event.data.cover.src}
          srcSet={event.data.cover.srcSet}
          sizes={event.data.cover.sizes}
          alt={event.data.title}
          loading={event.priority ? "eager" : "lazy"}
          fetchPriority={event.priority ? "high" : "auto"}
          className="h-full w-full object-cover"
        />
      </figure>
    </div>
  );
});
