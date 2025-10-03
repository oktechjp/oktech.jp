import { useBreakpoint } from "@/utils/hooks/useBreakpoint";

import BlobParagraphDesktop from "./BlobParagraphDesktop";
import BlobParagraphMobile from "./BlobParagraphMobile";
import type { BlobParagraphContent } from "./BlobParagraphShared";

export default function BlobParagraphs({
  paragraphs,
  blobs,
}: {
  paragraphs: BlobParagraphContent[];
  blobs?: number[];
}) {
  const isDesktop = useBreakpoint("md");

  if (isDesktop) {
    return <BlobParagraphDesktop paragraphs={paragraphs} blobs={blobs} />;
  }

  return <BlobParagraphMobile paragraphs={paragraphs} blobs={blobs} />;
}
