import { useEffect } from "react";

import { LuCalendar } from "react-icons/lu";

import Brand from "@/components/Common/Brand";
import ThemeToggle from "@/components/Common/ThemeToggle";
import type { EventEnriched } from "@/content";
import { formatDate, formatTime } from "@/utils/formatDate";

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

  const formattedDate = formatDate(event.data.dateTime, "long");
  const formattedTime = formatTime(event.data.dateTime);

  return (
    <div
      id="projector-overlay"
      className="bg-base-100 fixed inset-0 z-50 flex h-screen w-screen items-center justify-center"
      data-testid="projector-overlay"
    >
      <div
        className="relative flex"
        style={{
          width: "100vw",
          height: "calc(100vw * 9 / 16)",
          maxHeight: "100vh",
          maxWidth: "calc(100vh * 16 / 9)",
          padding: "5vw",
        }}
      >
        {/* Left Column */}
        <div className="flex flex-1 flex-col justify-between" style={{ paddingRight: "3vw" }}>
          {/* Top: Title and Description */}
          <div className="flex flex-col" style={{ gap: "2vw" }}>
            <h1
              className="text-base-content line-clamp-4 leading-tight font-bold"
              style={{ fontSize: "4.5vw" }}
              data-testid="projector-title"
            >
              {event.data.title}
            </h1>
          </div>

          {/* Bottom: Date/Time */}
          <div className="flex items-center" style={{ gap: "1.5vw" }}>
            <div
              className="bg-primary/10 rounded-box flex flex-shrink-0 items-center justify-center"
              style={{ width: "4vw", height: "4vw" }}
            >
              <LuCalendar className="text-primary" style={{ width: "2vw", height: "2vw" }} />
            </div>
            <div className="flex flex-col" style={{ gap: "0.3vw" }}>
              <span
                className="text-base-content font-medium"
                style={{ fontSize: "1.8vw" }}
                data-testid="projector-datetime"
              >
                {formattedDate}
              </span>
              <span className="text-base-content/70" style={{ fontSize: "1.5vw" }}>
                {formattedTime}
                {event.data.duration && <span> • {event.data.duration / 60} hours</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-shrink-0 flex-col justify-between" style={{ width: "30vw" }}>
          {/* Top: Branding */}
          <div className="flex justify-end">
            <div className="text-base-content" style={{ width: "20vw" }}>
              <Brand active className="w-full" />
            </div>
          </div>

          {/* Bottom: Venue Info */}
          {event.venue && (
            <div className="flex flex-col items-end">
              <div className="bg-base-200 rounded-box" style={{ padding: "2vw", width: "25vw" }}>
                <h3
                  className="text-base-content font-bold"
                  style={{ fontSize: "1.6vw", marginBottom: "0.5vw" }}
                  data-testid="projector-venue-title"
                >
                  {event.venue.title}
                </h3>
                {event.venue.address && (
                  <p
                    className="text-base-content/70"
                    style={{ fontSize: "1.3vw", lineHeight: "1.6" }}
                    data-testid="projector-venue-address"
                  >
                    {event.venue.address}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Theme Switcher - appears on hover */}
      <div className="group/theme-toggle absolute right-0 bottom-0 p-6">
        <div className="opacity-0 transition-opacity duration-300 group-hover/theme-toggle:opacity-100">
          <ThemeToggle testId="projector-theme-toggle" />
        </div>
      </div>
    </div>
  );
}
