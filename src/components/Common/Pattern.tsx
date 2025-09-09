import clsx from "clsx";

export const patterns = {
  plusses: {
    svg: `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
</svg>`,
    maskSize: "30px 30px",
  },

  squares: {
    svg: `<svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="4" height="4" fill="currentColor" />
  <rect x="4" y="4" width="4" height="4" fill="currentColor" />
</svg>`,
    maskSize: "8px 8px",
  },
  zigzag: {
    svg: `<svg width="40" height="20" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 10L10 0L20 10L30 0L40 10" stroke="currentColor" stroke-width="2" fill="none" />
</svg>`,
    maskSize: "40px 20px",
  },

  diagonalStripes: {
    svg: `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
    <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" stroke-width="2" />
    <line x1="15" y1="5" x2="5" y2="15" stroke="currentColor" stroke-width="2" />
    <line x1="5" y1="-5" x2="-5" y2="5" stroke="currentColor" stroke-width="2" />
    </svg>`,
    maskSize: "10px 10px",
  },
  verticalStripes: {
    svg: `<svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="3" height="8" fill="currentColor" />
    </svg>`,
    maskSize: "8px 8px",
  },
  grid: {
    svg: `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" fill="none" stroke="currentColor" stroke-width="0.5" />
    </svg>`,
    maskSize: "40px 40px",
  },
  dots: {
    svg: `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
  <circle cx="2" cy="2" r="1.5" fill="currentColor" />
  <circle cx="10" cy="10" r="1.5" fill="currentColor" />
  <circle cx="18" cy="18" r="1.5" fill="currentColor" />
  <circle cx="18" cy="2" r="1.5" fill="currentColor" />
  <circle cx="2" cy="18" r="1.5" fill="currentColor" />
</svg>`,
    maskSize: "20px 20px",
  },

  waves: {
    svg: `<svg width="100" height="20" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 10Q25 0 50 10T100 10" stroke="currentColor" stroke-width="10" fill="none" />
</svg>`,
    maskSize: "100px 20px",
  },
  asanoha: {
    svg: `<svg width="69.282" height="40" xmlns="http://www.w3.org/2000/svg">
  <path d="M34.641-20v80m34.64-40L0-20m69.282 80L0 20m69.282 0L0 60m69.282-80L0 20m69.282-40v80M0-20v80M34.64 40l11.547-20m11.547 20l11.547 20M34.641 40h23.094m11.547-20L57.735 40M46.188 20L34.641 40l11.547 20h23.094L80.83 40 69.282 20H46.188zM34.641 40l11.547-20m11.547 20l11.547 20M34.641 40h23.094m11.547-20L57.735 40M46.188 20L34.641 40l11.547 20h23.094L80.83 40 69.282 20H46.188zM34.641 0l11.547-20M57.735 0l11.547 20M34.642 0h23.093m11.547-20L57.735 0M46.188-20L34.641 0l11.547 20h23.094L80.83 0 69.282-20H46.188zM34.641 40L23.094 20M11.547 40L0 60m34.64-20H11.548M0 20l11.547 20m11.547-20l11.547 20-11.547 20H0l-11.547-20L0 20h23.094zM34.641 0L23.094-20M11.547 0L0 20M34.64 0H11.548M0-20L11.547 0m11.547-20L34.641 0 23.094 20H0L-11.547 0 0-20h23.094z" stroke-width="1" stroke="currentColor" fill="none" />
</svg>`,
    maskSize: "138.564px 80px",
  },
};

export type Patterns = keyof typeof patterns;

export default function Pattern({
  type,
  className = "bg-gradient-to-b from-red-200/20 to-red-200/0",
}: {
  type: keyof typeof patterns;
  className?: string;
}) {
  const pattern = patterns[type];
  const patternData = `url("data:image/svg+xml,${encodeURIComponent(pattern.svg)}")`;

  return (
    <div
      className={clsx("absolute inset-0 z-0", className)}
      style={{
        maskImage: patternData,
        maskSize: pattern.maskSize,
        maskRepeat: "repeat",
        WebkitMaskImage: patternData,
        WebkitMaskSize: pattern.maskSize,
        WebkitMaskRepeat: "repeat",
      }}
    />
  );
}
