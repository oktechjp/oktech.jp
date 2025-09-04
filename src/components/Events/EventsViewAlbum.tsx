import Container from "@/components/Common/Container";
import { EventCardList } from "@/components/Common/EventCard";
import GalleryDisclaimer from "@/components/Common/GalleryDisclaimer";
import SimpleSection from "@/components/Common/SimpleSection";
import EventGalleryImages from "@/components/Event/EventGalleryImages";
import type { EventEnriched } from "@/content";
import { filterRecentEvents } from "@/utils/eventFilters";

interface Props {
  events: EventEnriched[];
}

export default function EventsViewAlbum({ events }: Props) {
  // Only show past events (events that have ended including 30-minute buffer)
  const recentEvents = filterRecentEvents(events)
    // only show event swith images
    .filter((event) => event.galleryImages?.length);

  return (
    <div className="flex flex-col gap-24">
      <SimpleSection
        title="Photo Album"
        subTitle="Events without images are hidden on this page."
        element={<GalleryDisclaimer position="bottom" />}
      />
      <section className="flex flex-col gap-32">
        {recentEvents.map((event) => (
          <div key={event.id}>
            <Container>
              <EventCardList events={[event]} />
            </Container>
            <Container wide className="mt-6">
              <EventGalleryImages event={event} />
            </Container>
          </div>
        ))}
      </section>
    </div>
  );
}
