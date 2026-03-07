import { LuClock } from "react-icons/lu";

import Link from "@/components/Common/Link";
import type { ParsedAuthor } from "@/utils/author";

interface ArticleCardProps {
  title: string;
  description: string;
  href: string;
  author?: ParsedAuthor;
  date?: string;
  readingTime?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function AuthorAvatar({ author }: { author: ParsedAuthor }) {
  if (author.avatarUrl) {
    return (
      <img
        src={author.avatarUrl}
        alt={author.name}
        className="h-8 w-8 rounded-full object-cover"
        loading="lazy"
      />
    );
  }
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  return (
    <div className="bg-base-300 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
      {initials}
    </div>
  );
}

export default function ArticleCard({
  title,
  description,
  href,
  author,
  date,
  readingTime,
}: ArticleCardProps) {
  return (
    <Link
      href={href}
      className="ok-card flex flex-col gap-3 p-6 transition-colors duration-200 hover:bg-base-100 dark:border dark:border-base-content/10"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-2xl font-medium">{title}</h2>
        {(date || readingTime) && (
          <div className="text-base-content/50 flex items-center gap-2 text-sm whitespace-nowrap">
            {date && (
              <span className="flex items-center gap-1">
                <LuClock className="h-3.5 w-3.5" />
                {formatDate(date)}
              </span>
            )}
            {date && readingTime && <span>|</span>}
            {readingTime && <span>{readingTime}</span>}
          </div>
        )}
      </div>
      {description && <p className="text-base-content/70">{description}</p>}
      {author && (
        <div className="flex items-center gap-2">
          <AuthorAvatar author={author} />
          <span className="text-base-content/60 text-sm">Written by {author.name}</span>
        </div>
      )}
    </Link>
  );
}
