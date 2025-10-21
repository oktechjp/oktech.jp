import { useMemo } from "react";

import Container from "@/components/Common/Container";
import EventCardInfo from "@/components/Common/EventCardInfo";
import GalleryDisclaimer from "@/components/Common/GalleryDisclaimer";
import MegaSlideshowButton from "@/components/Common/MegaSlideshowButton";
import EventGalleryImages from "@/components/Event/EventGalleryImages";
import type { EventEnriched } from "@/content";
import { useIncrementalVisibility } from "@/hooks/useIncrementalVisibility";
import { filterRecentEvents } from "@/utils/eventFilters";

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

  const { visibleCount, registerTrigger, hasMore } = useIncrementalVisibility(
    pastEventsWithImages.length,
    {
      batchSize: 3,
      resetKey: pastEventsWithImages,
      rootMargin: "0px 0px 200px 0px",
    },
  );

  const visibleEvents = pastEventsWithImages.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-24">
      <Container wide>
        <div className="gap-responsive flex flex-col md:flex-row md:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="sub-title">Photo Album</h1>
            <div className="text-base-700 sub-sub-title">
              Events without images are hidden on this page.
            </div>
          </div>
          <div className="flex items-end gap-2 md:flex-col">
            <GalleryDisclaimer />
            <MegaSlideshowButton events={pastEventsWithImages} />
          </div>
        </div>
      </Container>
      <section className="flex flex-col gap-32">
        {visibleEvents.map((event, index) => {
          const isLastVisible = index === visibleEvents.length - 1;

          return (
            <div key={event.id} ref={isLastVisible && hasMore ? registerTrigger : undefined}>
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
          );
        })}
      </section>
    </div>
  );
}
