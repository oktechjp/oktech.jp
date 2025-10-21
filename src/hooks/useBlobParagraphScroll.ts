import { useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";

type Paragraph = {
  images: unknown[];
};

type Config = {
  mode: "mobile" | "desktop";
  paragraphs: Paragraph[];
  paragraphRefs: RefObject<(HTMLDivElement | null)[]>;
  spacerRef?: RefObject<HTMLDivElement | null>;
  blobRef?: RefObject<HTMLDivElement | null>;
  mobileTopStickyOffset?: number;
  mobileBlobBuffer?: number;
};

// Hook to calculate mobile blob positioning
function useCalculateMobileBlobPosition({
  paragraphs,
  paragraphRefs,
  spacerRef,
  blobRef,
  isEnabled,
}: {
  paragraphs: Paragraph[];
  paragraphRefs: RefObject<(HTMLDivElement | null)[]>;
  spacerRef?: RefObject<HTMLDivElement | null>;
  blobRef?: RefObject<HTMLDivElement | null>;
  isEnabled: boolean;
}) {
  const [parallaxContainerHeight, setParallaxContainerHeight] = useState(0);

  useEffect(() => {
    if (!isEnabled) {
      setParallaxContainerHeight(0);
      return;
    }

    const calculateHeight = () => {
      const lastParagraph = paragraphRefs.current?.[paragraphs.length - 1];
      const spacer = spacerRef?.current;
      if (!lastParagraph || !spacer) return;

      // Get the parent container that holds everything
      const parentContainer = spacer.parentElement;
      if (!parentContainer) return;

      const containerHeight = parentContainer.offsetHeight;
      const lastParagraphHeight = lastParagraph.offsetHeight;

      // Parallax container height = total container height - last paragraph height
      const height = containerHeight - lastParagraphHeight;
      setParallaxContainerHeight(Math.max(0, height));
    };

    const timer = window.setTimeout(calculateHeight, 100);
    window.addEventListener("resize", calculateHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateHeight);
    };
  }, [isEnabled, paragraphs.length, paragraphRefs, spacerRef, blobRef]);

  return { parallaxContainerHeight };
}

// Hook to calculate desktop blob positioning
function useCalculateDesktopBlobPosition({
  paragraphs,
  paragraphRefs,
  blobRef,
  isEnabled,
}: {
  paragraphs: Paragraph[];
  paragraphRefs: RefObject<(HTMLDivElement | null)[]>;
  blobRef?: RefObject<HTMLDivElement | null>;
  isEnabled: boolean;
}) {
  const [desktopBottomPadding, setDesktopBottomPadding] = useState(0);

  useEffect(() => {
    if (!isEnabled) {
      setDesktopBottomPadding(0);
      return;
    }

    const calculatePadding = () => {
      const lastParagraph = paragraphRefs.current?.[paragraphs.length - 1];
      if (!lastParagraph || !blobRef?.current) return;

      const blobHeight = blobRef.current.offsetHeight;
      const paragraphHeight = lastParagraph.offsetHeight;

      // Calculate padding needed to center blob with last paragraph
      // We want blob center to align with paragraph center
      const padding = Math.max(0, (blobHeight - paragraphHeight) / 2);
      setDesktopBottomPadding(padding);
    };

    const timer = window.setTimeout(calculatePadding, 100);
    window.addEventListener("resize", calculatePadding);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculatePadding);
    };
  }, [isEnabled, paragraphs.length, paragraphRefs, blobRef]);

  return { desktopBottomPadding };
}

export function useBlobParagraphScroll({
  mode,
  paragraphs,
  paragraphRefs,
  spacerRef,
  blobRef,
  mobileTopStickyOffset = 24,
  mobileBlobBuffer = 20,
}: Config) {
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);

  useEffect(() => {
    if (paragraphs.length === 0) {
      setActiveParagraphIndex(0);
      return;
    }

    if (activeParagraphIndex > paragraphs.length - 1) {
      setActiveParagraphIndex(paragraphs.length - 1);
    }
  }, [activeParagraphIndex, paragraphs.length]);

  // Calculate image range for active paragraph
  const activeImageRange = useMemo(() => {
    if (paragraphs.length === 0) {
      return { start: 0, end: 0 };
    }

    let startIdx = 0;
    for (let i = 0; i < activeParagraphIndex; i++) {
      startIdx += paragraphs[i].images.length;
    }
    const endIdx = startIdx + paragraphs[activeParagraphIndex].images.length - 1;
    return { start: startIdx, end: endIdx };
  }, [activeParagraphIndex, paragraphs]);

  const isMobileMode = mode === "mobile";
  const isDesktopMode = mode === "desktop";

  // Use mobile or desktop position calculation based on mode
  const { parallaxContainerHeight } = useCalculateMobileBlobPosition({
    paragraphs,
    paragraphRefs,
    spacerRef,
    blobRef,
    isEnabled: isMobileMode,
  });

  const { desktopBottomPadding } = useCalculateDesktopBlobPosition({
    paragraphs,
    paragraphRefs,
    blobRef,
    isEnabled: isDesktopMode,
  });

  // Handle scroll and active paragraph selection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY <= 0) {
        if (activeParagraphIndex !== 0) {
          setActiveParagraphIndex(0);
        }
        return;
      }

      let newActiveIndex = activeParagraphIndex;

      if (mode === "mobile") {
        // Mobile: activate paragraph based on position relative to blob
        const blobHeight = blobRef?.current?.offsetHeight || 0;
        const blobBottom = mobileTopStickyOffset + blobHeight + mobileBlobBuffer * 4; // Add buffer in pixels

        // Check all paragraphs including the last one
        for (let i = 0; i < paragraphs.length; i++) {
          const ref = paragraphRefs.current?.[i];
          if (!ref) continue;

          const rect = ref.getBoundingClientRect();

          // If this paragraph's top is still below blob bottom, it's active
          if (rect.top > blobBottom) {
            newActiveIndex = i;
            break;
          }

          // If we're at the last paragraph and haven't found one below blob bottom
          if (i === paragraphs.length - 1) {
            newActiveIndex = i;
          }
        }
      } else {
        // Desktop: use viewport zones
        const viewportHeight = window.innerHeight;
        const activeZoneTop = viewportHeight * 0.3;
        const activeZoneBottom = viewportHeight * 0.5;

        paragraphRefs.current?.forEach((ref, index) => {
          if (!ref) return;

          const rect = ref.getBoundingClientRect();
          const elementTop = rect.top;
          const elementBottom = rect.bottom;

          if (elementTop <= activeZoneBottom && elementBottom >= activeZoneTop) {
            if (elementTop >= activeZoneTop && elementTop <= activeZoneBottom) {
              newActiveIndex = index;
            }
          }
        });
      }

      if (newActiveIndex !== activeParagraphIndex) {
        setActiveParagraphIndex(newActiveIndex);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [
    activeParagraphIndex,
    mode,
    paragraphs.length,
    paragraphRefs,
    mobileTopStickyOffset,
    mobileBlobBuffer,
    blobRef,
  ]);

  return {
    activeParagraphIndex,
    activeImageRange,
    parallaxContainerHeight: isMobileMode ? parallaxContainerHeight : 0,
    desktopBottomPadding: isDesktopMode ? desktopBottomPadding : 0,
  };
}
