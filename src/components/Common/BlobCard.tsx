import React, { useState } from "react";

import clsx from "clsx";

import BlobMask from "@/components/Common/BlobMask";
import useBloop from "@/hooks/useBloop";
import { BLOBS } from "@/utils/blobs";

interface BlobCardProps {
  children: React.ReactNode;
  preset?: number;
  className?: string;
  bgClass?: string;
}

export default function BlobCard({
  children,
  preset = 0,
  className = "",
  bgClass = "bg-primary/0 group-hover:bg-primary/40 group-active:bg-primary/60",
}: BlobCardProps) {
  const uniqueId = React.useId();
  const [currentState, setCurrentState] = useState<"default" | "hover" | "active">("default");
  const [isHovering, setIsHovering] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const playBloopHover = useBloop({ preset: 15 }); // Reverse bass for hover
  const playBloopActive = useBloop({ preset: 27 }); // Zap for active/click
  const activeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Use the preset directly as the default blob index
  const defaultIndex = preset % BLOBS.length;

  // Function to get a random blob index that's different from the current one
  const getRandomBlobIndex = (excludeIndex: number): number => {
    const availableIndices = Array.from({ length: BLOBS.length }, (_, i) => i).filter(
      (idx) => idx !== excludeIndex,
    );
    return availableIndices[Math.floor(Math.random() * availableIndices.length)];
  };

  const getCurrentPath = () => {
    switch (currentState) {
      case "hover":
        return BLOBS[hoverIndex ?? defaultIndex];
      case "active":
        return BLOBS[activeIndex ?? defaultIndex];
      default:
        return BLOBS[defaultIndex];
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (currentState !== "active") {
      // Pick a random blob index different from the default
      const newHoverIndex = getRandomBlobIndex(defaultIndex);
      setHoverIndex(newHoverIndex);
      setCurrentState("hover");
      playBloopHover();
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (currentState !== "active") {
      setCurrentState("default");
    }
  };

  const handleInteractionStart = () => {
    // Clear any existing timeout
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
    }

    // Pick a random active index that's different from the current hover index (or default if no hover)
    const currentIndex = hoverIndex ?? defaultIndex;
    const newActiveIndex = getRandomBlobIndex(currentIndex);
    setActiveIndex(newActiveIndex);
    setCurrentState("active");
    playBloopActive();

    // Keep active state for 500ms, then return to previous state
    activeTimeoutRef.current = setTimeout(() => {
      if (isHovering) {
        // Return to the previous hover state (keep the same hoverIndex)
        setCurrentState("hover");
      } else {
        setCurrentState("default");
      }
    }, 500);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={clsx("group relative", className)}>
      {/* Inner container with margin changes */}
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
        {/* Background layer with clipping mask */}
        <BlobMask
          id={uniqueId}
          blobPath={getCurrentPath()}
          className={clsx(
            "pointer-events-none absolute inset-0 z-0 transition-all duration-300",
            bgClass,
          )}
        />

        {/* Content layer */}
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    </div>
  );
}
