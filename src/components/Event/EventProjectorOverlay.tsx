import { useEffect, useState } from "react";

import ThemeToggle from "@/components/Common/ThemeToggle";
import type { EventEnriched } from "@/content";
import { isLegacyEvent } from "@/utils/eventFilters";
import { formatDate, formatTime } from "@/utils/formatDate";

import ProjectorEventSlide from "./ProjectorEventSlide";
import ProjectorLinksSlide from "./ProjectorLinksSlide";

interface EventProjectorOverlayProps {
  event: EventEnriched;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventProjectorOverlay({
  event,
  isOpen,
  onClose,
}: EventProjectorOverlayProps) {
  const [showLinks, setShowLinks] = useState(false);

  useEffect(() => {
    if (!isOpen) setShowLinks(false);
  }, [isOpen]);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const elem = document.getElementById("projector-overlay");
        if (elem && !document.fullscreenElement) {
          await elem.requestFullscreen();
        }
      } catch (err) {
        console.error("Error attempting to enter fullscreen:", err);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if (e.key === " " && isOpen) {
        e.preventDefault();
        setShowLinks((prev) => !prev);
      }
    };

    const handleFullscreenChange = () => {
      // If we're no longer in fullscreen, close the overlay
      if (!document.fullscreenElement && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      enterFullscreen();
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const legacyEvent = isLegacyEvent(event);

  if (legacyEvent) {
    const projectorImage = event.data.coverProjector ?? event.data.coverPage;

    return (
      <div
        id="projector-overlay"
        className="bg-base-100 fixed inset-0 z-50 flex h-screen w-screen items-center justify-center"
        data-testid="projector-overlay"
      >
        {showLinks ? (
          <ProjectorLinksSlide />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black">
            <img
              src={projectorImage.src}
              srcSet={projectorImage.srcSet}
              sizes={projectorImage.sizes}
              alt={`${event.data.title} cover`}
              className="h-full w-full object-contain"
            />
          </div>
        )}
      </div>
    );
  }

  const formattedDate = formatDate(event.data.dateTime, "long");
  const formattedTime = formatTime(event.data.dateTime);

  return (
    <div
      id="projector-overlay"
      className="bg-base-100 fixed inset-0 z-50 flex h-screen w-screen items-center justify-center"
      data-testid="projector-overlay"
    >
      {showLinks ? (
        <ProjectorLinksSlide />
      ) : (
        <ProjectorEventSlide
          event={event}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
        />
      )}

      {/* Theme Switcher - appears on hover */}
      <div className="group/theme-toggle absolute right-0 bottom-0 p-6">
        <div className="opacity-0 transition-opacity duration-300 group-hover/theme-toggle:opacity-100">
          <ThemeToggle testId="projector-theme-toggle" />
        </div>
      </div>
    </div>
  );
}
