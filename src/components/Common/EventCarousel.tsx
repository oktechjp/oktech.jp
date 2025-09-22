import { memo, useCallback, useEffect, useRef, useState } from "react";

import { useSpring } from "@react-spring/web";
import clsx from "clsx";
import { LuChevronLeft, LuChevronRight, LuSparkles } from "react-icons/lu";

import EventCard from "@/components/Common/EventCard";
import type { EventEnriched } from "@/content";

import Container from "./Container";

type Variant = "polaroid" | "big";

const configByVariant: Record<Variant, { className: string; width: number; gap: number }> = {
  polaroid: { className: "w-80", width: 320, gap: 24 },
  big: { className: "w-[60em]", width: 960, gap: 32 },
};

const EventCarousel = memo(function EventCarousel({
  events,
  variant = "big",
  moreText,
  moreIcon: MoreIcon,
  showMore = true,
}: {
  events: EventEnriched[];
  variant?: Variant;
  moreText?: string;
  moreIcon?: React.ComponentType<{ className?: string }>;
  showMore?: boolean;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { className: itemWidthClass, width: itemPixelWidth, gap } = configByVariant[variant];
  const scrollDistance = itemPixelWidth + gap;

  // Track current index (1 = first event, not 0 which is padding)
  const [isHydrated, setIsHydrated] = useState(false);
  const [shadowIndex, setShadowIndex] = useState(1);
  const isAnimating = useRef(false);

  // Spring animation with bounce effect - only used for button clicks
  const [, api] = useSpring(
    () => ({
      from: { scrollX: scrollDistance },
      config: {
        mass: 0.6,
        tension: 50,
        friction: 7,
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
    }
  }, [scrollDistance]);

  // Handle manual scrolling to update shadowIndex
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isAnimating.current) {
      return;
    }

    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const nearestIndex = Math.round(scrollLeft / scrollDistance);
    const newIndex = Math.max(1, Math.min(events.length, nearestIndex));

    setShadowIndex(newIndex);
  }, [scrollDistance, events.length]);

  const scrollTo = useCallback(
    (direction: "left" | "right") => {
      // Calculate target index based on shadowIndex (current scroll position)
      // Don't allow going to padding (index 0) - minimum is 1 (first event)
      const targetIndex =
        direction === "left"
          ? Math.max(1, shadowIndex - 1)
          : Math.min(events.length, shadowIndex + 1);

      // Don't do anything if we're already at the target
      if (targetIndex === shadowIndex) {
        return;
      }

      // Update shadowIndex immediately for responsive button state
      setShadowIndex(targetIndex);

      // Animate to the new position
      const targetScroll = targetIndex * scrollDistance;
      isAnimating.current = true;

      api.start({
        from: { scrollX: scrollContainerRef.current?.scrollLeft || 0 },
        to: { scrollX: targetScroll },
        onChange: ({ value }) => {
          if (scrollContainerRef.current && value.scrollX !== undefined) {
            scrollContainerRef.current.scrollLeft = value.scrollX;
          }
        },
        onRest: () => {
          isAnimating.current = false;
        },
      });
    },
    [shadowIndex, events.length, scrollDistance, api],
  );

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="no-scrollbar overflow-x-auto py-12"
        onScroll={handleScroll}
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Container wide>
          <div className="-mx-4">
            <div
              className="flex p-4"
              style={{
                gap: `${gap}px`,
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
              {showMore && (
                <div
                  className={clsx(
                    "flex flex-none flex-col items-center justify-center gap-8",
                    "text-base-600 mx-20",
                  )}
                >
                  {MoreIcon ? (
                    <MoreIcon className="h-18 w-18" />
                  ) : (
                    <LuSparkles className="h-18 w-18" />
                  )}
                  <p className="text-lg">{moreText || "...and more to come soon!"}</p>
                </div>
              )}
              {/* padding to allow scrolling to the end */}
              <div className="flex-none" style={{ width: `${scrollDistance}px` }} />
            </div>
          </div>
        </Container>
      </div>
      <Container wide className="flex items-center justify-between">
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={() => scrollTo("left")}
            className="btn btn-circle btn-neutral btn-xl"
            aria-label="Scroll left"
            disabled={shadowIndex <= 1}
          >
            <LuChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => scrollTo("right")}
            className="btn btn-circle btn-neutral btn-xl"
            aria-label="Scroll right"
            disabled={shadowIndex >= events.length}
          >
            <LuChevronRight className="h-6 w-6" />
          </button>
        </div>
      </Container>
    </>
  );
});

export default EventCarousel;
