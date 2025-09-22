import { memo, useCallback, useEffect, useRef, useState } from "react";

import { useSpring } from "@react-spring/web";
import clsx from "clsx";
import { LuChevronLeft, LuChevronRight, LuSparkles } from "react-icons/lu";

import EventCard from "@/components/Common/EventCard";
import type { EventEnriched } from "@/content";

import Container from "./Container";

type Variant = "compact" | "polaroid" | "big";

const widthByVariant: Record<Variant, { className: string; width: number }> = {
  compact: { className: "w-96", width: 384 },
  polaroid: { className: "w-80", width: 320 },
  big: { className: "w-[60em]", width: 960 },
};

const EventCarousel = memo(function EventCarousel({
  events,
  variant = "big",
}: {
  events: EventEnriched[];
  variant?: Variant;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { className: itemWidthClass, width: itemPixelWidth } = widthByVariant[variant];
  const gap = 24;
  const scrollDistance = itemPixelWidth + gap;

  // Track current index (1 = first event, not 0 which is padding)
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);

  // Spring animation with bounce effect
  const [, api] = useSpring(
    () => ({
      scrollX: scrollDistance,
      onChange: ({ value }) => {
        if (scrollContainerRef.current && value.scrollX !== undefined) {
          scrollContainerRef.current.scrollLeft = value.scrollX;
        }
      },
      config: {
        mass: 0.6,
        tension: 50,
        friction: 7, // bounce: 4,
        // clamp: false,
      },
    }),
    [],
  );

  // On mount, mark as hydrated and set initial scroll
  useEffect(() => {
    setIsHydrated(true);
    // When we remove the negative margin, we need to scroll to maintain position
    if (scrollContainerRef.current) {
      const initialScroll = scrollDistance;
      scrollContainerRef.current.scrollLeft = initialScroll;
      // Set initial spring value without animation
      api.set({ scrollX: initialScroll });
    }
  }, [scrollDistance, api]);

  // Animate scroll position when index changes
  useEffect(() => {
    if (isHydrated) {
      const targetScroll = currentIndex * scrollDistance;
      api.start({ scrollX: targetScroll });
    }
  }, [currentIndex, scrollDistance, isHydrated, api]);

  const scrollTo = useCallback(
    (direction: "left" | "right") => {
      // Calculate target index based on direction
      // Don't allow going to padding (index 0) - minimum is 1 (first event)
      const targetIndex =
        direction === "left"
          ? Math.max(1, currentIndex - 1)
          : Math.min(events.length, currentIndex + 1);

      // Don't do anything if we're already at the target
      if (targetIndex === currentIndex) {
        return;
      }

      // Update state - the useEffect will handle the actual scrolling
      setCurrentIndex(targetIndex);
    },
    [currentIndex, events.length],
  );

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="no-scrollbar w-full overflow-x-auto py-12"
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Container wide>
          <div
            className="flex gap-6 p-4"
            style={{
              // Use negative margin before hydration to show first event
              // Remove it after hydration when we set scroll position
              marginLeft: isHydrated ? 0 : `-${scrollDistance}px`,
            }}
          >
            {/* Invisible padding card that allows bounce effect space */}
            <div className={clsx("flex-none", itemWidthClass)} />
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                className={clsx("flex-none", itemWidthClass)}
                event={event}
                variant={variant}
                index={index}
                count={events.length}
              />
            ))}
            <div
              className={clsx(
                "flex flex-none flex-col items-center justify-center",
                "text-base-600 mx-20 gap-8",
              )}
            >
              <LuSparkles className="h-18 w-18" />
              <p className="text-lg">...and more to come soon!</p>
            </div>
            {/* padding to allow scrolling to the end */}
            <div className="w-[100vw] flex-none" />
          </div>
        </Container>
      </div>
      <Container wide className="flex items-center justify-between">
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={() => scrollTo("left")}
            className="btn btn-circle btn-neutral btn-xl"
            aria-label="Scroll left"
            disabled={currentIndex <= 1}
          >
            <LuChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => scrollTo("right")}
            className="btn btn-circle btn-neutral btn-xl"
            aria-label="Scroll right"
            disabled={currentIndex >= events.length}
          >
            <LuChevronRight className="h-6 w-6" />
          </button>
        </div>
      </Container>
    </>
  );
});

export default EventCarousel;
