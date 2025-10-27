import type { EventEnriched } from "@/content";

export default function EventImageBig({ event }: { event: EventEnriched }) {
  return (
    <figure className="rounded-box aspect-video w-full overflow-hidden">
      <img
        src={event.data.coverPage.src}
        srcSet={event.data.coverPage.srcSet}
        sizes={event.data.coverPage.sizes}
        alt={event.data.title}
        fetchPriority="high"
        className="h-full w-full object-cover"
      />
    </figure>
  );
}
