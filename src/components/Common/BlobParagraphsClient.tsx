import { Parallax, ParallaxLayer } from "@react-spring/parallax";

import { BLOBS } from "@/utils/blobs";

import BlobSlideshow from "./BlobSlideshow";
import Container from "./Container";
import ContentSection from "./ContentSection";
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
}

interface BlobParagraphsProps {
  paragraphs: Paragraph[];
}

export default function BlobParagraphsClient({ paragraphs }: BlobParagraphsProps) {
  return (
    <Container wide className="grid grid-cols-2 gap-4">
      <div className="gap-responsive flex flex-col">
        {paragraphs.map((paragraph, index) => {
          const startTimeOffset = index * 200;
          const blobOffset = index === 2 ? 5 : undefined;

          const blobs =
            index === 1 ? [BLOBS[2], BLOBS[0], BLOBS[4], BLOBS[5], BLOBS[7]] : undefined;

          return (
            <div className="gap-responsive-tight flex flex-col">
              <h3 className="text-3xl">{paragraph.title}</h3>
              <p>{paragraph.text}</p>
            </div>

            // <BlobSlideshow
            //   startTimeOffset={startTimeOffset}
            //   blobs={blobs}
            //   blobOffset={blobOffset}
            //   images={paragraph.images}
            // />
          );
        })}
      </div>
      <div className="-my-20 bg-red-200">
        <ParallaxSpring speed={1}>
          <div className="from-primary/20 to-secondary/20 mx-auto max-w-4xl rounded-2xl bg-gradient-to-br p-12 text-center backdrop-blur-sm">
            <h2 className="mb-4 text-4xl font-bold">Bouncy Parallax</h2>
            <p className="text-lg opacity-80">
              This element smoothly scrolls within its container with a springy bounce!
            </p>
          </div>
        </ParallaxSpring>
      </div>
    </Container>
  );
}
