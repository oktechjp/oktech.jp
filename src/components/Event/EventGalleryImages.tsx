import "react-photo-album/rows.css";

import { useCallback, useMemo, useState } from "react";

import { LuImageOff } from "react-icons/lu";
import { RowsPhotoAlbum } from "react-photo-album";
import SSR from "react-photo-album/ssr";

import EventGalleryLightbox from "@/components/Event/EventGalleryLightbox";
import type { EventEnriched, GalleryImage } from "@/content";
import { isEventUpcoming } from "@/utils/eventFilters";

interface Props {
  event: EventEnriched;
  class?: string;
}

// Helper function to transform images for gallery
const transformImagesForGallery = (images: GalleryImage[]) => {
  return images.map((img) => {
    const imageData = img.thumbnail;

    // Extract srcSet items for responsive images
    const srcSetItems = imageData.srcSet
      .split(",")
      .map((item: string) => item.trim())
      .map((item: string) => {
        const [url, widthStr] = item.split(" ");
        return {
          src: url,
          width: parseInt(widthStr.replace("w", ""), 10),
        };
      });

    const { width, height } = img.dimensions;

    return {
      src: imageData.src,
      width,
      height,
      alt: img.data.caption || "",
      srcSet: srcSetItems.map((item: { src: string; width: number }) => ({
        src: item.src,
        width: item.width,
        height: Math.round(item.width * (height / width)),
      })),
      key: img.id,
      title: img.data.caption || "",
    };
  });
};

export default function EventGalleryImages({ event }: Props) {
  const galleryImages = event.galleryImages || [];
  const reversedImages = useMemo(() => galleryImages.slice().reverse(), [galleryImages]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Check if event is upcoming (using the 30-minute buffer logic)
  const isUpcoming = isEventUpcoming(event);

  // Transform images for react-photo-album
  const thumbs = useMemo(() => transformImagesForGallery(reversedImages), [reversedImages]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleImageClick = useCallback(({ index }: { index: number }) => {
    setSelectedIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  if (isUpcoming || galleryImages.length === 0) {
    return (
      <div className="text-base-content/40 m-auto flex items-center gap-3">
        <LuImageOff className="h-6 w-6" />
        <span>
          {isUpcoming
            ? "Gallery will be available after the event"
            : "This event doesn't have a gallery yet"}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-box glass-card">
        <div className="rounded-box-inner overflow-hidden">
          <SSR breakpoints={[640, 768, 1024, 1280]}>
            <RowsPhotoAlbum
              photos={thumbs}
              // targetRowHeight={240}
              targetRowHeight={300}
              onClick={handleImageClick}
              spacing={8}
              componentsProps={{
                button: {
                  "aria-label": "View larger image",
                  className: "hover:opacity-90 transition-opacity",
                  style: { cursor: "pointer" },
                },
                image: {
                  className: "bg-base-300 w-full h-full object-cover",
                },
              }}
            />
          </SSR>
        </div>
      </div>
      <EventGalleryLightbox
        key={selectedIndex}
        event={event}
        images={reversedImages}
        isOpen={selectedIndex !== null}
        initialIndex={selectedIndex || 0}
        onClose={handleClose}
        autoplay={false}
      />
    </>
  );
}
