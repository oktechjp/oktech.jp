import { useEffect, useMemo, useRef, useState } from "react";

import { BLOBS } from "@/utils/blobs";
import { useBreakpoint } from "@/utils/hooks/useBreakpoint";

import BlobSlideshow from "./BlobSlideshow";
import Container from "./Container";
import ParallaxSpring from "./ParallaxSpring";

type ImageData = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

type Paragraph = {
  title: string;
  text: string;
  images: (string | ImageData)[];
  blobs?: number[];
};

function BlobParagraph({
  paragraph,
  isActive,
  onRef,
}: {
  paragraph: Paragraph;
  isActive: boolean;
  onRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={onRef}
      className={`gap-responsive-tight flex flex-col transition-opacity duration-300 ${
        isActive ? "opacity-100" : "opacity-40"
      }`}
    >
      <h3 className="text-3xl">{paragraph.title}</h3>
      <p>{paragraph.text}</p>
    </div>
  );
}

function BlobParagraphSlideshow({
  allImages,
  activeImageRange,
  blobArray,
}: {
  allImages: (string | ImageData)[];
  activeImageRange: { start: number; end: number };
  blobArray: string[];
}) {
  return (
    <BlobSlideshow
      images={allImages}
      activeRange={activeImageRange}
      slideDelay={3000}
      fadeSpeed={800}
      containerClassName="w-full aspect-video"
      blobs={blobArray}
      startTimeOffset={500}
    />
  );
}

function BlobParagraphsDesktop({
  paragraphs,
  allImages,
  blobArray,
}: {
  paragraphs: Paragraph[];
  allImages: (string | ImageData)[];
  blobArray: string[];
  blobs?: number[];
}) {
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate image range for active paragraph
  const activeImageRange = useMemo(() => {
    let startIdx = 0;
    for (let i = 0; i < activeParagraphIndex; i++) {
      startIdx += paragraphs[i].images.length;
    }
    const endIdx = startIdx + paragraphs[activeParagraphIndex].images.length - 1;
    return { start: startIdx, end: endIdx };
  }, [activeParagraphIndex, paragraphs]);

  // Handle scroll for desktop
  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const activeZoneTop = viewportHeight * 0.3;
      const activeZoneBottom = viewportHeight * 0.5;

      let newActiveIndex = activeParagraphIndex;

      paragraphRefs.current.forEach((ref, index) => {
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
  }, [activeParagraphIndex]);
  return (
    <Container className="grid grid-cols-2 gap-28">
      <div className="gap-responsive flex flex-col">
        {paragraphs.map((paragraph, index) => (
          <BlobParagraph
            key={index}
            paragraph={paragraph}
            isActive={index === activeParagraphIndex}
            onRef={(el) => {
              paragraphRefs.current[index] = el;
            }}
          />
        ))}
      </div>
      <div className="-mr-20">
        <ParallaxSpring speed={1}>
          <BlobParagraphSlideshow
            allImages={allImages}
            activeImageRange={activeImageRange}
            blobArray={blobArray}
          />
        </ParallaxSpring>
      </div>
    </Container>
  );
}

