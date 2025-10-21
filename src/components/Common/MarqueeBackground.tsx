import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { useBreakpoint } from "@/hooks/useBreakpoint";

interface MarqueeBackgroundProps {
  text: string;
  className?: string;
  lineCount?: number;
  mobileLineCount?: number;
  baseDurationMs?: number;
}

export default function MarqueeBackground({
  text,
  className = "",
  lineCount = 3,
  mobileLineCount = 8,
  baseDurationMs = 92000 * 3,
}: MarqueeBackgroundProps) {
  const currentBreakpoint = useBreakpoint();
  const effectiveLineCount = currentBreakpoint === "base" ? mobileLineCount : lineCount;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const lines = useMemo(() => {
    const targetBaseDuration = Math.max(baseDurationMs * 0.7, 120_000);
    const varianceRange = 0.15;

    return Array.from({ length: effectiveLineCount }).map((_, index) => {
      const progress = effectiveLineCount === 1 ? 0 : index / (effectiveLineCount - 1);
      const factor = 1 - varianceRange + progress * (varianceRange * 2);
      const duration = targetBaseDuration * factor;

      return {
        id: `marquee-line-${index}`,
        duration,
        reverse: index % 2 === 1,
      } as const;
    });
  }, [baseDurationMs, effectiveLineCount]);

  return (
    <div
      className={`text-base-200/60 pointer-events-none absolute inset-0 -z-10 ${className}`}
      aria-hidden="true"
    >
      <div
        className={`absolute inset-0 flex flex-col justify-center text-[min(14vw,4.5rem)] leading-none font-bold tracking-tight transition-opacity duration-500 md:text-[min(9vw,4.5rem)] ${isReady ? "opacity-100" : "opacity-0"}`}
      >
        {lines.map((line) => (
          <Line key={line.id} text={text} duration={line.duration} reverse={line.reverse} />
        ))}
      </div>
    </div>
  );
}

function Line({ text, duration, reverse }: { text: string; duration: number; reverse?: boolean }) {
  const wordCount = 10;
  const repetitions = 2;
  const totalWords = wordCount * repetitions;

  return (
    <div className="flex overflow-x-hidden">
      <div
        className={`connect-marquee-track flex w-max items-center gap-12 ${reverse ? "reverse" : ""}`}
        style={{ "--marquee-duration": `${duration}ms` } as CSSProperties}
      >
        {Array.from({ length: totalWords }).map((_, index) => (
          <span key={`word-${index}`} className="mx-2 whitespace-nowrap">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
