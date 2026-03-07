import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

import Link from "@/components/Common/Link";

interface ArticleNextLinkProps {
  title?: string;
  href?: string;
}

export default function ArticleNextLink({ title, href }: ArticleNextLinkProps) {
  return (
    <div className="border-base-content/10 mt-12 flex items-center justify-between border-t pt-6 text-sm">
      <Link
        href="/articles"
        className="text-base-content/70 hover:text-base-content flex items-center gap-1.5 transition-colors"
      >
        <LuArrowLeft className="h-4 w-4" />
        All articles
      </Link>
      {title && href && (
        <Link
          href={href}
          className="text-base-content/70 hover:text-base-content flex items-center gap-1.5 transition-colors"
        >
          Next: {title}
          <LuArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
