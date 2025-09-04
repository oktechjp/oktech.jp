import "react-photo-album/rows.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";

import { useMemo, useState } from "react";

import {
  LuChevronLeft,
  LuChevronRight,
  LuImageOff,
  LuMaximize,
  LuMinimize,
  LuPause,
  LuPlay,
  LuX,
  LuZoomIn,
  LuZoomOut,
} from "react-icons/lu";
import { RowsPhotoAlbum } from "react-photo-album";
import SSR from "react-photo-album/ssr";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import Container from "@/components/Common/Container";
import type { EventEnriched, GalleryImage } from "@/content";
import { isEventUpcoming } from "@/utils/eventFilters";
import { formatDate } from "@/utils/formatDate";

interface Props {
  event: EventEnriched;
  class?: string;
}

// Helper function to transform images for gallery and lightbox
const transformImages = (images: GalleryImage[], useFullResolution: boolean = false) => {
  return images.map((img) => {
    const imageData = useFullResolution ? img.full : img.thumbnail;

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

    const baseProps = {
      src: imageData.src,
      width,
      height,
      alt: img.data.caption || "",
      srcSet: srcSetItems.map((item: { src: string; width: number }) => ({
        src: item.src,
        width: item.width,
        height: Math.round(item.width * (height / width)),
      })),
    };

    if (useFullResolution) {
      // Lightbox-specific properties
      return {
        ...baseProps,
        title: "", // We'll handle title/date in custom overlay
        description: img.data.caption || "",
      };
    } else {
      // Gallery-specific properties
      return {
        ...baseProps,
        key: img.id,
        title: img.data.caption || "",
      };
    }
  });
};

export default function EventGalleryImages({ event }: Props) {
  const galleryImages = event.galleryImages || [];
  const reversedImages = galleryImages.slice().reverse();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Check if event is upcoming (using the 30-minute buffer logic)
  const isUpcoming = isEventUpcoming(event);

  // Transform images for react-photo-album
  const thumbs = useMemo(() => transformImages(reversedImages, false), [reversedImages]);

  // Transform images for lightbox with full resolution
  const slides = useMemo(() => transformImages(reversedImages, true), [reversedImages]);

  // Format the event date and title for the overlay

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
              onClick={({ index }) => setSelectedIndex(index)}
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
      <Lightbox
        open={selectedIndex !== null}
        index={selectedIndex || 0}
        close={() => setSelectedIndex(null)}
        slides={slides}
        plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
        thumbnails={{
          position: "bottom",
          imageFit: "cover",
          width: 100,
          height: 100,
          border: 0,
          borderRadius: 16,
          padding: 0,
          vignette: true,
        }}
        slideshow={{
          autoplay: false,
          delay: 3000,
        }}
        zoom={{
          maxZoomPixelRatio: 5,
          scrollToZoom: true,
          wheelZoomDistanceFactor: 500,
        }}
        carousel={{
          finite: false,
          preload: 10,
          imageFit: "contain",
          imageProps: {
            loading: "eager",
          },
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
          closeOnPullUp: true,
        }}
        render={{
          iconPrev: () => <LuChevronLeft size={36} className="text-white text-shadow-black" />,
          iconNext: () => <LuChevronRight size={36} className="text-white text-shadow-black" />,
          iconClose: () => <LuX size={24} className="text-white text-shadow-black" />,
          iconZoomIn: () => <LuZoomIn size={24} className="text-white text-shadow-black" />,
          iconZoomOut: () => <LuZoomOut size={24} className="text-white text-shadow-black" />,
          iconEnterFullscreen: () => (
            <LuMaximize size={24} className="text-white text-shadow-black" />
          ),
          iconExitFullscreen: () => (
            <LuMinimize size={24} className="text-white text-shadow-black" />
          ),
          iconSlideshowPause: () => <LuPause size={24} className="text-white text-shadow-black" />,
          iconSlideshowPlay: () => <LuPlay size={24} className="text-white text-shadow-black" />,
          controls: () => (
            <div className="absolute right-0 bottom-0 left-0 z-0 bg-gradient-to-t from-black to-transparent">
              <Container>
                <div className="flex flex-wrap items-baseline justify-between gap-2 pt-16 pb-6 text-white text-shadow-black">
                  <div className="font-header mr-4 text-2xl font-bold">{event.data.title}</div>
                  <div className="text-lg">{formatDate(event.data.dateTime, "long")}</div>
                </div>
              </Container>
            </div>
          ),
        }}
      />
    </>
  );
}
