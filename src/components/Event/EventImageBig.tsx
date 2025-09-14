import type { EventEnriched } from "@/content";

export default function EventImageBig({ event }: { event: EventEnriched }) {
  return (
    <figure className="glass-card relative aspect-video w-full overflow-hidden">
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
