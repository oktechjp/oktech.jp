import type { CSSProperties } from "react";

interface MarqueeBackgroundProps {
  text: string;
  className?: string;
  lineCount?: number;
  baseDurationMs?: number;
}

export default function MarqueeBackground({
  text,
  className = "",
  lineCount = 3,
  baseDurationMs = 92000 * 3,
}: MarqueeBackgroundProps) {
  const lines = Array.from({ length: lineCount }).map((_, index) => {
    const duration = baseDurationMs * (1 - index * 0.15);
    return {
      id: `marquee-line-${index}`,
      duration,
      reverse: index % 2 === 1,
    } as const;
  });

  return (
    <div className={`text-base-200/60 pointer-events-none absolute inset-0 -z-10 ${className}`}>
      <div className="absolute inset-0 flex flex-col justify-center text-[min(9vw,4.5rem)] leading-none font-bold tracking-tight">
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
    <div className="flex overflow-x-hidden py-8">
      <div
        className={`connect-marquee-track flex w-max items-center gap-10 ${reverse ? "reverse" : ""}`}
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
