import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { animated, useSpring } from "@react-spring/web";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  maxOffset?: string; // e.g. "8rem"
  speed?: number; // e.g. 0.2
  thresholdPx?: number; // change threshold to avoid tiny updates (default 0.5px)
}

export default function Parallax({
  children,
  className = "",
  maxOffset = "8rem",
  speed = 0.2,
  thresholdPx = 0.5,
}: ParallaxProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  const [springs, api] = useSpring(() => ({
    y: 0,
    config: { mass: 1, tension: 280, friction: 120 },
  }));

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    // ---- convert CSS unit -> px (once) ----
    const toPx = (value: string) => {
      // single detached element reused for measurement
      const probe = document.createElement("div");
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.height = value;
      document.body.appendChild(probe);
      const px = probe.offsetHeight;
      probe.remove();
      return px;
    };
    const maxOffsetPx = toPx(maxOffset);

    // ---- state we keep outside React render ----
    let rafId: number | null = null;
    let latestScrollY = window.scrollY;
    let lastApplied = -1; // last y we sent to spring
    let pageVisible = !document.hidden;
    let inViewport = true; // will be refined by IO below

    // Only animate when visible + on screen
    const shouldRun = () => pageVisible && inViewport;

    // Coalesced update (max once per frame)
    const update = () => {
      rafId = null;
      if (!shouldRun()) return;

      const offset = Math.min(latestScrollY * speed, maxOffsetPx);
      if (Math.abs(offset - lastApplied) >= thresholdPx) {
        lastApplied = offset;
        // fire only if value changed enough
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

    // Pause/resume when tab visibility changes
    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) queueUpdate();
    };

    // Observe element visibility (viewport)
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inViewport = !!entry && (entry.isIntersecting || entry.intersectionRatio > 0);
        if (inViewport) queueUpdate();
      },
      { root: null, rootMargin: "0px", threshold: [0, 0.01, 0.1, 1] },
    );
    io.observe(el);

    // Recompute when element size/layout changes (less noisy than window resize)
    const ro = new ResizeObserver(() => {
      // layout shifts can change the perceived parallax; just recompute
      queueUpdate();
    });
    ro.observe(el);

    // Initial run
    onScroll();

    // passive listener for scroll
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      ro.disconnect();
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [api, maxOffset, speed, thresholdPx]);

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
