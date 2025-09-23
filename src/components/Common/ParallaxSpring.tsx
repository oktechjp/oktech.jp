import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { animated, useSpring } from "@react-spring/web";

// Animation configuration constants
const VIEWPORT_START_POSITION = 0.4; // Start tracking when container top reaches 30% of viewport
const VIEWPORT_END_POSITION = 0.6; // Stop tracking when container bottom reaches 50% of viewport
const SPRING_CONFIG = {
  mass: 3,
  tension: 50,
  friction: 12,
  clamp: false,
};

interface ParallaxSpringProps {
  children?: ReactNode;
  className?: string;
  speed?: number;
}

export default function ParallaxSpring({
  children,
  className = "",
  speed = 0.5,
}: ParallaxSpringProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [springs, api] = useSpring(() => ({
    y: 0,
    config: SPRING_CONFIG,
  }));

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const container = elementRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate scroll progress relative to container
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;
      const containerHeight = containerRect.height;
      const elementHeight = elementRef.current.offsetHeight;

      // Maximum distance the element can move within its container
      const maxTranslate = Math.max(0, containerHeight - elementHeight);

      // Calculate progress to keep element tracking between start and end viewport positions
      let progress = 0;
      const startTarget = viewportHeight * VIEWPORT_START_POSITION;
      const endTarget = viewportHeight * VIEWPORT_END_POSITION;

      // We want the element to:
      // Start moving: when container top reaches start position
      // Stop moving: when container bottom reaches end position

      if (containerTop <= startTarget && containerBottom >= endTarget) {
        // Container spans both targets - element should track position
        const targetPosition = startTarget - containerTop;
        progress = targetPosition / containerHeight;
      } else if (containerBottom < endTarget) {
        // Container has scrolled past end mark - element at bottom
        progress = 1;
      }
      // else containerTop > startTarget - element stays at top (progress = 0)

      // Apply speed factor and calculate final Y position
      let targetY = progress * maxTranslate * speed;

      // Clamp to container bounds
      targetY = Math.max(0, Math.min(targetY, maxTranslate));

      api.start({
        y: targetY,
        config: SPRING_CONFIG,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [api, speed]);

  return (
    <animated.div
      ref={elementRef}
      className={className}
      style={{
        transform: springs.y.to((y) => `translate3d(0, ${y}px, 0)`),
        willChange: "transform",
      }}
    >
      {children}
    </animated.div>
  );
}
