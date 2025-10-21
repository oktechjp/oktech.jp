import React, { type ReactNode } from "react";

interface GridProps {
  className?: string;
  children: ReactNode;
  forceFullWidth?: boolean;
}

export default function Grid({ className, children, forceFullWidth = false }: GridProps) {
  // Reason: Use React.Children.toArray to properly flatten fragments
  const childArray = React.Children.toArray(children);
  const count = childArray.length;

  // Consider less than 3 items as not having a full row
  const hasFullRow = forceFullWidth || count >= 3;

  if (hasFullRow) {
    // Normal grid behavior for 3+ items
    return (
      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] ${
          className || ""
        }`.trim()}
      >
        {children}
      </div>
    );
  }

  // Constrained width for 1-2 items
  return (
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(300px,400px))] md:justify-center ${
        className || ""
      }`.trim()}
    >
      {children}
    </div>
  );
}
