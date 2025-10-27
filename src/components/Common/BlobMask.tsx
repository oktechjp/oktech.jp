import React from "react";

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

export default function BlobMask(props: Props) {
  const springs = useSpring({
    d: props.blobPath,
    config: props.springConfig || { mass: 0.8, tension: 180, friction: 9 },
  });

  const maskId = `blob-mask-${props.id}`;

  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <clipPath id={maskId} clipPathUnits={"objectBoundingBox"}>
            <animated.path d={springs.d} transform={`translate(0.05 0.05) scale(0.009)`} />
          </clipPath>
        </defs>
      </svg>

      <div
        className={clsx(props.className, "-m-8")}
        style={{
          clipPath: `url(#${maskId})`,
          WebkitClipPath: `url(#${maskId})`,
          // force hardware acceleration
          WebkitTransform: "translateZ(0)",
          transform: "translateZ(0)",
        }}
      >
        {props.children}
      </div>
    </>
  );
}
