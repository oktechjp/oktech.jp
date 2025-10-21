import React, { useState } from "react";

import clsx from "clsx";

import BlobMask from "@/components/Common/BlobMask";
import useBloop from "@/hooks/useBloop";
import { BLOBS } from "@/utils/blobs";

const BASE_BG_CLASS = "bg-base-0/0 group-hover:!bg-base-0/50";
const OVERLAY_STATE_CLASSES =
  "pointer-events-none absolute inset-0 transition-all duration-300 bg-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100";
const OVERLAY_COLOR_CLASSES = [
  "group-hover:bg-error/40 group-active:bg-error/40",
  "group-hover:bg-success/40 group-active:bg-success/40",
  "group-hover:bg-info/40 group-active:bg-info/40",
] as const;

interface BlobIconGridItemProps {
  index: number;
  children: React.ReactNode;
}

export default function BlobIconGridItem({ index, children }: BlobIconGridItemProps) {
  const uniqueId = React.useId();
  const [currentState, setCurrentState] = useState<"default" | "hover" | "active">("default");
  const [isHovering, setIsHovering] = useState(false);
  const playBloopHover = useBloop({ preset: 15 });
  const playBloopActive = useBloop({ preset: 27 });
  const activeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const defaultIndex = index % BLOBS.length;
  const [hoverCounter, setHoverCounter] = useState((defaultIndex + 1) % BLOBS.length);
  const [pokeCounter, setPokeCounter] = useState((defaultIndex + 2) % BLOBS.length);

  const overlayClass = clsx(
    OVERLAY_STATE_CLASSES,
    OVERLAY_COLOR_CLASSES[index % OVERLAY_COLOR_CLASSES.length],
  );

  const getCurrentPath = () => {
    switch (currentState) {
      case "hover":
        return BLOBS[hoverCounter];
      case "active":
        return BLOBS[pokeCounter];
      default:
        return BLOBS[defaultIndex];
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (currentState !== "active") {
      setCurrentState("hover");
      playBloopHover();
      setHoverCounter((prev) => (prev + 3) % BLOBS.length);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (currentState !== "active") {
      setCurrentState("default");
    }
  };

  const handleInteractionStart = () => {
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
    }

    setCurrentState("active");
    playBloopActive();
    setPokeCounter((prev) => (prev + 3) % BLOBS.length);

    activeTimeoutRef.current = setTimeout(() => {
      if (isHovering) {
        setCurrentState("hover");
      } else {
        setCurrentState("default");
      }
    }, 500);
  };

  React.useEffect(() => {
    return () => {
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="group flex items-center justify-center">
      <div className="relative mt-5 -mb-5 h-70 w-70">
        <div
          className={clsx(
            "relative h-full transition-all duration-300",
            currentState === "active" ? "-m-10" : currentState === "hover" ? "-m-8" : "-m-4",
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
        >
          <BlobMask
            id={uniqueId}
            blobPath={getCurrentPath()}
            className={clsx(
              BASE_BG_CLASS,
              "pointer-events-none absolute inset-0 z-0 overflow-hidden transition-all duration-300",
            )}
          >
            <div className="relative h-full w-full">
              <div
                className={clsx(
                  "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                  currentState === "default" ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="bg-base-0/90 h-[65%] w-[65%] rounded-full blur-2xl" />
              </div>
              <div className={overlayClass} />
            </div>
          </BlobMask>

          <div className="relative z-10 h-full w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
