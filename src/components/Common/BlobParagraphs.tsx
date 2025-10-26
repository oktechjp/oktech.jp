import { useEffect, useState } from "react";

import { useBreakpoint } from "@/hooks/useBreakpoint";

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
  const [isHydrated, setIsHydrated] = useState(false);
  const breakpointState = useBreakpoint("md");
  const isDesktop = breakpointState === true;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <>
        <div className="hidden md:block">
          <BlobParagraphDesktop paragraphs={paragraphs} blobs={blobs} noPreload />
        </div>
        <div className="block md:hidden">
          <BlobParagraphMobile paragraphs={paragraphs} blobs={blobs} noPreload />
        </div>
      </>
    );
  }

  return isDesktop ? (
    <BlobParagraphDesktop paragraphs={paragraphs} blobs={blobs} />
  ) : (
    <BlobParagraphMobile paragraphs={paragraphs} blobs={blobs} />
  );
}
