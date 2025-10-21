import GalleryDisclaimer from "@/components/Common/GalleryDisclaimer";
import type { EventEnriched } from "@/content";

import Container from "../Common/Container";
import EventGalleryImages from "./EventGalleryImages";

interface Props {
  event: EventEnriched;
  class?: string;
}

export default function EventGallery({ event }: Props) {
  const galleryImages = event.galleryImages || [];

  if (galleryImages.length === 0) {
    return null;
  }

  return (
    <Container wide className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h3 className="sub-title">Event Gallery</h3>
        <GalleryDisclaimer />
      </div>
      <EventGalleryImages event={event} />
    </Container>
  );
}
