import type { ReactNode } from "react";

import clsx from "clsx";
import type { IconType } from "react-icons";

import BlobCard from "@/components/Common/BlobCard";
import Link from "@/components/Common/Link";

export interface BlobIconGridItem {
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
  items: BlobIconGridItem[];
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
    <div className="text-base-900 flex flex-col items-center justify-center gap-4 text-center">
      <Icon className="text-4xl" />

      <div className="flex flex-col items-center justify-center">
        <h3 className="mb-1 text-lg font-bold">{title}</h3>
        <p className="text-base-500 max-w-52">{description}</p>
      </div>
    </div>
  );
}

function BlobWrapper({
  children,
  preset,
  className,
  index,
}: {
  children: ReactNode;
  preset: number;
  className?: string;
  index: number;
}) {
  const bgClasses = [
    "bg-error/0 group-hover:bg-error group-active:bg-error dark:opacity-20",
    "bg-success/0 group-hover:bg-success group-active:bg-success dark:opacity-20",
    "bg-info/0 group-hover:bg-info group-active:bg-info dark:opacity-20",
  ];
  const bgClass = bgClasses[index % 3];

  return (
    <div className={clsx("group flex items-center justify-center", className)}>
      <BlobCard preset={preset} bgClass={bgClass} className="mt-5 -mb-5 h-70 w-70">
        <div className="flex h-full w-full items-center justify-center">{children}</div>
      </BlobCard>
    </div>
  );
}

export default function BlobIconGrid({ items, className = "" }: BlobIconGridProps) {
  return (
    <div className={clsx("grid md:grid-cols-3", className)}>
      {items.map((item, index) => {
        const wrapContent = item.wrap ?? createDefaultWrapper(item);
        return (
          <BlobWrapper key={`${item.title}-${index}`} preset={index} index={index}>
            {wrapContent(
              <GridItem title={item.title} description={item.description} Icon={item.icon} />,
            )}
          </BlobWrapper>
        );
      })}
    </div>
  );
}

function createDefaultWrapper(item: BlobIconGridItem) {
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
