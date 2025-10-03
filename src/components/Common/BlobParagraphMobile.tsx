import { useRef } from "react";

import { useBlobParagraphScroll } from "@/utils/hooks/useBlobParagraphScroll";

import BlobParagraph from "./BlobParagraph";
import { type BlobParagraphContent, useBlobParagraphAssets } from "./BlobParagraphShared";
import BlobParagraphSlideshow from "./BlobParagraphSlideshow";
import Container from "./Container";
import ParallaxSpring from "./ParallaxSpring";

const MOBILE_TOP_STICKY_OFFSET = 24;
const MOBILE_BLOB_BUFFER = 20;

export default function BlobParagraphMobile({
  paragraphs,
  blobs: globalBlobIndices,
}: {
  paragraphs: BlobParagraphContent[];
  blobs?: number[];
}) {
  const { allImages, blobArray } = useBlobParagraphAssets(paragraphs, globalBlobIndices);

  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const blobRef = useRef<HTMLDivElement | null>(null);

  const { activeParagraphIndex, activeImageRange, parallaxContainerHeight } =
    useBlobParagraphScroll({
      mode: "mobile",
      paragraphs,
      paragraphRefs,
      spacerRef,
      blobRef,
      mobileTopStickyOffset: MOBILE_TOP_STICKY_OFFSET,
      mobileBlobBuffer: MOBILE_BLOB_BUFFER,
    });

  return (
    <Container className="relative flex flex-col">
      {/* Parallax blob container */}
      <div className="absolute inset-x-0 -top-32" style={{ height: parallaxContainerHeight || 0 }}>
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

      {/* Spacer */}
      <div ref={spacerRef} className="mb-42 aspect-video w-full" />

      {/* Paragraphs */}
      <div className="relative z-0 flex flex-col gap-48">
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
