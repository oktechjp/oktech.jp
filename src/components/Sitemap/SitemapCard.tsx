import Link from "@/components/Common/Link";
import type { Entry } from "@/utils/sitemap";

interface SitemapCardProps {
  entry: Entry;
}

export default function SitemapCard({ entry }: SitemapCardProps) {
  const { href, ogImage, description, keywords, fullUrl, title } = entry;

  if (!href) return null;

  return (
    <Link
      href={href}
      className="glass-border rounded-box bg-base-100/60 hover:bg-base-100/100 block w-full overflow-hidden transition-all duration-200"
      data-testid={`sitemap-card-${href}`}
    >
      <div className="flex flex-col">
        <div className="rounded-box-inner relative overflow-hidden">
          <figure className="bg-base-300 aspect-video h-full w-full">
            {ogImage ? (
              <img
                src={ogImage}
                alt={`OG image for ${title}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-base-content/50 text-lg font-semibold">{title}</span>
              </div>
            )}
          </figure>
        </div>
        <div className="m-5 mt-2 flex flex-col gap-3">
          <div className="text-base-content/50 truncate text-xs">{fullUrl}</div>
          <h3>{title}</h3>
          {description && <div className="text-base-content/70 text-sm">{description}</div>}
          {keywords && keywords.length > 0 && (
            <div className="-mx-2 mt-2 -mb-2 flex flex-wrap gap-1">
              {keywords.map((keyword) => (
                <span key={keyword} className="badge badge-sm">
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
