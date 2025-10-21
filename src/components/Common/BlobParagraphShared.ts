import { useMemo } from "react";

import { BLOBS } from "@/utils/blobs";
import type { ResponsiveImageData } from "@/utils/responsiveImage";

export type BlobParagraphContent = {
  title: string;
  text: string;
  images: (string | ResponsiveImageData)[];
  blobs?: number[];
};

type ParagraphAssets = {
  allImages: (string | ResponsiveImageData)[];
  blobArray: string[];
};

function buildParagraphAssets(
  paragraphs: BlobParagraphContent[],
  globalBlobIndices?: number[],
): ParagraphAssets {
  const allImages: (string | ResponsiveImageData)[] = [];
  const blobArray: string[] = [];

  paragraphs.forEach((paragraph) => {
    allImages.push(...paragraph.images);

    const paragraphBlobIndices = paragraph.blobs ?? globalBlobIndices;
    const paragraphBlobs = paragraphBlobIndices?.length
      ? paragraphBlobIndices
          .map((index) => BLOBS[index])
          .filter((blob): blob is string => Boolean(blob))
      : BLOBS;

    if (paragraphBlobs.length === 0) {
      return;
    }

    paragraph.images.forEach((_, idx) => {
      blobArray.push(paragraphBlobs[idx % paragraphBlobs.length]);
    });
  });

  return { allImages, blobArray };
}

export function useBlobParagraphAssets(
  paragraphs: BlobParagraphContent[],
  globalBlobIndices?: number[],
): ParagraphAssets {
  return useMemo(
    () => buildParagraphAssets(paragraphs, globalBlobIndices),
    [paragraphs, globalBlobIndices],
  );
}
