import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  content: ReactNode;
  position?: "left" | "right" | "top" | "bottom";
}

export default function BigTooltip({ children, content, position = "left" }: Props) {
  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return {
          wrapper: "left-0 top-1/2 -translate-y-1/2 -translate-x-full -ml-4",
          arrow: "right-0 top-1/2 -translate-y-1/2 translate-x-full",
          arrowBorder:
            "border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[10px] border-l-base-900",
          bridge: "absolute right-0 top-1/2 -translate-y-1/2 w-4 h-20 translate-x-full",
        };
      case "right":
        return {
          wrapper: "right-0 top-1/2 -translate-y-1/2 translate-x-full ml-4",
          arrow: "left-0 top-1/2 -translate-y-1/2 -translate-x-full",
          arrowBorder:
            "border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[10px] border-r-base-900",
          bridge: "absolute left-0 top-1/2 -translate-y-1/2 w-4 h-20 -translate-x-full",
        };
      case "top":
        return {
          wrapper: "left-1/2 top-0 -translate-x-1/2 -translate-y-full -mt-4",
          arrow: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full",
          arrowBorder:
            "border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-base-900",
          bridge: "absolute bottom-0 left-1/2 -translate-x-1/2 h-4 w-20 translate-y-full",
        };
      case "bottom":
        return {
          wrapper: "left-1/2 bottom-0 -translate-x-1/2 translate-y-full mt-4",
          arrow: "top-0 left-1/2 -translate-x-1/2 -translate-y-full",
          arrowBorder:
            "border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-base-900",
          bridge: "absolute top-0 left-1/2 -translate-x-1/2 h-4 w-20 -translate-y-full",
        };
    }
  };

  const positionClasses = getPositionClasses();

  return (
    <div className="group relative">
      {children}
      <div
        className={`absolute w-xl ${positionClasses.wrapper} pointer-events-none z-50 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100`}
      >
        <div className="relative">
          {/* Invisible bridge to maintain hover state */}
          <div className={positionClasses.bridge}></div>
          <div className={`absolute ${positionClasses.arrow}`}>
            <div className={`h-0 w-0 ${positionClasses.arrowBorder}`}></div>
          </div>
          <div className="justify-items-end">{content}</div>
        </div>
      </div>
    </div>
  );
}
