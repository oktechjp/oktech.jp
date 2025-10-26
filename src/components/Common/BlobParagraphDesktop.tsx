import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { animated, useSpring } from "@react-spring/web";

import { useBlobParagraphScroll } from "@/hooks/useBlobParagraphScroll";

import BlobParagraph from "./BlobParagraph";
import { type BlobParagraphContent, useBlobParagraphAssets } from "./BlobParagraphShared";
import BlobParagraphSlideshow from "./BlobParagraphSlideshow";
import Container from "./Container";

export default function BlobParagraphDesktop({
  paragraphs,
  blobs: globalBlobIndices,
  noPreload = false,
}: {
  paragraphs: BlobParagraphContent[];
  blobs?: number[];
  noPreload?: boolean;
}) {
  const { allImages, blobArray } = useBlobParagraphAssets(paragraphs, globalBlobIndices);

  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blobRef = useRef<HTMLDivElement | null>(null);
  const [springs, api] = useSpring(() => ({
    y: 0,
    config: {
      tension: 90,
      mass: 1.6,
      friction: 10,
    },
  }));

  const { activeParagraphIndex, activeImageRange, desktopBottomPadding } = useBlobParagraphScroll({
    mode: "desktop",
    paragraphs,
    paragraphRefs,
    blobRef,
  });

  const updateBlobPosition = useCallback(() => {
    const activeParagraph = paragraphRefs.current[activeParagraphIndex];
    const blobEl = blobRef.current;
    const blobContainer = blobEl?.parentElement;
    if (!activeParagraph || !blobEl || !blobContainer) {
      return;
    }

    const paragraphContainer = activeParagraph.parentElement;
    if (!paragraphContainer) {
      return;
    }

    const paragraphRect = activeParagraph.getBoundingClientRect();
    const blobRect = blobEl.getBoundingClientRect();
    const blobContainerRect = blobContainer.getBoundingClientRect();
    const paragraphContainerRect = paragraphContainer.getBoundingClientRect();

    const paragraphCenter = paragraphRect.top + paragraphRect.height / 2;
    const desiredPosition = paragraphCenter - blobContainerRect.top - blobRect.height / 2;

    const maxOffset = Math.max(paragraphContainerRect.height - blobRect.height, 0);
    const clampedPosition = Math.min(Math.max(desiredPosition, 0), maxOffset);

    api.start({ y: clampedPosition });
  }, [activeParagraphIndex, api]);

  useLayoutEffect(() => {
    updateBlobPosition();
  }, [updateBlobPosition]);

  useEffect(() => {
    updateBlobPosition();
    window.addEventListener("scroll", updateBlobPosition);
    window.addEventListener("resize", updateBlobPosition);

    return () => {
      window.removeEventListener("scroll", updateBlobPosition);
      window.removeEventListener("resize", updateBlobPosition);
    };
  }, [updateBlobPosition]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const blobEl = blobRef.current;
    if (!blobEl) {
      return;
    }

    const observer = new ResizeObserver(() => updateBlobPosition());
    observer.observe(blobEl);

    return () => {
      observer.disconnect();
    };
  }, [updateBlobPosition]);

  return (
    <Container className="relative grid grid-cols-2 gap-28">
      {/* Paragraphs */}
      <div
        className="gap-responsive relative z-0 flex flex-col"
        style={{ paddingBottom: desktopBottomPadding }}
      >
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

      {/* Blob - clamped to active paragraph */}
      <div className="-mr-20">
        <animated.div
          ref={blobRef}
          className="will-change-transform"
          style={{ transform: springs.y.to((value) => `translateY(${value}px)`) }}
        >
          <BlobParagraphSlideshow
            allImages={allImages}
            activeImageRange={activeImageRange}
            blobArray={blobArray}
            noPreload={noPreload}
          />
        </animated.div>
      </div>
    </Container>
  );
}
