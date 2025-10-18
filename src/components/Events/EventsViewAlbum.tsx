import { useMemo } from "react";

import Container from "@/components/Common/Container";
import EventCardInfo from "@/components/Common/EventCardInfo";
import GalleryDisclaimer from "@/components/Common/GalleryDisclaimer";
import MegaSlideshowButton from "@/components/Common/MegaSlideshowButton";
import EventGalleryImages from "@/components/Event/EventGalleryImages";
import type { EventEnriched } from "@/content";
import { filterRecentEvents } from "@/utils/eventFilters";
import useIncrementalVisibility from "@/utils/hooks/useIncrementalVisibility";

import CityBadge from "../Common/CityBadge";
import Link from "../Common/Link";

interface Props {
  events: EventEnriched[];
}

export default function EventsViewAlbum({ events }: Props) {
  // Only show past events (events that have ended including 30-minute buffer)
  const pastEventsWithImages = useMemo(
    () =>
      filterRecentEvents(events)
        // only show events with images
        .filter((event) => event.galleryImages?.length),
    [events],
  );

  const { visibleCount, sentinelRef, hasMore } = useIncrementalVisibility(
    pastEventsWithImages.length,
    {
      batchSize: 3,
      resetKey: pastEventsWithImages,
    },
  );

  const visibleEvents = pastEventsWithImages.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-24">
      <Container wide>
        <div className="flex justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="sub-title">Photo Album</h1>
            <div className="text-base-700 sub-sub-title">
              Events without images are hidden on this page.
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <GalleryDisclaimer position="left" />
            <MegaSlideshowButton events={pastEventsWithImages} />
          </div>
        </div>
      </Container>
      <section className="flex flex-col gap-32">
        {visibleEvents.map((event) => (
          <div key={event.id}>
            <Container wide className="flex flex-col gap-8">
              <Link
                href={`/events/${event.id}`}
                className="flex flex-col gap-4 transition-opacity hover:opacity-80 md:flex-row md:items-end md:justify-between"
              >
                <h2 className="text-2xl font-bold">{event.data.title}</h2>
                <div className="flex flex-row items-start gap-4 md:flex-row-reverse">
                  <CityBadge city={event.venue?.city} />
                  <EventCardInfo event={event} variant="big" fields={["date"]} fullAddress />
                </div>
              </Link>
              <EventGalleryImages event={event} />
            </Container>
          </div>
        ))}
        <div
          ref={sentinelRef}
          aria-hidden
          className={hasMore ? "h-4" : "h-0"}
        />
      </section>
    </div>
  );
}
