import { animated, useSpring } from "@react-spring/web";
import clsx from "clsx";

import Link from "@/components/Common/Link";
import type { EventEnriched } from "@/content";

import EventCardDescription from "./EventCardDescription";
import EventCardImage from "./EventCardImage";

type Variant = "compact" | "polaroid" | "big";

function EventCard({
  event,
  variant = "compact",
  className = "",
  style,
}: {
  event: EventEnriched;
  index?: number;
  count?: number;
  variant?: Variant;
  className?: string;
  style?: React.CSSProperties;
}) {
  const eventUrl = `/events/${event.id}`;

  const [springs, api] = useSpring(() => ({
    scale: 1,
    config: { mass: 0.5, tension: 300, friction: 10 },
  }));

  const AnimatedLink = animated(Link);

  return (
    <AnimatedLink
      href={eventUrl}
      prefetch
      data-testid={`event-card-${event.id}`}
      onMouseEnter={() => api.start({ scale: 1.05 })}
      onMouseLeave={() => api.start({ scale: 1 })}
      onMouseDown={() => api.start({ scale: 0.98 })}
      onMouseUp={() => api.start({ scale: 1.05 })}
      style={{
        ...style,
        transform: springs.scale.to((s) => `scale3d(${s}, ${s}, 1)`),
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      className={clsx(
        "ok-card",
        variant === "compact" && "flex items-center",
        variant !== "compact" && "rounded-box",
        variant === "polaroid" && "flex flex-col",
        variant === "big" && "flex flex-col sm:grid sm:grid-cols-2",
        className,
      )}
    >
      <EventCardImage event={event} variant={variant} />
      <EventCardDescription event={event} variant={variant} />
    </AnimatedLink>
  );
}

export default EventCard;

export function EventCardList({ events }: { events: EventEnriched[] }) {
  return (
    <div className="flex flex-col gap-4">
      {events.map((event, index) => (
        <EventCard
          key={event.id}
          variant="compact"
          event={event}
          index={index}
          count={events.length}
        />
      ))}
    </div>
  );
}
