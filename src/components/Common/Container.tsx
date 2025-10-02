import type { ReactNode } from "react";

import clsx from "clsx";

import Grid from "./Grid";

interface ContainerProps {
  className?: string;
  wide?: boolean;
  thin?: boolean;
  grid?: boolean;
  children: ReactNode;
}

export default function Container({
  className,
  wide = false,
  thin = false,
  grid = false,
  children,
}: ContainerProps) {
  return (
    <div
      className={clsx([
        "mx-auto px-4 sm:px-6 lg:px-8",
        wide && "w-full max-w-[1680px]",
        thin && "w-4xl max-w-full",
        !wide && !thin && "w-full max-w-6xl",
        className,
      ])}
    >
      {grid ? <Grid>{children}</Grid> : children}
    </div>
  );
}
