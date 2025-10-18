import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { animated, useSpring } from "@react-spring/web";

// Animation configuration constants
const VIEWPORT_START_POSITION = 0.4; // Start tracking when container top reaches 40% of viewport
const DESKTOP_TOP_BUFFER = 80; // Minimum pixels from top of viewport on desktop
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
  sticky?: boolean;
}

export default function ParallaxSpring({
  children,
  className = "",
  speed = 0.5,
  sticky = false,
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
      const containerHeight = containerRect.height;
      const elementHeight = elementRef.current.offsetHeight;

      // Maximum distance the element can move within its container
      const maxTranslate = Math.max(0, containerHeight - elementHeight);

      let targetY;

      if (sticky) {
        // Sticky mode: element follows the top of the viewport within the container
        // When container top is above viewport (negative), offset element to stay at viewport top
        if (containerTop < 0) {
          targetY = Math.abs(containerTop);
        } else {
          // Container top is in/below viewport, element stays at container top
          targetY = 0;
        }
        // Clamp to maxTranslate to prevent element from going beyond container bottom
        targetY = Math.min(targetY, maxTranslate);
      } else {
        // Parallax mode: smooth continuous movement based on container position
        const startTarget = viewportHeight * VIEWPORT_START_POSITION;

        // Calculate how much the container has scrolled relative to the start position
        const scrollDistance = Math.max(0, startTarget - containerTop);

        // Apply speed factor to the scroll distance
        targetY = scrollDistance * speed;

        // Apply top buffer to prevent overlap with topbar
        // Calculate where element would be in viewport
        const elementViewportTop = containerTop + targetY;
        if (elementViewportTop < DESKTOP_TOP_BUFFER) {
          // Adjust targetY to keep element at minimum buffer distance
          targetY = Math.max(0, DESKTOP_TOP_BUFFER - containerTop);
        }

        // Clamp to container bounds
        targetY = Math.max(0, Math.min(targetY, maxTranslate));
      }

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
  }, [api, speed, sticky]);

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
