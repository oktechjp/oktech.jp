import { useEffect, useState } from "react";

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

// Tailwind default breakpoints
// https://tailwindcss.com/docs/responsive-design
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

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
