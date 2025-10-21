import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { animated, useSpring } from "@react-spring/web";
import type { SpringConfig } from "@react-spring/web";

interface ParallaxInfiniteProps {
  children: ReactNode;
  className?: string;
  springConfig?: SpringConfig;
}

export default function ParallaxInfinite({
  children,
  className = "",
  springConfig,
}: ParallaxInfiniteProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  const [springs, api] = useSpring(() => ({
    y: 0,
    config: springConfig || { mass: 2, tension: 20, friction: 5 },
  }));

  useEffect(() => {
    if (!hostRef.current) return;

    let rafId: number | null = null;
    let lastApplied = Number.NaN;
    let latestScrollY = window.scrollY;
    let pageVisible = !document.hidden;

    const computeOffset = () => latestScrollY;

    const update = () => {
      rafId = null;
      if (!pageVisible) return;

      const offset = computeOffset();
      if (Number.isNaN(lastApplied) || Math.abs(offset - lastApplied) >= 0.1) {
        lastApplied = offset;
        api.start({ y: offset });
      }
    };

    const queueUpdate = () => {
      if (rafId == null) {
        rafId = requestAnimationFrame(update);
      }
    };

    const onScroll = () => {
      latestScrollY = window.scrollY;
      queueUpdate();
    };

    const onResize = () => {
      queueUpdate();
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) queueUpdate();
    };

    queueUpdate();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [api]);

  return (
    <div ref={hostRef} className={`relative ${className}`}>
      <animated.div
        style={{
          transform: springs.y.to((y) => `translate3d(0, ${y}px, 0)`),
          willChange: "transform",
        }}
      >
        {children}
      </animated.div>
    </div>
  );
}
