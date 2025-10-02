type Paragraph = {
  title: string;
  text: string;
  images: (string | { src: string; srcSet?: string; sizes?: string })[];
  blobs?: number[];
};

export default function BlobParagraph({
  paragraph,
  isActive,
  onRef,
}: {
  paragraph: Paragraph;
  isActive: boolean;
  onRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={onRef}
      className={`gap-responsive-tight flex flex-col transition-opacity duration-300 ${
        isActive ? "opacity-100" : "opacity-30"
      }`}
    >
      <h3 className="text-3xl">{paragraph.title}</h3>
      <p>{paragraph.text}</p>
    </div>
  );
}
