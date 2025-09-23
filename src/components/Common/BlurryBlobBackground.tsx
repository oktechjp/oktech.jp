import type { SpringConfig } from "@react-spring/web";

import BlobSlideshow from "@/components/Common/BlobSlideshow";
import { BLOBS } from "@/utils/blobs";

import Container from "./Container";
import Parallax from "./Parallax";

// Consolidated blob configurations - all using lazy parallax
const blobConfigs = {
  red: {
    className: "bg-error-content",
    blobs: [BLOBS[2], BLOBS[7], BLOBS[1], BLOBS[5], BLOBS[3]],
    startTimeOffset: 500,
    parallaxSpeed: 1.8, // Slightly faster for depth
    blobSpring: {
      mass: 8,
      tension: 15,
      friction: 25,
    },
    parallaxSpring: {
      mass: 14, // Even lazier
      tension: 5, // Very soft response
      friction: 20, // High damping
    },
  },
  green: {
    className: "bg-success-content",
    blobs: [BLOBS[4], BLOBS[0], BLOBS[6], BLOBS[2], BLOBS[9]],
    startTimeOffset: 1000,
    parallaxSpeed: 1.5, // Same as original blue
    blobSpring: {
      mass: 5,
      tension: 20,
      friction: 20,
    },
    parallaxSpring: {
      mass: 12, // Same as original blue
      tension: 6,
      friction: 18,
    },
  },
  blue: {
    className: "bg-info-content",
    blobs: [BLOBS[8], BLOBS[3], BLOBS[5], BLOBS[9], BLOBS[0]],
    startTimeOffset: 1500,
    parallaxSpeed: 1.2, // Slightly slower for depth
    blobSpring: {
      mass: 3,
      tension: 25,
      friction: 15,
    },
    parallaxSpring: {
      mass: 13, // Slightly heavier
      tension: 5.5, // Slightly lower tension
      friction: 19, // Slightly more friction
    },
  },
};

export default function BlurryBlobBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      <Container wide>
        <div className="grid h-[100vh] max-h-[70em] w-full grid-cols-12 items-center">
          <div className="col-span-5">
            <Parallax
              maxOffset="infinity"
              speed={blobConfigs.red.parallaxSpeed}
              springConfig={blobConfigs.red.parallaxSpring}
            >
              <div className="-mx-20 aspect-square opacity-35 mix-blend-screen blur-2xl">
                <BlobSlideshow
                  className={blobConfigs.red.className}
                  startTimeOffset={blobConfigs.red.startTimeOffset}
                  blobs={blobConfigs.red.blobs}
                  springConfig={blobConfigs.red.blobSpring}
                  containerClassName="w-full h-full"
                  data={["", "", "", "", ""]}
                  renderer={() => <div className="h-full w-full" />}
                />
              </div>
            </Parallax>
          </div>
          <div className="col-span-2">
            <Parallax
              maxOffset="infinity"
              speed={blobConfigs.green.parallaxSpeed}
              springConfig={blobConfigs.green.parallaxSpring}
            >
              <div className="-mx-10 mt-90 aspect-square pt-20 opacity-35 mix-blend-screen blur-2xl">
                <BlobSlideshow
                  className={blobConfigs.green.className}
                  startTimeOffset={blobConfigs.green.startTimeOffset}
                  blobs={blobConfigs.green.blobs}
                  springConfig={blobConfigs.green.blobSpring}
                  containerClassName="w-full h-full"
                  data={["", "", "", "", ""]}
                  renderer={() => <div className="h-full w-full" />}
                />
              </div>
            </Parallax>
          </div>
          <div className="col-span-5">
            <Parallax
              maxOffset="infinity"
              speed={blobConfigs.blue.parallaxSpeed}
              springConfig={blobConfigs.blue.parallaxSpring}
            >
              <div className="-mx-10 aspect-square opacity-35 mix-blend-screen blur-2xl">
                <BlobSlideshow
                  className={blobConfigs.blue.className}
                  startTimeOffset={blobConfigs.blue.startTimeOffset}
                  blobs={blobConfigs.blue.blobs}
                  springConfig={blobConfigs.blue.blobSpring}
                  containerClassName="w-full h-full"
                  data={["", "", "", "", ""]}
                  renderer={() => <div className="h-full w-full" />}
                />
              </div>
            </Parallax>
          </div>
        </div>
      </Container>
    </div>
  );
}
