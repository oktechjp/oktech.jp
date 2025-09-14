import Container from "@/components/Common/Container";
import { EventCardList } from "@/components/Common/EventCard";
import GalleryDisclaimer from "@/components/Common/GalleryDisclaimer";
import MegaSlideshowButton from "@/components/Common/MegaSlideshowButton";
import SimpleSection from "@/components/Common/SimpleSection";
import EventGalleryImages from "@/components/Event/EventGalleryImages";
import type { EventEnriched } from "@/content";
import { filterRecentEvents } from "@/utils/eventFilters";

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
      <SimpleSection
        title="Photo Album"
        subTitle="Events without images are hidden on this page."
        element={
          <div className="flex items-center gap-2">
            <GalleryDisclaimer position="bottom" />
            <MegaSlideshowButton events={pastEventsWithImages} />
          </div>
        }
      />
      <section className="flex flex-col gap-32">
        {pastEventsWithImages.map((event) => (
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