function BlobParagraphsMobile({
  paragraphs,
  allImages,
  blobArray,
}: {
  paragraphs: Paragraph[];
  allImages: (string | ImageData)[];
  blobArray: string[];
  blobs?: number[];
}) {
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const [totalContentHeight, setTotalContentHeight] = useState(0);
  const [lastParagraphHeight, setLastParagraphHeight] = useState(0);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);

  // Calculate image range for active paragraph
  const activeImageRange = useMemo(() => {
    let startIdx = 0;
    for (let i = 0; i < activeParagraphIndex; i++) {
      startIdx += paragraphs[i].images.length;
    }
    const endIdx = startIdx + paragraphs[activeParagraphIndex].images.length - 1;
    return { start: startIdx, end: endIdx };
  }, [activeParagraphIndex, paragraphs]);

  // Measure heights on mount and resize
  useEffect(() => {
    const measureHeights = () => {
      // Get spacer height (this is our fixed blob height)
      if (spacerRef.current) {
        setSpacerHeight(spacerRef.current.offsetHeight);
      }

      // Calculate total content height (spacer + all paragraphs)
      let totalHeight = 0;
      if (spacerRef.current) {
        totalHeight += spacerRef.current.offsetHeight;
      }
      if (contentRef.current) {
        totalHeight += contentRef.current.offsetHeight;
      }
      setTotalContentHeight(totalHeight);

      const lastParagraph = paragraphRefs.current[paragraphs.length - 1];
      if (lastParagraph) {
        setLastParagraphHeight(lastParagraph.offsetHeight);
      }
    };

    // Measure after a small delay to ensure rendering is complete
    measureHeights();

    window.addEventListener("resize", measureHeights);
    return () => {
      window.removeEventListener("resize", measureHeights);
    };
  }, [paragraphs.length]);

  // Handle scroll for mobile
  useEffect(() => {
    const handleScroll = () => {
      // Use fixed threshold: top-16 (64px) + spacer height
      const blobBottomThreshold = 180 + spacerHeight;

      let newActiveIndex = 0;

      // Find the first paragraph whose top hasn't passed the threshold
      for (let i = 0; i < paragraphRefs.current.length; i++) {
        const ref = paragraphRefs.current[i];
        if (!ref) continue;

        const rect = ref.getBoundingClientRect();

        // If this paragraph's top is still below the threshold, it's the active one
        if (rect.top >= blobBottomThreshold) {
          newActiveIndex = i;
          break;
        }

        // If we're at the last paragraph and it's at least partially visible
        if (i === paragraphRefs.current.length - 1 && rect.bottom > blobBottomThreshold) {
          newActiveIndex = i;
        }
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
  }, [activeParagraphIndex, spacerHeight]);

  // Calculate sticky wrapper height: total scrollable area minus last paragraph minus gap
  const stickyWrapperHeight = totalContentHeight - lastParagraphHeight;

  return (
    <Container className="relative">
      {/* Sticky wrapper that spans content except last paragraph */}
      <div className="absolute inset-x-0 top-0" style={{ height: stickyWrapperHeight }}>
        <div className="sticky top-32 z-10">
          <BlobParagraphSlideshow
            allImages={allImages}
            activeImageRange={activeImageRange}
            blobArray={blobArray}
          />
        </div>
      </div>
      {/* Add spacer at top to push content below blob */}
      <div ref={spacerRef} className="mb-32 aspect-video w-full" />
      <div ref={contentRef} className="relative z-0 flex flex-col gap-24">
        {paragraphs.map((paragraph, index) => (
          <BlobParagraph
            key={index}
            paragraph={paragraph}
            isActive={index === activeParagraphIndex}
            onRef={(el) => {
              paragraphRefs.current[index] = el;
            }}
          />
        ))}
      </div>
    </Container>
  );
}

export default function BlobParagraphsClient({
  paragraphs,
  blobs: globalBlobIndices,
}: {
  paragraphs: Paragraph[];
  blobs?: number[];
}) {
  const isDesktop = useBreakpoint("md");

  // Collect all images from all paragraphs
  const allImages = useMemo(() => {
    return paragraphs.flatMap((p) => p.images);
  }, [paragraphs]);

  // Construct blob array with stable associations per image
  const blobArray = useMemo(() => {
    const result: string[] = [];

    paragraphs.forEach((paragraph) => {
      // Map indices to actual blob strings
      const paragraphBlobIndices = paragraph.blobs || globalBlobIndices;
      const paragraphBlobs = paragraphBlobIndices
        ? paragraphBlobIndices.map((index) => BLOBS[index])
        : BLOBS;

      // Each image in the paragraph gets a blob based on its position within the paragraph
      paragraph.images.forEach((_, idx) => {
        result.push(paragraphBlobs[idx % paragraphBlobs.length]);
      });
    });
    return result;
  }, [paragraphs, globalBlobIndices]);

  // Calculate image range for active paragraph
  return isDesktop ? (
    <BlobParagraphsDesktop
      paragraphs={paragraphs}
      allImages={allImages}
      blobArray={blobArray}
      blobs={globalBlobIndices}
    />
  ) : (
    <BlobParagraphsMobile
      paragraphs={paragraphs}
      allImages={allImages}
      blobArray={blobArray}
      blobs={globalBlobIndices}
    />
  );
}
