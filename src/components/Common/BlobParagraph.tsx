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
      className={`gap-responsive-tight flex flex-col transition-opacity duration-300 text-lg ${
        isActive ? "opacity-100" : "opacity-30"
      }`}
    >
      <h3 className="text-3xl">{paragraph.title}</h3>
      <p>{paragraph.text}</p>
    </div>
  );
}
