import { useMemo } from "react";

import { animated, useSprings } from "@react-spring/web";

const COLORS = ["#ffffff", "#ff6b6b", "#4ecdc4", "#ffe66d", "#95e1d3", "#f38181", "#aa96da"];

const FLAKE_COUNT = 50;

interface Flake {
  x: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  wobbleSpeed: number;
  wobbleAmount: number;
}

function generateFlakes(): Flake[] {
  return Array.from({ length: FLAKE_COUNT }, () => ({
    x: Math.random() * 100,
    size: Math.random() * 8 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: Math.random() * 8000 + 6000,
    delay: Math.random() * 5000,
    wobbleSpeed: Math.random() * 2 + 1,
    wobbleAmount: Math.random() * 30 + 20,
  }));
}

export default function Snowfall() {
  const flakes = useMemo(generateFlakes, []);

  const [springs] = useSprings(FLAKE_COUNT, (i) => ({
    from: { progress: 0 },
    to: async (next) => {
      while (true) {
        await next({
          progress: 1,
          config: { duration: flakes[i].duration },
        });
        await next({ progress: 0, immediate: true });
      }
    },
    delay: flakes[i].delay,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {springs.map((spring, i) => (
        <animated.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${flakes[i].x}%`,
            width: flakes[i].size,
            height: flakes[i].size,
            backgroundColor: flakes[i].color,
            boxShadow: `0 0 10px ${flakes[i].color}`,
            opacity: 0.85,
            transform: spring.progress.to((p) => {
              const y = -20 + p * (window.innerHeight + 40);
              const wobble =
                Math.sin(p * Math.PI * flakes[i].wobbleSpeed * 4) * flakes[i].wobbleAmount;
              const rotate = p * 360 * flakes[i].wobbleSpeed;
              return `translate3d(${wobble}px, ${y}px, 0) rotate(${rotate}deg)`;
            }),
          }}
        />
      ))}
    </div>
  );
}
