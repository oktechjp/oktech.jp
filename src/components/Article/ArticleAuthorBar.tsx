import type { ParsedAuthor } from "@/utils/author";

interface ArticleAuthorBarProps {
  author: ParsedAuthor;
}

function AuthorAvatar({ author }: { author: ParsedAuthor }) {
  if (author.avatarUrl) {
    return (
      <img
        src={author.avatarUrl}
        alt={author.name}
        className="h-6 w-6 rounded-full object-cover"
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
    <div className="bg-base-300 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
      {initials}
    </div>
  );
}

export default function ArticleAuthorBar({ author }: ArticleAuthorBarProps) {
  const content = (
    <span className="flex items-center gap-2">
      <AuthorAvatar author={author} />
      <span>Written by {author.name}</span>
    </span>
  );

  if (author.profileUrl) {
    return (
      <a
        href={author.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-base-content transition-colors"
      >
        {content}
      </a>
    );
  }

  return content;
}
