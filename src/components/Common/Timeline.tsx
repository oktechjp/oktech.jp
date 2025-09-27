import { Fragment } from "react";

import clsx from "clsx";
import { LuActivity } from "react-icons/lu";

type TimelineItem = {
  date: Date;
  title: string;
  description: string;
  icon: string;
};

type CellProps = {
  item: TimelineItem;
  reverse: boolean;
};

function TimelineDecoration({ item, reverse }: { item: TimelineItem; reverse: boolean }) {
  return (
    <div
      className={clsx("flex items-center justify-center", reverse && "col-start-2 bg-green-200")}
    >
      <div className="h-20 w-20">
        <LuActivity />
      </div>
    </div>
  );
}
function TimelineContent({ item, reverse }: CellProps) {
  return (
    <div className={clsx(reverse && "col-start-1 bg-blue-200")}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  );
}

function TimelineRow(props: CellProps) {
  return [<TimelineContent {...props} />, <TimelineDecoration {...props} />];
}

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="grid sm:grid-cols-2">
      {items.map((item, i) => (
        <TimelineRow key={item.title} item={item} reverse={i % 2 === 1} />
      ))}
    </div>
  );
}
