import { Fragment, type ReactNode } from "react";

import clsx from "clsx";

import kwddmLogo from "@/assets/kwddm.svg";
import owddmLogo from "@/assets/owddm.svg";
import star from "@/assets/star.png";

import Brand from "./Brand";
import ScribbleLine from "./ScribbleLine";

const items: TimelineItem[] = [
  {
    year: "2014",
    text: "Founded in Osaka as OWDDM (Osaka Web Designers & Developers Meetup)",
    icon: <img src={owddmLogo.src} alt="OWDDM" className="w-20" />,
  },
  {
    year: "2015-2022",
    text: "The community hosted a wide range of events. While originally focused on web design and development, topics expanded to include cloud, AI, and game development. The group also built a strong community through social gatherings like dinners and seasonal events.",
    icon: <img src={star.src} alt="" className="w-20" />,
  },
  {
    year: "2023",
    text: "Kyoto counterpart, KWDDM, joining this year.",
    icon: <img src={kwddmLogo.src} alt="KWDDM" className="w-20" />,
  },
  {
    year: "2025",
    text: "After nearly a decade, the community rebranded as OKTech, reflecting its broader focus on all things tech in the Kansai region while remaining community-driven and volunteer-run.",
    icon: (
      <div className="md:-ml-14">
        <Brand active className="w-32" />
      </div>
    ),
  },
];

type TimelineItem = {
  year: string;
  text: string;
  icon: ReactNode;
};

function getLineColor(index: number): string {
  const lineColors = ["text-error", "text-success", "text-info"];
  return lineColors[Math.floor(index) % 3];
}

function TextCell({ year, text }: { year: string; text: string }) {
  return (
    <div className={clsx("rounded-box bg-base-100 text-base-900 flex flex-col gap-4 p-8")}>
      <h3 className="text-3xl">{year}</h3>
      <p className="text-lg">{text}</p>
    </div>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return <div className="flex h-20 items-center justify-center">{children}</div>;
}

function DownScribble({ color, fat }: { color: string; fat?: boolean }) {
  return (
    <div className={clsx("flex h-full w-full items-center justify-center", color)}>
      <div
        className={clsx(
          "flex aspect-square h-full rotate-90 items-center justify-center",
          fat ? "scale-y-400" : "scale-y-200",
        )}
      >
        <ScribbleLine />
      </div>
    </div>
  );
}

type CellProps = {
  item: TimelineItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
};

function TimelineDecoration({ item, index, isLast }: CellProps) {
  const currentLineColor = getLineColor(index);
  const isLeft = index % 2 === 0;

  return (
    <div className="col-span-7 mt-10 grid min-h-90 grid-cols-12 grid-rows-4 gap-2">
      <div
        className={clsx(
          "col-span-7 flex h-20 items-center justify-center",
          isLeft ? "col-start-0" : "order-2 rotate-180",
          currentLineColor,
        )}
      >
        <ScribbleLine />
      </div>
      <div className={clsx("col-span-2", isLeft ? "col-start-8" : "order-1 col-start-4")}>
        <Icon>{item.icon}</Icon>
      </div>
      {!isLast && (
        <div
          className={clsx(
            "order-last col-span-6 row-span-3",
            isLeft ? "col-start-6" : "order-last col-start-2",
          )}
        >
          <DownScribble color={currentLineColor} />
        </div>
      )}
    </div>
  );
}

function TimelineContent({ item }: CellProps) {
  return (
    <div className="col-span-5">
      <TextCell year={item.year} text={item.text} />
    </div>
  );
}

export function TimelineDesktop() {
  return (
    <div className="hidden grid-cols-12 gap-4 md:grid">
      {items.map((item, i) => {
        const isLeft = i % 2 === 0;

        return (
          <Fragment key={item.year}>
            {isLeft ? (
              <>
                <TimelineContent
                  item={item}
                  index={i}
                  isFirst={i === 0}
                  isLast={i === items.length - 1}
                />
                <TimelineDecoration
                  item={item}
                  index={i}
                  isFirst={i === 0}
                  isLast={i === items.length - 1}
                />
              </>
            ) : (
              <>
                <TimelineDecoration
                  item={item}
                  index={i}
                  isFirst={false}
                  isLast={i === items.length - 1}
                />
                <TimelineContent
                  item={item}
                  index={i}
                  isFirst={false}
                  isLast={i === items.length - 1}
                />
              </>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function TimelineMobile() {
  return (
    <div className="flex flex-col items-center gap-4 md:hidden">
      {items.map((item, i) => {
        const notLast = i < items.length - 1;
        return (
          <div key={item.year} className="flex flex-col items-center gap-4">
            <TextCell year={item.year} text={item.text} />
            {notLast && (
              <div className="relative">
                <div className="absolute inset-0 z-0">
                  <DownScribble color={getLineColor(i)} />
                </div>
                <div className="relative z-10 py-18">
                  <Icon>{item.icon}</Icon>
                </div>
              </div>
            )}
            {!notLast && (
              <>
                <div className="h-24">
                  <DownScribble color={getLineColor(i)} />
                </div>
                <div>
                  <Icon>{item.icon}</Icon>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Timeline() {
  return (
    <>
      <TimelineDesktop />
      <TimelineMobile />
    </>
  );
}
