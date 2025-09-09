import React, { useState } from "react";

import clsx from "clsx";

import BlobMask from "@/components/Common/BlobMask";
import Pattern, { type Patterns } from "@/components/Common/Pattern";
import useBloop from "@/hooks/useBloop";
import { BLOBS } from "@/utils/blobs";

interface BlobCardProps {
  children: React.ReactNode;
  preset?: number;
  className?: string;
  bgClass?: string;
  pattern?: Patterns;
  patternClass?: string;
}

export default function BlobCard({
  children,
  preset = 0,
  className = "",
  bgClass = "bg-primary/0 group-hover:bg-primary/40 group-active:bg-primary/60",
  pattern,
  patternClass = "bg-primary-content/10",
}: BlobCardProps) {
  const uniqueId = React.useId();
  const [currentState, setCurrentState] = useState<"default" | "hover" | "active">("default");
  const [isHovering, setIsHovering] = useState(false);
  const playBloopHover = useBloop({ preset: 15 }); // Reverse bass for hover
  const playBloopActive = useBloop({ preset: 27 }); // Zap for active/click
  const activeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Use the preset directly as the default blob index
  const defaultIndex = preset % BLOBS.length;

  // Initialize counters - hover starts at i+1, poke starts at i+2
  const [hoverCounter, setHoverCounter] = useState((defaultIndex + 1) % BLOBS.length);
  const [pokeCounter, setPokeCounter] = useState((defaultIndex + 2) % BLOBS.length);

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
      // Increment hover counter for next time
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
    // Clear any existing timeout
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
    }

    setCurrentState("active");
    playBloopActive();
    // Increment poke counter for next time
    setPokeCounter((prev) => (prev + 3) % BLOBS.length);

    // Keep active state for 500ms, then return to previous state
    activeTimeoutRef.current = setTimeout(() => {
      if (isHovering) {
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
        >
          {pattern && (
            <Pattern
              type={pattern}
              className={clsx(
                "transition-opacity duration-300",
                currentState === "default" ? "opacity-0" : "opacity-100",
                patternClass,
              )}
            />
          )}
        </BlobMask>

        {/* Content layer */}
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    </div>
  );
}
