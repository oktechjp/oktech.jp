import { memo } from "react";

import clsx from "clsx";

import type { EventEnriched } from "@/content";

import EventCardCountdown from "./EventCardCountdown";

type Variant = "compact" | "polaroid" | "big";

interface EventCardImageProps {
  event: EventEnriched;
  variant: Variant;
  first?: boolean;
  last?: boolean;
  cityComponent?: React.ReactNode;
}

export default memo(function EventCardImage({ event, variant, first, last }: EventCardImageProps) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden",
        variant === "compact" && "rounded-box-inner-tight hidden sm:block",
        variant === "compact" && first && "first",
        variant === "compact" && last && "last",
        variant !== "compact" && "rounded-box-inner",
      )}
    >
      {/* {JSON.stringify({ first, last })} */}
      {variant !== "compact" && (
        <div className="absolute top-3 left-3">
          <EventCardCountdown event={event} />
        </div>
      )}
      <figure
        className={clsx(
          "bg-base-300",
          variant === "compact" ? "aspect-video w-42" : "aspect-video h-full w-full",
        )}
      >
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
