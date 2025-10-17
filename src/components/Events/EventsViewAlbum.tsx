import Container from "@/components/Common/Container";
import EventCardInfo from "@/components/Common/EventCardInfo";
import GalleryDisclaimer from "@/components/Common/GalleryDisclaimer";
import MegaSlideshowButton from "@/components/Common/MegaSlideshowButton";
import EventGalleryImages from "@/components/Event/EventGalleryImages";
import type { EventEnriched } from "@/content";
import { filterRecentEvents } from "@/utils/eventFilters";

import CityBadge from "../Common/CityBadge";
import Link from "../Common/Link";

interface Props {
  events: EventEnriched[];
}

export default function EventsViewAlbum({ events }: Props) {
  // Only show past events (events that have ended including 30-minute buffer)
  const pastEventsWithImages = filterRecentEvents(events)
    // only show event swith images
    .filter((event) => event.galleryImages?.length);

  return (
    <div className="flex flex-col gap-24">
      <Container wide>
        <div className="flex justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl">OKTech Photo Album</h1>
            <div className="text-base-700 text-xl">
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
        {pastEventsWithImages.map((event) => (
          <div key={event.id}>
            <Container wide className="flex flex-col gap-8">
              <Link
                href={`/events/${event.id}`}
                className="flex justify-between gap-2 transition-opacity hover:opacity-80"
              >
                <h2 className="text-2xl font-bold">{event.data.title}</h2>
                <div className="flex items-center gap-4">
                  <EventCardInfo event={event} variant="big" fields={["date"]} fullAddress />
                  <CityBadge city={event.venue?.city} />
                </div>
              </Link>
              <EventGalleryImages event={event} />
            </Container>
          </div>
        ))}
      </section>
    </div>
  );
}
