import { clsx } from "clsx";

import { themeColorsHex } from "@/utils/og/theme-colors";

interface OKTechLogoProps {
  className?: string;
  active?: boolean;
  noStyle?: boolean;
}

// TODO use colors picked from wintle's image
const colors = {
  RED: "#fd4d69",
  GREEN: "#49d773",
  BLUE: "#459bc9",
  BASE_LIGHT: themeColorsHex.light["baseContent"],
  BASE_DARK: themeColorsHex.dark["baseContent"],
};

type OKTechLogoItemProps = OKTechLogoProps & {
  style?: React.CSSProperties;
};

const transitionClass = "transition-colors duration-[1000ms] ease-in-out";
const hoverClass = "group-hover:[fill:var(--hover-color)]";

export function OKTechLogoIcon({ noStyle, className, style, active }: OKTechLogoItemProps) {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        aria-label="OKTech logo icon"
        role="img"
        className={clsx(
          "transition-transform duration-300 ease-in-out group-hover:rotate-[-10deg]",
          className,
        )}
        style={{ transform: active ? "none" : "rotate(7deg)", ...style }}
        fill="currentColor"
      >
        <defs>
          {!noStyle && (
            <style>
              {`
              .base-responsive { fill: ${colors.BASE_LIGHT}; }
              
              @media (prefers-color-scheme: dark) {
                .base-responsive { fill: ${colors.BASE_DARK}; }
                }
                @media (prefers-color-scheme: light) {
                  .base-responsive { fill: ${colors.BASE_LIGHT}; }
                  }
                  
                  [data-theme="light"] .base-responsive { fill: currentColor !important; }
                  [data-theme="dark"] .base-responsive { fill: currentColor !important; }
                  `}
            </style>
          )}
        </defs>
        <path
          className="base-responsive"
          d="M39.85,17.02l9.7,67.48c-16.71-.19-31.25-12.53-33.7-29.58-2.45-17.06,8.03-33,24-37.89Z"
        />
        <g>
          <path
            fill={active ? colors.RED : undefined}
            style={!active ? ({ "--hover-color": colors.RED } as React.CSSProperties) : undefined}
            className={clsx(transitionClass, !active && hoverClass)}
            d="M82.85,60.57c1.56-4.84,2.08-10.1,1.31-15.48-.76-5.29-2.69-10.13-5.47-14.29l-18.13,18.26,22.3,11.51Z"
          />
          <path
            fill={active ? colors.GREEN : undefined}
            style={!active ? ({ "--hover-color": colors.GREEN } as React.CSSProperties) : undefined}
            className={clsx(transitionClass, !active && hoverClass)}
            d="M56.68,57.87l3.6,25.07c7.68-2.39,14.08-7.34,18.37-13.73l-21.97-11.33Z"
          />
          <path
            fill={active ? colors.BLUE : undefined}
            style={!active ? ({ "--hover-color": colors.BLUE } as React.CSSProperties) : undefined}
            className={clsx(transitionClass, !active && hoverClass)}
            d="M72.26,23.65c-5.94-5.02-13.55-8.02-21.67-8.15l3.77,26.19,17.91-18.03Z"
          />
        </g>
      </svg>
    </>
  );
}

