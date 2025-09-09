import clsx from "clsx";

import Pattern, { type Patterns } from "@/components/Common/Pattern";

type CutDirection = boolean | "up" | "down";

export default function Cut({
  top = false,
  bottom = false,
  both = true,
  className = "py-4",
  bgClass = "bg-primary/20",
  pattern,
  patternClass,
  children,
}: {
  top?: CutDirection;
  bottom?: CutDirection;
  both?: CutDirection;
  children: React.ReactNode;
  bgClass?: string;
  className?: string;
  pattern?: Patterns;
  patternClass?: string;
}) {
  const cutSize = "5rem"; // Base cut height (32px)

  // Default to both if no props are passed
  const noPropsSpecified = !top && !bottom && !both;
  const showTop = noPropsSpecified || both || top;
  const showBottom = noPropsSpecified || both || bottom;

  // Determine slope directions
  const topDirection = typeof both === "string" ? both : typeof top === "string" ? top : "up";
  const bottomDirection =
    typeof both === "string" ? both : typeof bottom === "string" ? bottom : "down";

  // Build clip-path with fixed height cuts
  const getClipPath = () => {
    const topLeft = showTop && topDirection === "up" ? cutSize : "0";
    const topRight = showTop && topDirection === "down" ? cutSize : "0";
    const bottomRight =
      showBottom && bottomDirection === "down" ? "100%" : `calc(100% - ${cutSize})`;
    const bottomLeft = showBottom && bottomDirection === "up" ? "100%" : `calc(100% - ${cutSize})`;

    return `polygon(0 ${topLeft}, 100% ${topRight}, 100% ${bottomRight}, 0 ${bottomLeft})`;
  };

  const cutClasses = [showTop && `-top-[5rem]`, showBottom && `-bottom-[4rem]`];

  return (
    <div className={clsx("relative", className)}>
      {/* Single background div with clip-path */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 z-0",
          bgClass,
          // Extend div beyond container to accommodate cuts
          ...cutClasses,
        )}
        style={{
          clipPath: getClipPath(),
        }}
      >
        {pattern && <Pattern type={pattern} className={patternClass} />}
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
