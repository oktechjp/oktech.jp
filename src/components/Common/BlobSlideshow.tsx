import "@/styles/animations.css";

import React, { useEffect, useState } from "react";

import type { SpringConfig } from "@react-spring/web";

import BlobMask from "@/components/Common/BlobMask";
import { BLOBS } from "@/utils/blobs";

interface ImageData {
  src: string;
  srcSet?: string;
  sizes?: string;
}

interface BlobSlideshowProps<T = string | ImageData> {
  images?: (string | ImageData)[];
  data?: T[];
  renderer?: (item: T, index: number) => React.ReactNode;
  slideDelay?: number; // milliseconds between slides
  className?: string;
  blobs?: string[];
  containerClassName?: string;
  blobOffset?: number; // optional offset for starting blob index
  startTimeOffset?: number; // optional delay before starting transitions (milliseconds)
  fadeSpeed?: number; // duration of opacity transition in milliseconds
  springConfig?: SpringConfig; // react-spring animation config for blob morphing
}

export default function BlobSlideshow<T = string | ImageData>({
  images,
  data,
  renderer,
  slideDelay = 2000,
  className = "",
  blobs = BLOBS,
  containerClassName = "",
  blobOffset = 0,
  startTimeOffset = 0,
  fadeSpeed = 1000,
  springConfig,
}: BlobSlideshowProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBlob, setCurrentBlob] = useState(0);
  const [renderedImages, setRenderedImages] = useState<Set<number>>(new Set([0, 1]));

  // Determine which mode we're in
  const items = data || images || [];
  const isDataMode = !!data && !!renderer;

  // Progressively include images in the DOM as we advance through slides
  useEffect(() => {
    if (!isDataMode && images && images.length > 0) {
      // Always include current and next two images
      const nextIndex = (currentIndex + 1) % images.length;
      const nextNextIndex = (currentIndex + 2) % images.length;

      setRenderedImages((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentIndex);
        newSet.add(nextIndex);
        newSet.add(nextNextIndex);
        return newSet;
      });
    }
  }, [currentIndex, images, isDataMode]);

  // Synchronize slide and blob transitions
  useEffect(() => {
    if (items.length <= 1) return;

    let intervalTimer: NodeJS.Timeout;

    // Reason: Delay the start of transitions if startTimeOffset is provided
    const startTimer = setTimeout(() => {
      intervalTimer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        // Reason: Loop through same number of blobs as items to maintain 1:1 correspondence
        setCurrentBlob((prev) => (prev + 1) % items.length);
      }, slideDelay);
    }, startTimeOffset);

    return () => {
      clearTimeout(startTimer);
      if (intervalTimer) clearInterval(intervalTimer);
    };
  }, [items.length, slideDelay, startTimeOffset]);

  if (items.length === 0) return null;

  // Create unique ID for this instance
  const uniqueId = React.useId();

  return (
    <div className={`relative z-10 h-full w-full ${containerClassName || "aspect-[4/3]"}`}>
      <div className="absolute inset-0 -mx-20 -my-10 md:-mx-16 md:-my-16 lg:-mx-12 lg:-my-12">
        <BlobMask
          id={uniqueId}
          blobPath={blobs[(currentBlob + blobOffset) % blobs.length]}
          className={`absolute inset-0 ${className}`}
          springConfig={springConfig}
        >
          {isDataMode
            ? // Render custom data with renderer
              data!.map((item, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity ${
                    index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transitionDuration: `${fadeSpeed}ms` }}
                >
                  {renderer!(item, index)}
                </div>
              ))
            : // Render images
              images!.map((image, index) => {
                const isString = typeof image === "string";
                const src = isString ? image : image.src;
                const shouldRender = renderedImages.has(index);

                if (!shouldRender) return null;

                return (
                  <div
                    key={index}
                    className={`bg-base-300 absolute inset-0 transition-opacity ${
                      index === currentIndex ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ transitionDuration: `${fadeSpeed}ms` }}
                  >
                    <img
                      src={src}
                      srcSet={!isString ? image.srcSet : undefined}
                      sizes={!isString ? image.sizes || "100vw" : undefined}
                      alt=""
                      className="bg-base-content/20 absolute inset-0 h-full w-full object-cover"
                      loading={index === 0 || index === 1 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : index === 1 ? "low" : "auto"}
                    />
                  </div>
                );
              })}
        </BlobMask>
      </div>
    </div>
  );
}
