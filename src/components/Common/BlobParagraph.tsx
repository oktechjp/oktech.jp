import Button from "@/components/Common/Button";
import Link from "@/components/Common/Link";

import type { BlobParagraphContent } from "./BlobParagraphShared";

export default function BlobParagraph({
  paragraph,
  isActive,
  onRef,
}: {
  paragraph: BlobParagraphContent;
  isActive: boolean;
  onRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={onRef}
      className={`gap-responsive-tight flex flex-col text-lg transition-opacity duration-300 ${
        isActive ? "opacity-100" : "opacity-30"
      }`}
    >
      <h3 className="text-3xl">{paragraph.title}</h3>
      <p>{paragraph.text}</p>
      {paragraph.cta && (
        <div className="flex flex-col items-start gap-2">
          <Button
            href={paragraph.cta.href}
            text={paragraph.cta.text}
            ariaLabel={paragraph.cta.ariaLabel}
          />
          {paragraph.cta.secondaryHref && paragraph.cta.secondaryText && (
            <Link
              href={paragraph.cta.secondaryHref}
              className="text-base-content/60 text-sm underline"
            >
              {paragraph.cta.secondaryText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
