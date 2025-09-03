import type { EventEnriched } from "@/content";

import EventCardCountdown from "../EventCard/EventCardCountdown";

export default function EventImageBig({ event }: { event: EventEnriched }) {
  return (
    <figure className="glass-card relative aspect-video w-full overflow-hidden">
      <div className="absolute top-3 left-3">
        <EventCardCountdown event={event} />
      </div>
      <img
        src={event.data.cover.src}
        srcSet={event.data.cover.srcSet}
        sizes={event.data.cover.sizes}
        alt={event.data.title}
        loading="eager"
        fetchPriority="high"
        className="h-full w-full object-cover"
      />
    </figure>
  );
}