export function OKTechLogoText({ className, style }: OKTechLogoItemProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 274.88 70.53"
      aria-label="OKTech"
      role="img"
      className={clsx(className)}
      fill="currentColor"
      style={style}
    >
      <path d="M53.16,19.26c-2.26-2.19-4.9-3.9-7.92-5.1-3.02-1.21-6.35-1.81-9.97-1.81s-6.96.6-10.01,1.81c-3.04,1.21-5.69,2.91-7.92,5.1-2.24,2.19-3.97,4.77-5.2,7.72-1.23,2.96-1.85,6.22-1.85,9.8s.62,6.79,1.85,9.77c1.23,2.98,2.96,5.56,5.2,7.76,2.24,2.19,4.88,3.89,7.92,5.1,3.04,1.21,6.38,1.81,10.01,1.81s6.95-.6,9.97-1.81c3.02-1.21,5.66-2.91,7.92-5.1,2.26-2.19,4-4.78,5.2-7.76,1.21-2.98,1.81-6.26,1.81-9.84s-.6-6.78-1.81-9.74c-1.21-2.96-2.94-5.53-5.2-7.72ZM45.78,41.62c-.56,1.48-1.35,2.77-2.38,3.86-1.03,1.1-2.24,1.94-3.63,2.52-1.39.58-2.89.87-4.5.87s-3.18-.29-4.57-.87c-1.39-.58-2.6-1.42-3.63-2.52-1.03-1.1-1.82-2.38-2.38-3.86-.56-1.48-.84-3.09-.84-4.83s.28-3.41.84-4.87c.56-1.45,1.35-2.73,2.38-3.83,1.03-1.1,2.24-1.94,3.63-2.52,1.39-.58,2.91-.87,4.57-.87s3.11.29,4.5.87c1.39.58,2.6,1.42,3.63,2.52,1.03,1.1,1.82,2.38,2.38,3.86s.84,3.09.84,4.83-.28,3.36-.84,4.83Z" />
      <polygon points="107.79 13.55 92.48 13.55 77.78 28.51 77.78 13.55 64.48 13.55 64.48 60.56 77.78 60.56 77.78 43.21 79.62 41.39 94.23 60.56 109.47 60.56 87.91 33.19 107.79 13.55" />
      <polygon points="153.06 13.55 110.82 13.55 110.82 25.03 125.05 25.03 125.05 60.56 138.35 60.56 138.35 25.03 153.06 25.03 153.06 13.55" />
      <path d="M181.3,29.19c-1.54-1.66-3.38-2.93-5.51-3.83-2.13-.9-4.49-1.34-7.08-1.34s-5.07.46-7.29,1.38c-2.22.92-4.13,2.22-5.74,3.9-1.61,1.68-2.87,3.66-3.76,5.94-.9,2.28-1.34,4.77-1.34,7.46,0,3.58.81,6.77,2.42,9.57,1.61,2.8,3.9,4.99,6.85,6.58,2.95,1.59,6.47,2.38,10.54,2.38,1.61,0,3.2-.17,4.77-.5,1.57-.34,3.14-.87,4.73-1.61,1.59-.74,3.17-1.73,4.73-2.99l-5.78-8.13c-1.21.9-2.34,1.52-3.39,1.88-1.05.36-2.27.54-3.66.54-2.1,0-3.88-.36-5.34-1.07-1.46-.72-2.55-1.72-3.29-3.02-.19-.34-.36-.7-.5-1.07h23.23l.07-2.82c.09-2.69-.28-5.15-1.11-7.39-.83-2.24-2.01-4.19-3.56-5.84ZM165.18,35.07c1.01-.6,2.27-.91,3.79-.91,1.07,0,2.04.2,2.89.6.85.4,1.53.97,2.05,1.71.5.72.76,1.56.77,2.52h-12.29c.12-.47.27-.93.47-1.34.54-1.12,1.31-1.98,2.32-2.58Z" />
      <path d="M204.86,35.71c1.12-.67,2.42-1.01,3.9-1.01,1.12,0,2.14.15,3.06.44.92.29,1.76.7,2.52,1.21.76.52,1.39,1.09,1.88,1.71l6.78-8.06c-1.61-1.92-3.77-3.4-6.48-4.43-2.71-1.03-5.67-1.54-8.9-1.54-3.54,0-6.71.81-9.5,2.42-2.8,1.61-5,3.82-6.62,6.62-1.61,2.8-2.42,5.99-2.42,9.57s.81,6.77,2.42,9.57c1.61,2.8,3.82,5,6.62,6.62,2.8,1.61,5.96,2.42,9.5,2.42,3.18,0,6.12-.52,8.83-1.54,2.71-1.03,4.89-2.48,6.55-4.37l-6.78-8.13c-.54.67-1.18,1.25-1.91,1.75-.74.49-1.57.87-2.48,1.14-.92.27-1.94.4-3.06.4-1.48,0-2.79-.36-3.93-1.07s-2-1.66-2.59-2.82c-.58-1.16-.87-2.51-.87-4.03s.3-2.88.91-4.06c.6-1.19,1.47-2.12,2.59-2.79Z" />
      <path d="M260.84,30.57c-.96-2.17-2.37-3.8-4.23-4.9-1.86-1.1-4.13-1.65-6.82-1.65-1.97,0-3.85.38-5.64,1.14-1.79.76-3.34,1.8-4.63,3.12-.02.02-.04.05-.07.08V10.86h-12.22v49.7h12.56v-21.36c0-.72.12-1.37.37-1.95.25-.58.61-1.11,1.11-1.58.49-.47,1.06-.82,1.71-1.04.65-.22,1.35-.34,2.12-.34.98-.04,1.83.13,2.55.54.72.4,1.25,1,1.61,1.78.36.78.54,1.76.54,2.92v21.02h12.49v-22.03c0-3.13-.48-5.79-1.44-7.96Z" />
    </svg>
  );
}
