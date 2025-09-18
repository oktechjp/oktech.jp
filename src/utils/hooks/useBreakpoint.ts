import { useEffect, useState } from "react";

// Tailwind default breakpoints
// https://tailwindcss.com/docs/responsive-design
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook to check if viewport is at or above a given breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [isAbove, setIsAbove] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      setIsAbove(window.innerWidth >= BREAKPOINTS[breakpoint]);
    };

    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, [breakpoint]);

  return isAbove;
}

/**
 * Hook to check if viewport is below a given breakpoint
 */
export function useBelowBreakpoint(breakpoint: Breakpoint): boolean {
  return !useBreakpoint(breakpoint);
}
