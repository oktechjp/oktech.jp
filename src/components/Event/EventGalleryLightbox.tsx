import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import clsx from "clsx";
import {
  LuChevronLeft,
  LuChevronRight,
  LuMaximize,
  LuMinimize,
  LuPause,
  LuPlay,
  LuX,
  LuZoomIn,
  LuZoomOut,
} from "react-icons/lu";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import type { EventEnriched, GalleryImage } from "@/content";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatDate } from "@/utils/formatDate";

import Brand from "../Common/Brand";

interface ImageWithEvent {
  image: GalleryImage;
  event: EventEnriched;
}

interface Props {
  event?: EventEnriched;
  images?: GalleryImage[];
  imagesWithEvents?: ImageWithEvent[];
  isOpen: boolean;
  initialIndex: number;
  onClose: () => void;
  autoplay?: boolean;
  showLogo?: boolean;
}

const THUMBNAIL_IMAGE_HEIGHT = 100;
const THUMBNAIL_VERTICAL_PADDING = 32;

// Reusable icon wrapper component
const LightboxIcon = ({
  Icon,
  isActive,
  size = 24,
}: {
  Icon: React.ComponentType<{ size: number; className: string }>;
  isActive: boolean;
  size?: number;
}) => (
  <div
    className={clsx(
      "transition-opacity duration-300",
      isActive ? "opacity-100" : "pointer-events-none opacity-0",
    )}
    style={{ width: `${size}px`, height: `${size}px` }}
  >
    <Icon size={size} className="text-white text-shadow-black" />
  </div>
);

// Helper function to transform images for lightbox
const transformImages = (images: GalleryImage[] | ImageWithEvent[]) => {
  return images.map((item) => {
    const img = "image" in item ? item.image : item;
    const imageData = img.full;
    const { width, height } = img.dimensions;

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
      title: "",
      description: img.data.caption || "",
    };
  });
};

export default function EventGalleryLightbox({
  event,
  images,
  imagesWithEvents,
  isOpen,
  initialIndex,
  onClose,
  autoplay = false,
  showLogo = false,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isActive, setIsActive] = useState(true);
  const inactivityTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const currentBreakpoint = useBreakpoint();
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window === "undefined" ? 0 : window.innerHeight,
  );
  const thumbnailPanelHeight = THUMBNAIL_IMAGE_HEIGHT + THUMBNAIL_VERTICAL_PADDING;
  const fitsViewport = viewportHeight > 0 ? thumbnailPanelHeight / viewportHeight < 0.2 : false;
  const showThumbnails = currentBreakpoint !== "base" && currentBreakpoint !== "sm" && fitsViewport;
  const lightboxPlugins = useMemo(
    () =>
      showThumbnails ? [Fullscreen, Slideshow, Thumbnails, Zoom] : [Fullscreen, Slideshow, Zoom],
    [showThumbnails],
  );

  // Use either images or imagesWithEvents - memoize to prevent new array on every render
  const imageList = useMemo(
    () => imagesWithEvents?.map((item) => item.image) || images || [],
    [imagesWithEvents, images],
  );

  // Transform images for lightbox with full resolution
  const slides = useMemo(() => transformImages(imageList), [imageList]);

  // Get the current event - use prop event if no imagesWithEvents
  const currentEvent = imagesWithEvents?.[currentIndex]?.event || event;

  // Handle activity state
  const handleActivity = useCallback(() => {
    setIsActive(true);
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setIsActive(false);
    }, 3000);
  }, []);

  // Handle view change
  const handleViewChange = useCallback(({ index }: { index: number }) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Manage activity tracking
  useEffect(() => {
    if (isOpen) {
      handleActivity();
      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("touchstart", handleActivity);

      return () => {
        window.removeEventListener("mousemove", handleActivity);
        window.removeEventListener("touchstart", handleActivity);
        clearTimeout(inactivityTimer.current);
      };
    }
  }, [isOpen, handleActivity]);

  return (
    <Lightbox
      open={isOpen}
      index={currentIndex}
      close={onClose}
      slides={slides}
      plugins={lightboxPlugins}
      on={{
        view: handleViewChange,
      }}
      thumbnails={
        showThumbnails
          ? {
              position: "bottom",
              imageFit: "cover",
              width: 100,
              height: 100,
              border: 0,
              borderRadius: 16,
              padding: 0,
              vignette: true,
            }
          : undefined
      }
      slideshow={{
        autoplay,
        delay: autoplay ? 4000 : 3000,
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
      }}
      controller={{
        closeOnBackdropClick: true,
        closeOnPullDown: true,
        closeOnPullUp: true,
      }}
      styles={{
        root: {
          backgroundColor: "rgba(0, 0, 0, 0.9)",
        },
        container: {
          backgroundColor: "transparent",
        },
        thumbnailsContainer: {
          backgroundColor: "transparent",
          maxHeight: showThumbnails && isActive ? "200px" : "0px",
          opacity: showThumbnails && isActive ? 1 : 0,
          overflow: "hidden",
          padding: showThumbnails && isActive ? "16px 0" : "0",
          transition:
            "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, padding 0.3s ease-in-out",
        },
      }}
      render={{
        iconPrev: () => <LightboxIcon Icon={LuChevronLeft} isActive={isActive} size={36} />,
        iconNext: () => <LightboxIcon Icon={LuChevronRight} isActive={isActive} size={36} />,
        iconClose: () => <LightboxIcon Icon={LuX} isActive={isActive} />,
        iconZoomIn: () => <LightboxIcon Icon={LuZoomIn} isActive={isActive} />,
        iconZoomOut: () => <LightboxIcon Icon={LuZoomOut} isActive={isActive} />,
        iconEnterFullscreen: () => <LightboxIcon Icon={LuMaximize} isActive={isActive} />,
        iconExitFullscreen: () => <LightboxIcon Icon={LuMinimize} isActive={isActive} />,
        iconSlideshowPause: () => <LightboxIcon Icon={LuPause} isActive={isActive} />,
        iconSlideshowPlay: () => <LightboxIcon Icon={LuPlay} isActive={isActive} />,
        controls: () => (
          <>
            {showLogo && (
              <div className="absolute top-6 left-12 z-0 rounded-full bg-black/70 px-4 py-2 text-white">
                <Brand className="w-42" />
              </div>
            )}
            {currentEvent && (
              <div className="absolute right-0 bottom-0 left-0 z-0 bg-linear-to-t from-black to-transparent px-12">
                <div className="flex flex-wrap items-baseline justify-between gap-2 pt-16 pb-6 text-white text-shadow-black">
                  <div className="font-header mr-4 text-lg font-bold md:text-xl lg:text-2xl">
                    {currentEvent.data.title}
                  </div>
                  <div className="text-base md:text-lg">
                    {formatDate(currentEvent.data.dateTime, "long")}
                  </div>
                </div>
              </div>
            )}
          </>
        ),
      }}
    />
  );
}
