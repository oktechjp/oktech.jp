import BlobSlideshow from "./BlobSlideshow";

type ImageData = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

export default function BlobParagraphSlideshow({
  allImages,
  activeImageRange,
  blobArray,
  noPreload = false,
}: {
  allImages: (string | ImageData)[];
  activeImageRange: { start: number; end: number };
  blobArray: string[];
  noPreload?: boolean;
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
      noPreload={noPreload}
    />
  );
}
