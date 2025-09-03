import type { ButtonHTMLAttributes, ReactNode } from "react";

import LinkReact from "@/components/Common/Link";

type TooltipButtonProps = {
  tooltip: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
  className?: string;
} & (
  | ({
      as?: "button";
      href?: never;
    } & ButtonHTMLAttributes<HTMLButtonElement>)
  | {
      as: "link";
      href: string;
      [key: string]: any;
    }
);

export default function TooltipButton(props: TooltipButtonProps) {
  const {
    tooltip,
    tooltipPosition = "top",
    children,
    className = "",
    as = "button",
    ...restProps
  } = props;
  const tooltipClass = tooltipPosition === "top" ? "tooltip-top" : `tooltip-${tooltipPosition}`;

  return (
    <div className={`tooltip ${tooltipClass}`} data-tip={tooltip}>
      {as === "link" ? (
        <LinkReact
          className={className}
          {...(restProps as Extract<TooltipButtonProps, { as: "link" }>)}
        >
          {children}
        </LinkReact>
      ) : (
        <button
          className={className}
          {...(restProps as Extract<TooltipButtonProps, { as?: "button" }>)}
        >
          {children}
        </button>
      )}
    </div>
  );
}
