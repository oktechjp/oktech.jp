import { memo } from "react";

import clsx from "clsx";

import type { EventEnriched } from "@/content";
import { isEventUpcoming } from "@/utils/eventFilters";

import EventStatusBadge from "./EventStatusBadge";

type Variant = "compact" | "polaroid" | "big";

interface EventCardImageProps {
  event: EventEnriched;
  variant: Variant;
  first?: boolean;
  last?: boolean;
  cityComponent?: React.ReactNode;
}

export default memo(function EventCardImage({ event, variant }: EventCardImageProps) {
  const isCancelled = event.data.isCancelled === true;
  const isUpcoming = isEventUpcoming(event);
  const cover =
    variant === "compact"
      ? event.data.coverCompact
      : variant === "big"
        ? event.data.coverBig
        : event.data.coverPolaroid;

  return (
    <div
      className={clsx(
        "relative overflow-hidden !rounded-br-none",
        variant === "compact" &&
          "rounded-box-inner-tight aspect-[4/3] h-full w-24 sm:aspect-video sm:w-32 md:w-42",
        variant !== "compact" && "rounded-box-inner",
      )}
    >
      {variant !== "compact" && (isCancelled || isUpcoming) && (
        <div className="absolute top-3 left-3 z-10">
          <EventStatusBadge event={event} />
        </div>
      )}
      <figure className={clsx("bg-base-400 h-full w-full")}>
        <img
          src={cover.src}
          srcSet={cover.srcSet}
          sizes={cover.sizes}
          alt={event.data.title}
          fetchPriority={event.priority ? "high" : "auto"}
          className={clsx("h-full w-full object-cover", isCancelled && "grayscale")}
        />
      </figure>
    </div>
  );
});
