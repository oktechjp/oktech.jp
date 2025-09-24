import { useEffect, useMemo, useRef, useState } from "react";

import { BLOBS } from "@/utils/blobs";

import BlobSlideshow from "./BlobSlideshow";
import Container from "./Container";
import ParallaxSpring from "./ParallaxSpring";

interface ImageData {
  src: string;
  srcSet?: string;
  sizes?: string;
}

interface Paragraph {
  title: string;
  text: string;
  images: (string | ImageData)[];
  blobs?: string[];
}

interface BlobParagraphsProps {
  paragraphs: Paragraph[];
  blobs?: string[];
}

export default function BlobParagraphsClient({
  paragraphs,
  blobs: globalBlobs,
}: BlobParagraphsProps) {
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Collect all images from all paragraphs
  const allImages = useMemo(() => {
    return paragraphs.flatMap((p) => p.images);
  }, [paragraphs]);

  // Construct blob array with stable associations per image
  const blobArray = useMemo(() => {
    const result: string[] = [];

    paragraphs.forEach((paragraph) => {
      const paragraphBlobs = paragraph.blobs || globalBlobs || BLOBS;
      // Each image in the paragraph gets a blob based on its position within the paragraph
      paragraph.images.forEach((_, idx) => {
        result.push(paragraphBlobs[idx % paragraphBlobs.length]);
      });
    });
    return result;
  }, [paragraphs, globalBlobs]);

  // Calculate image range for active paragraph
  const activeImageRange = useMemo(() => {
    let startIdx = 0;
    for (let i = 0; i < activeParagraphIndex; i++) {
      startIdx += paragraphs[i].images.length;
    }
    const endIdx = startIdx + paragraphs[activeParagraphIndex].images.length - 1;
    return { start: startIdx, end: endIdx };
  }, [activeParagraphIndex, paragraphs]);

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
    <Container wide className="grid grid-cols-2 gap-12">
      <div className="gap-responsive flex flex-col">
        {paragraphs.map((paragraph, index) => {
          const isActive = index === activeParagraphIndex;

          return (
            <div
              key={index}
              ref={(el) => {
                paragraphRefs.current[index] = el;
              }}
              className={`gap-responsive-tight flex flex-col transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-50"
              }`}
            >
              <h3 className="text-3xl">{paragraph.title}</h3>
              <p>{paragraph.text}</p>
            </div>
          );
        })}
      </div>
      <div className="-my-20">
        <ParallaxSpring speed={1}>
          <BlobSlideshow
            images={allImages}
            activeRange={activeImageRange}
            slideDelay={3000}
            fadeSpeed={800}
            containerClassName="w-full aspect-video"
            blobs={blobArray}
            startTimeOffset={500}
          />
        </ParallaxSpring>
      </div>
    </Container>
  );
}
