import { useEffect, useMemo, useRef, useState } from "react";

import BlobParagraph from "./BlobParagraph";
import BlobParagraphSlideshow from "./BlobParagraphSlideshow";
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

export default function BlobParagraphsDesktop({
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
