import type { ReactNode } from "react";

import clsx from "clsx";
import type { IconType } from "react-icons";

import BlobIconGridItem from "@/components/Common/BlobIconGridItem";
import Link from "@/components/Common/Link";

export interface BlobIconGridItemConfig {
  title: string;
  description: string;
  icon: IconType;
  href?: string;
  target?: string;
  rel?: string;
  testId?: string;
  wrap?: (content: ReactNode) => ReactNode;
}

interface BlobIconGridProps {
  items: BlobIconGridItemConfig[];
  className?: string;
}

function GridItem({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: IconType;
}) {
  return (
    <div className="text-base-800 group-hover:text-base-900 flex flex-col items-center justify-center gap-4 text-center transition-colors">
      <Icon className="text-4xl" />

      <div className="flex flex-col items-center justify-center">
        <h3 className="mb-1 text-lg font-bold">{title}</h3>
        <p className="text-base-600 group-hover:text-base-800 max-w-52 transition-colors">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function BlobIconGrid({ items, className = "" }: BlobIconGridProps) {
  return (
    <div className={clsx("grid md:grid-cols-3", className)}>
      {items.map((item, index) => {
        const wrapContent = item.wrap ?? createDefaultWrapper(item);
        return (
          <BlobIconGridItem key={`${item.title}-${index}`} index={index}>
            <div className="flex h-full w-full items-center justify-center">
              {wrapContent(
                <GridItem title={item.title} description={item.description} Icon={item.icon} />,
              )}
            </div>
          </BlobIconGridItem>
        );
      })}
    </div>
  );
}

function createDefaultWrapper(item: BlobIconGridItemConfig) {
  if (!item.href) {
    return (content: ReactNode) => content;
  }

  const isInternal = item.href.startsWith("/");

  if (isInternal) {
    return (content: ReactNode) => (
      <Link href={item.href ?? "#"} target={item.target} rel={item.rel} data-testid={item.testId}>
        {content}
      </Link>
    );
  }

  return (content: ReactNode) => (
    <a
      href={item.href ?? "#"}
      target={item.target ?? "_blank"}
      rel={item.rel ?? "noopener noreferrer"}
      data-testid={item.testId}
    >
      {content}
    </a>
  );
}
