import { memo } from "react";

import { animated, useSpring } from "@react-spring/web";
import clsx from "clsx";

import CityBadge from "@/components/Common/CityBadge";
import Link from "@/components/Common/Link";
import type { EventEnriched } from "@/content";

import EventCardDescription from "./EventCardDescription";
import EventCardImage from "./EventCardImage";

type Variant = "compact" | "polaroid" | "big";

const EventCard = memo(function EventCard({
  event,
  index = 0,
  count = 1,
  variant = "compact",
}: {
  event: EventEnriched;
  index?: number;
  count?: number;
  variant?: Variant;
}) {
  const first = index === 0;
  const last = index === count - 1;
  const odd = index !== undefined && index % 2 === 1;
  const border = index === undefined;
  const eventUrl = `/events/${event.id}`;

  const [springs, api] = useSpring(() => ({
    scale: 1,
    config: { mass: 0.5, tension: 300, friction: 10 },
  }));

  const AnimatedLink = animated(Link);

  return (
    <AnimatedLink
      href={eventUrl}
      data-astro-prefetch
      className={clsx(
        "ok-card",
        // border && "rounded-box overflow-hidden",
        // !border && "border-t-0 border-r-0 border-l-0",
        variant === "compact" && "flex items-center",
        variant !== "compact" && "rounded-box",
        variant === "polaroid" && "flex flex-col",
        variant === "big" && "flex flex-col sm:grid sm:grid-cols-2",
      )}
      data-testid={`event-card-${event.id}`}
      style={{
        transform: springs.scale.to((s) => `scale3d(${s}, ${s}, 1)`),
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onMouseEnter={() => api.start({ scale: 1.05 })}
      onMouseLeave={() => api.start({ scale: 1 })}
      onMouseDown={() => api.start({ scale: 0.98 })}
      onMouseUp={() => api.start({ scale: 1.05 })}
      onTouchStart={() => api.start({ scale: 0.98 })}
      onTouchEnd={() => api.start({ scale: 1 })}
    >
      <EventCardImage
        event={event}
        variant={variant}
        first={first}
        last={last}
        cityComponent={
          <CityBadge
            city={event.venue?.city}
            className="rounded-tr-none rounded-br-none rounded-bl-none pl-4"
          />
        }
      />
      <EventCardDescription event={event} variant={variant} />
    </AnimatedLink>
  );
});

export default EventCard;

export function EventCardList({ events }: { events: EventEnriched[] }) {
  return (
    <>
      {events.map((event, index) => (
        <EventCard
          key={event.id}
          variant="compact"
          event={event}
          index={index}
          count={events.length}
        />
      ))}
    </>
  );
}
