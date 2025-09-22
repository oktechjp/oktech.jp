import React, { useEffect, useRef, useState } from "react";

import { animated, useSpring } from "@react-spring/web";
import type { SpringConfig } from "@react-spring/web";
import clsx from "clsx";

interface Props {
  id: string;
  blobPath: string; // target path "d" (same command structure for best results)
  className?: string;
  children?: React.ReactNode;
  springConfig?: SpringConfig;
}

export default function BlobMask({ id, blobPath, className = "", children, springConfig }: Props) {
  const clipPathUnits = "objectBoundingBox";
  const offset = { x: 0.05, y: 0.05 };
  const maskId = `blob-mask-${id}`;
  const scale = 1 / 110;
  const transform = `translate(${offset.x} ${offset.y}) scale(${scale})`;

  const [currentPath, setCurrentPath] = useState(blobPath);

  const springs = useSpring({
    from: { d: currentPath },
    to: { d: blobPath },
    config: springConfig || { mass: 0.8, tension: 180, friction: 9 },
    onChange: ({ value }) => {
      if (value.d !== currentPath) {
        setCurrentPath(value.d as string);
      }
    },
  });

  useEffect(() => {
    setCurrentPath(blobPath);
  }, [blobPath]);

  return (
    <>
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={maskId} clipPathUnits={clipPathUnits}>
            {/* animated path (scaled into 0–1 space) */}
            <animated.path d={springs.d} transform={transform} />
          </clipPath>
        </defs>
      </svg>

      <div
        className={clsx(className, "-m-8")}
        style={{
          clipPath: `url(#${maskId})`,
          WebkitClipPath: `url(#${maskId})`,
          WebkitTransform: "translateZ(0)",
          transform: "translateZ(0)",
        }}
      >
        {children}
      </div>
    </>
  );
}
