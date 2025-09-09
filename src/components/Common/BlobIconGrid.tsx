import type { ReactNode } from "react";

import clsx from "clsx";
import type { IconType } from "react-icons";

import BlobCard from "@/components/Common/BlobCard";
import CalendarFeeds from "@/components/Common/CalendarFeeds";
import Link from "@/components/Common/Link";
import { type Patterns, patterns } from "@/components/Common/Pattern";

export interface BlobIconGridItem {
  type: "link" | "calendar" | "a";
  title: string;
  description: string;
  icon: IconType;
  href?: string;
  target?: string;
  rel?: string;
  testId?: string;
  showTip?: boolean;
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
    <div className="-mt-10 flex flex-col items-center justify-center gap-8 text-center transition-all group-hover:-mt-24 group-hover:scale-110 group-hover:gap-12">
      <div className="bg-primary/50 text-primary-content group-hover:bg-primary/100 rounded-field flex aspect-square items-center justify-center p-4 transition-all group-hover:scale-125">
        <Icon className="text-5xl" />
      </div>
      <div className="text-base-content hover:text-primary-content flex flex-col items-center justify-center">
        <h3 className="mb-1 text-lg font-bold">{title}</h3>
        <p className="max-w-52">{description}</p>
      </div>
    </div>
  );
}

function BlobWrapper({
  children,
  preset,
  pattern,
  className,
}: {
  children: ReactNode;
  preset: number;
  pattern?: Patterns;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <BlobCard
        preset={preset}
        pattern={pattern}
        patternClass="bg-primary-content/5"
        className="mt-5 -mb-5 h-70 w-70"
      >
        <div className="flex h-full w-full items-center justify-center">{children}</div>
      </BlobCard>
    </div>
  );
}

export default function BlobIconGrid({ items, className = "" }: BlobIconGridProps) {
  const patternKeys = Object.keys(patterns) as Patterns[];

  return (
    <div className={clsx("flex flex-wrap justify-center gap-28 pb-12 md:pb-24", className)}>
      {items.map((item, index) => {
        const patternIndex = index % patternKeys.length;
        const pattern = patternKeys[patternIndex];

        return (
          <BlobWrapper
            key={`${item.title}-${index}`}
            preset={index}
            pattern={pattern}
            className="-mb-12 md:-mb-24"
          >
            {item.type === "link" ? (
              <Link href={item.href || "#"} className="">
                <GridItem title={item.title} description={item.description} Icon={item.icon} />
              </Link>
            ) : item.type === "calendar" ? (
              <CalendarFeeds className="" dropdownPosition="bottom">
                <GridItem title={item.title} description={item.description} Icon={item.icon} />
              </CalendarFeeds>
            ) : (
              <a
                href={item.href || "#"}
                target={item.target}
                rel={item.rel}
                data-testid={item.testId}
              >
                <GridItem title={item.title} description={item.description} Icon={item.icon} />
              </a>
            )}
          </BlobWrapper>
        );
      })}
    </div>
  );
}
