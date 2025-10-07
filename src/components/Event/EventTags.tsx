import { LuTag } from "react-icons/lu";

interface EventTagsProps {
  tags?: string[];
}

export default function EventTags({ tags }: EventTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag, index) => (
        <span key={`${tag}-${index}`} className="text-base-500 badge badge-outline xl:badge-lg">
          {tag}
        </span>
      ))}
    </div>
  );
}
