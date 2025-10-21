import { memo, useCallback, useEffect, useRef, useState } from "react";

import { useSpring } from "@react-spring/web";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

import EventCard from "@/components/Common/EventCard";
import type { EventEnriched } from "@/content";
import useScreenDimensions from "@/utils/useScreenDimensions";

import Container from "./Container";

type Variant = "polaroid" | "big";

const configByVariant: Record<Variant, { width: number; gap: number }> = {
  polaroid: { width: 320, gap: 24 },
  big: { width: 780, gap: 32 },
};

const SCROLL_PADDING = 80; // Padding in pixels at start and end of carousel for scroll positioning
const BIG_SCREEN_MIN_WIDTH = 800; // switch to polaroid variant if screen is less than this width
const MORE_WIDTH = 320; // Width of the "more" section

const EventCarousel = memo(function EventCarousel({
  events,
  variant: variantProp = "big",
  LastItem,
  cta,
}: {
  events: EventEnriched[];
  variant?: Variant;
  LastItem?: React.ReactNode;
  cta?: React.ReactNode;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { width: screenWidth } = useScreenDimensions();

  // Auto-switch to polaroid variant if screen is too small for big variant

  // Track current index (1 = first event, not 0 which is padding)
  const [isHydrated, setIsHydrated] = useState(false);
  const [shadowIndex, setShadowIndex] = useState(0);
  const [manuallyScrolledToEnd, setManuallyScrolledToEnd] = useState(false);
  const [lastItemFullyVisible, setLastItemFullyVisible] = useState(false);

  // fallback to variantProp until hydrated
  const variant = !isHydrated
    ? variantProp
    : screenWidth < BIG_SCREEN_MIN_WIDTH
      ? "polaroid"
      : variantProp;

  const { width: itemPixelWidth, gap } = configByVariant[variant];
  const scrollDistance = itemPixelWidth + gap;
  // Total number of scrollable items (events + LastItem if provided)
  const totalItems = events.length + (LastItem ? 1 : 0);
  const isAnimating = useRef(false);

  // On mobile, LastItem should be full viewport width to center it
  const isMobile = screenWidth > 0 && screenWidth < BIG_SCREEN_MIN_WIDTH;
  const lastItemWidth = isMobile ? screenWidth : MORE_WIDTH;

  // Helper function to calculate target scroll position for an index
  const calculateTargetScroll = useCallback(
    (targetIndex: number, containerWidth?: number) => {
      let targetScroll = SCROLL_PADDING + targetIndex * scrollDistance;

      // Special position for LastItem
      if (LastItem && targetIndex === totalItems - 1 && containerWidth) {
        if (isMobile) {
          // On mobile, align LastItem to the left edge of viewport (no special positioning needed)
          targetScroll = SCROLL_PADDING + events.length * scrollDistance + gap;
        } else {
          // On desktop, align it to the right edge of container
          targetScroll =
            SCROLL_PADDING +
            events.length * scrollDistance +
            gap +
            lastItemWidth -
            containerWidth +
            SCROLL_PADDING; // Use SCROLL_PADDING for bounce space
        }
        targetScroll = Math.max(0, targetScroll);
      }

      return targetScroll;
    },
    [LastItem, totalItems, scrollDistance, events.length, gap, lastItemWidth, isMobile],
  );

  // Spring animation with bounce effect - only used for button clicks
  const [, api] = useSpring(
    () => ({
      from: { scrollX: SCROLL_PADDING },
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
      const initialScroll = SCROLL_PADDING;
      scrollContainerRef.current.scrollLeft = initialScroll;
    }
  }, []);

  // Calculate shadowIndex and check if at end based on current scroll position
  const updateShadowIndex = useCallback(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const adjustedScroll = Math.max(0, scrollLeft - SCROLL_PADDING);
    const nearestIndex = Math.round(adjustedScroll / scrollDistance);
    const newIndex = Math.max(0, Math.min(totalItems - 1, nearestIndex));

    setShadowIndex(newIndex);

    // Check if manually scrolled to the end position
    const targetScrollForLastItem = calculateTargetScroll(totalItems - 1, container.clientWidth);

    // Check if we're at or past the target scroll position
    const atEndPosition = scrollLeft >= targetScrollForLastItem - 5; // 5px tolerance
    setManuallyScrolledToEnd(atEndPosition);
  }, [scrollDistance, totalItems, calculateTargetScroll]);

  // Handle manual scrolling to update shadowIndex
  const handleScroll = useCallback(() => {
    if (isAnimating.current) {
      return;
    }
    updateShadowIndex();
  }, [updateShadowIndex]);

  // Recalculate shadowIndex when screen resizes (and variant/scrollDistance changes)
  useEffect(() => {
    if (screenWidth === 0) {
      return;
    }
    updateShadowIndex();
  }, [updateShadowIndex, screenWidth]);

  const scrollTo = useCallback(
    (direction: "left" | "right") => {
      if (!scrollContainerRef.current) {
        return;
      }

      const container = scrollContainerRef.current;
      const maxScroll = calculateTargetScroll(totalItems - 1, container.clientWidth);

      // Calculate target index based on shadowIndex (current scroll position)
      let targetIndex =
        direction === "left"
          ? Math.max(0, shadowIndex - 1)
          : Math.min(totalItems - 1, shadowIndex + 1);

      // For right navigation, check if the target scroll would exceed maxScroll
      let targetScroll = calculateTargetScroll(targetIndex, container.clientWidth);
      if (direction === "right" && targetScroll > maxScroll) {
        // If proposed scroll exceeds max, just go to the final scroll position
        targetScroll = maxScroll;

        // Calculate which item is the leftmost visible item at this scroll position
        // This is the item whose left edge is at or right of the viewport left edge
        const viewportLeft = targetScroll;
        const adjustedViewportLeft = Math.max(0, viewportLeft - SCROLL_PADDING);
        // Find the first item that starts at or after the viewport left
        const leftmostVisibleIndex = Math.ceil(adjustedViewportLeft / scrollDistance);
        targetIndex = Math.max(0, Math.min(totalItems - 1, leftmostVisibleIndex));
      }

      // Don't do anything if we're already at the target
      if (targetIndex === shadowIndex && Math.abs(container.scrollLeft - targetScroll) < 1) {
        return;
      }

      // Update shadowIndex immediately for responsive button state
      setShadowIndex(targetIndex);

      // Reset manual scroll flag when using buttons
      setManuallyScrolledToEnd(false);

      // Check if the last item would be fully visible after this navigation
      const lastItemStart = SCROLL_PADDING + (totalItems - 1) * scrollDistance;
      const currentLastItemWidth =
        LastItem && totalItems - 1 === events.length ? lastItemWidth : itemPixelWidth;
      const lastItemEnd = lastItemStart + currentLastItemWidth;
      const viewportEnd = targetScroll + container.clientWidth;
      const wouldLastBeFullyVisible = lastItemEnd <= viewportEnd;
      setLastItemFullyVisible(wouldLastBeFullyVisible);

      // Animate to the new position
      isAnimating.current = true;

      api.start({
        from: { scrollX: container.scrollLeft },
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
    [
      shadowIndex,
      totalItems,
      api,
      calculateTargetScroll,
      scrollDistance,
      LastItem,
      events.length,
      itemPixelWidth,
    ],
  );

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="no-scrollbar py-responsive-tight overflow-x-auto"
        onScroll={handleScroll}
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Container wide>
          <div className="-mx-10">
            <div
              className="flex p-4"
              style={{
                gap: `${gap}px`,
                // Use negative margin before hydration to show first event
                // Remove it after hydration when we set scroll position
                marginLeft: isHydrated ? 0 : `-${SCROLL_PADDING}px`,
              }}
            >
              {/* Start padding */}
              <div className="flex-none" style={{ width: `${SCROLL_PADDING}px` }} />
              {events.map((event, index) => (
                <EventCard
                  key={event.id}
                  className="flex-none"
                  style={{ width: `${itemPixelWidth}px` }}
                  event={event}
                  variant={variant}
                  index={index}
                  count={events.length}
                />
              ))}
              {LastItem && (
                <div className="flex-none" style={{ width: `${lastItemWidth}px` }}>
                  {LastItem}
                </div>
              )}
              {/* End padding */}
              <div className="flex-none" style={{ width: `${SCROLL_PADDING}px` }} />
            </div>
          </div>
        </Container>
      </div>
      <Container wide className="flex items-center justify-between">
        {cta && <div className="mr-auto">{cta}</div>}
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={() => scrollTo("left")}
            className="btn btn-circle btn-neutral btn-xl"
            aria-label="Scroll left"
            disabled={shadowIndex <= 0}
          >
            <LuChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => scrollTo("right")}
            className="btn btn-circle btn-neutral btn-xl"
            aria-label="Scroll right"
            disabled={
              shadowIndex >= totalItems - 1 || manuallyScrolledToEnd || lastItemFullyVisible
            }
          >
            <LuChevronRight className="h-6 w-6" />
          </button>
        </div>
      </Container>
    </>
  );
});

export default EventCarousel;
