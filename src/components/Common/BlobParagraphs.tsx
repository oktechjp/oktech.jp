import { useMemo, useRef } from "react";

import { BLOBS } from "@/utils/blobs";
import { useBlobParagraphScroll } from "@/utils/hooks/useBlobParagraphScroll";
import { useBreakpoint } from "@/utils/hooks/useBreakpoint";

import BlobParagraph from "./BlobParagraph";
import BlobParagraphSlideshow from "./BlobParagraphSlideshow";
import Container from "./Container";
import ParallaxSpring from "./ParallaxSpring";

// Mobile blob positioning
const MOBILE_TOP_STICKY_OFFSET = 24; // Pixels from top of viewport when scrolling
const MOBILE_BLOB_BUFFER = 20; // Extra buffer below blob for paragraph activation (Tailwind units)

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

export default function BlobParagraphs({
  paragraphs,
  blobs: globalBlobIndices,
}: {
  paragraphs: Paragraph[];
  blobs?: number[];
}) {
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
  const isDesktop = useBreakpoint("md");
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const blobRef = useRef<HTMLDivElement | null>(null);

  const { activeParagraphIndex, activeImageRange, parallaxContainerHeight, desktopBottomPadding } =
    useBlobParagraphScroll({
      mode: isDesktop ? "desktop" : "mobile",
      paragraphs,
      paragraphRefs,
      spacerRef,
      blobRef,
      mobileTopStickyOffset: MOBILE_TOP_STICKY_OFFSET,
      mobileBlobBuffer: MOBILE_BLOB_BUFFER,
    });

  return (
    <Container className="relative flex flex-col md:grid md:grid-cols-2 md:gap-28">
      {/* Mobile: Parallax blob container */}
      {!isDesktop && (
        <div
          className="absolute inset-x-0 -top-32 md:hidden"
          style={{ height: parallaxContainerHeight || 0 }}
        >
          <ParallaxSpring speed={1} sticky className="relative z-10 pt-32">
            <div ref={blobRef}>
              <BlobParagraphSlideshow
                allImages={allImages}
                activeImageRange={activeImageRange}
                blobArray={blobArray}
              />
            </div>
          </ParallaxSpring>
        </div>
      )}

      {/* Mobile: Spacer */}
      <div ref={spacerRef} className="mb-42 aspect-video w-full md:hidden" />

      {/* Paragraphs container */}
      <div
        className="md:gap-responsive relative z-0 flex flex-col gap-48"
        style={isDesktop ? { paddingBottom: desktopBottomPadding } : undefined}
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

      {/* Desktop: Parallax in second column with debug background */}
      <div className="hidden md:-mr-20 md:block">
        <div className="relative" style={{ height: "100%" }}>
          <ParallaxSpring speed={1}>
            <div ref={isDesktop ? blobRef : null}>
              <BlobParagraphSlideshow
                allImages={allImages}
                activeImageRange={activeImageRange}
                blobArray={blobArray}
              />
            </div>
          </ParallaxSpring>
        </div>
      </div>
    </Container>
  );
}
