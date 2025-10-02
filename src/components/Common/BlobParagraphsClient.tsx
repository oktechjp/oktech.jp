import { useMemo } from "react";

import { BLOBS } from "@/utils/blobs";
import { useBreakpoint } from "@/utils/hooks/useBreakpoint";

import BlobParagraphsDesktop from "./BlobParagraphsDesktop";
import BlobParagraphsMobile from "./BlobParagraphsMobile";

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
