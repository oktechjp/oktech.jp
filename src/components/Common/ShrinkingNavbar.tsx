import { useEffect, useRef, useState } from "react";

import { animated, useSpring } from "@react-spring/web";
import clsx from "clsx";

import Container from "@/components/Common/Container";
import { type Breakpoint, useBreakpoint } from "@/utils/hooks/useBreakpoint";
import { useScrolled } from "@/utils/hooks/useScrolled";

interface ShrinkingNavbarProps {
  children: React.ReactNode;
  className?: string;
}

const BREAKPOINT_MAX_WIDTHS = {
  base: 420, // max-w-sm
  sm: 580, // max-w-sm
  md: 720, // max-w-lg
  lg: 888, // max-w-3xl
  xl: 1100, // max-w-4xl
  "2xl": 1100, // max-w-6xl
};

const BACKGROUND_PADDING = 12;

export default function ShrinkingNavbar({ children, className }: ShrinkingNavbarProps) {
  const showBackground = useScrolled();
  const containerRef = useRef<HTMLDivElement>(null);
  const [targetMargin, setTargetMargin] = useState(0);
  const currentBreakpoint = useBreakpoint() as Breakpoint;

  useEffect(() => {
    const calculateMargin = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const maxWidth = BREAKPOINT_MAX_WIDTHS[currentBreakpoint];

      // Calculate margin needed to reach max width first
      let baseMargin = 0;
      if (containerWidth > maxWidth) {
        baseMargin = (containerWidth - maxWidth) / 2;
      }

      // Then add extra padding when background is showing
      const finalMargin = showBackground ? baseMargin + BACKGROUND_PADDING : 0;
      setTargetMargin(finalMargin);
    };

    calculateMargin();
    const observer = new ResizeObserver(calculateMargin);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [showBackground, currentBreakpoint]);

  const springs = useSpring({
    margin: showBackground ? targetMargin : 0,
    config: {
      mass: 0.8,
      tension: 80,
      friction: 9,
    },
  });

  return (
    <Container wide>
      <div ref={containerRef} className="-mx-2 pt-6 md:-mx-4">
        <animated.div
          className="m-auto"
          style={{
            marginLeft: springs.margin.to((m) => `${m}px`),
            marginRight: springs.margin.to((m) => `${m}px`),
          }}
        >
          <div
            className={clsx(
              "rounded-box flex w-full justify-between border p-px transition-all duration-300",
              !showBackground
                ? "bg-base-100/0 border-base-100/0"
                : "bg-base-100/50 border-base-100/50",
              className,
            )}
            style={{
              backdropFilter: showBackground ? "brightness(1.4) saturate(1.3) blur(30px)" : "none",
            }}
          >
            {children}
          </div>
        </animated.div>
      </div>
    </Container>
  );
}
