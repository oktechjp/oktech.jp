import { useEffect, useMemo, useState } from "react";

import { LuPresentation } from "react-icons/lu";

import EventGalleryLightbox from "@/components/Event/EventGalleryLightbox";
import type { EventEnriched, GalleryImage } from "@/content";

interface Props {
  events: EventEnriched[];
}

interface ImageWithEvent {
  image: GalleryImage;
  event: EventEnriched;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function MegaSlideshowButton({ events }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [shuffledImagesWithEvents, setShuffledImagesWithEvents] = useState<ImageWithEvent[]>([]);

  // Collect all images with their event metadata
  const allImagesWithEvents = useMemo(() => {
    const imagesWithEvents: ImageWithEvent[] = [];
    events.forEach((event) => {
      if (event.galleryImages?.length) {
        event.galleryImages.forEach((image) => {
          imagesWithEvents.push({ image, event });
        });
      }
    });
    return imagesWithEvents;
  }, [events]);

  // Shuffle images when slideshow opens
  useEffect(() => {
    if (isOpen && allImagesWithEvents.length > 0) {
      const shuffled = shuffleArray(allImagesWithEvents);
      setShuffledImagesWithEvents(shuffled);
    }
  }, [isOpen, allImagesWithEvents]);

  if (allImagesWithEvents.length === 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-outline btn-sm gap-2"
        aria-label="Start slideshow of all photos"
      >
        <LuPresentation className="h-4 w-4" />
        Slideshow
      </button>

      {shuffledImagesWithEvents.length > 0 && (
        <EventGalleryLightbox
          showLogo
          imagesWithEvents={shuffledImagesWithEvents}
          isOpen={isOpen}
          initialIndex={0}
          onClose={() => setIsOpen(false)}
          autoplay={true}
        />
      )}
    </>
  );
}
