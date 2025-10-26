import { useEffect, useState } from "react";

import { BREAKPOINTS, type Breakpoint } from "@/utils/breakpoints";

export { BREAKPOINTS };

/**
 * Get the current breakpoint based on window width
 * Matches Tailwind's default breakpoints
 */
function getCurrentBreakpoint(): Breakpoint {
  const width = window.innerWidth;
  if (width >= 1536) return "2xl";
  if (width >= 1280) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  if (width >= 640) return "sm";
  return "base";
}

/**
 * Hook to get current breakpoint and check if viewport is at/above a given breakpoint
 */
export function useBreakpoint(breakpoint?: keyof typeof BREAKPOINTS) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("base");
  const [isAbove, setIsAbove] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      setCurrentBreakpoint(getCurrentBreakpoint());
      if (breakpoint) {
        setIsAbove(window.innerWidth >= BREAKPOINTS[breakpoint]);
      }
    };

    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, [breakpoint]);

  return breakpoint ? isAbove : currentBreakpoint;
}
