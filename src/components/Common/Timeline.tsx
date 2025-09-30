import type { ReactNode } from "react";

import clsx from "clsx";

import kwddmLogo from "@/assets/kwddm.svg";
import owddmLogo from "@/assets/owddm.svg";
import star from "@/assets/star.png";

import Brand from "./Brand";
import ScribbleLine from "./ScribbleLine";

type TimelineItem = {
  year: string;
  text: string;
  icon: ReactNode;
};

type CellProps = {
  item: TimelineItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
};

function TimelineDecoration({ item, index, isLast }: CellProps) {
  const lineColors = ["text-error", "text-success", "text-info"];
  const currentLineColor = lineColors[Math.floor(index) % 3];
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
      <div
        className={clsx(
          "col-span-2 flex h-20 items-center justify-center",
          isLeft ? "col-start-8" : "order-1 col-start-4",
        )}
      >
        <div>{item.icon}</div>
      </div>
      {!isLast && (
        <div
          className={clsx(
            "order-last col-span-6 row-span-3 flex items-center justify-center",
            isLeft ? "col-start-6" : "order-last col-start-2",
            currentLineColor,
          )}
        >
          <div className="flex aspect-square h-full scale-y-200 rotate-90 items-center justify-center">
            <ScribbleLine />
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineContent({ item }: CellProps) {
  return (
    <div className="col-span-5">
      <div className={clsx("rounded-box bg-base-100 text-base-900 flex flex-col gap-4 p-8")}>
        <h3 className="text-3xl">{item.year}</h3>
        <p className="text-lg">{item.text}</p>
      </div>
    </div>
  );
}

export default function Timeline() {
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
        <div className="-ml-14">
          <Brand active className="w-32" />
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-4">
      {items.map((item, i) => {
        const isLeft = i % 2 === 0;

        return (
          <>
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
          </>
        );
      })}
    </div>
  );
}
