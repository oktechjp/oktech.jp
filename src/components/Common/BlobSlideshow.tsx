import "@/styles/animations.css";

import React, { useCallback, useEffect, useState } from "react";

import type { SpringConfig } from "@react-spring/web";

import BlobMask from "@/components/Common/BlobMask";
import { BLOBS } from "@/utils/blobs";

const PRELOADED_IMAGE_SOURCES = new Set<string>();
const PRELOADING_IMAGE_SOURCES = new Set<string>();

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
  activeRange?: { start: number; end: number }; // control which images are active
  controlledIndex?: number; // external control of current index
  onIndexChange?: (index: number) => void; // callback when index changes
  noPreload?: boolean; // disable sequential preloading
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
  activeRange,
  controlledIndex,
  onIndexChange,
  noPreload = false,
}: BlobSlideshowProps<T>) {
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState(0);
  const [renderedImages, setRenderedImages] = useState<Set<number>>(new Set([0, 1]));
  const preloadedSourcesRef = React.useRef<Set<string>>(new Set());

  // Determine which mode we're in
  const items = data || images || [];
  const isDataMode = !!data && !!renderer;
  const isControlled = controlledIndex !== undefined;

  // Use activeRange to determine cycling boundaries, but work with full items array
  const rangeStart = activeRange?.start ?? 0;
  const rangeEnd = activeRange?.end ?? items.length - 1;
  const rangeLength = rangeEnd - rangeStart + 1;

  // Calculate current index - always global
  const currentIndex = isControlled
    ? Math.min(controlledIndex + rangeStart, items.length - 1)
    : currentGlobalIndex;

  // Calculate the blob index based on global position
  const currentBlobIndex = currentIndex % blobs.length;

  // Centralized transition handler - works with global indices
  const handleTransition = useCallback(
    (newGlobalIndex: number) => {
      setCurrentGlobalIndex(newGlobalIndex);
      if (onIndexChange && activeRange) {
        // Report the index relative to the range
        onIndexChange(newGlobalIndex - rangeStart);
      } else if (onIndexChange) {
        onIndexChange(newGlobalIndex);
      }
    },
    [onIndexChange, activeRange, rangeStart],
  );

  // Handle range changes - smoothly transition to the new range's first image
  useEffect(() => {
    if (!activeRange || items.length === 0) return;

    // Preload images around the new range start
    setRenderedImages((prev) => {
      const newSet = new Set(prev);
      for (let i = rangeStart; i <= Math.min(rangeStart + 2, rangeEnd); i++) {
        newSet.add(i);
      }
      return newSet;
    });

    // Smoothly transition to the first image of the new range
    const timer = setTimeout(() => {
      handleTransition(rangeStart);
    }, 50); // Small delay to ensure images are in DOM

    return () => clearTimeout(timer);
  }, [activeRange?.start, activeRange?.end, rangeStart, rangeEnd, handleTransition]);

  // Update global index when controlled index changes
  useEffect(() => {
    if (isControlled && controlledIndex !== undefined) {
      const globalIndex = activeRange ? rangeStart + controlledIndex : controlledIndex;
      setCurrentGlobalIndex(globalIndex);
    }
  }, [controlledIndex, isControlled, activeRange, rangeStart]);

  // Progressively include images in the DOM as we advance through slides
  useEffect(() => {
    if (!isDataMode && items.length > 0) {
      setRenderedImages((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentIndex);

        // Add next images within range boundaries
        if (activeRange) {
          const next1 = currentIndex + 1 <= rangeEnd ? currentIndex + 1 : rangeStart;
          const next2 = next1 + 1 <= rangeEnd ? next1 + 1 : rangeStart;
          newSet.add(next1);
          newSet.add(next2);
        } else {
          newSet.add((currentIndex + 1) % items.length);
          newSet.add((currentIndex + 2) % items.length);
        }
        return newSet;
      });
    }
  }, [currentIndex, items.length, isDataMode, activeRange, rangeStart, rangeEnd]);

  // Synchronize slide and blob transitions
  useEffect(() => {
    if (items.length === 0 || isControlled) return;
    if (activeRange && rangeLength <= 1) return;

    let intervalTimer: NodeJS.Timeout;

    // Delay the start of transitions if startTimeOffset is provided
    const startTimer = setTimeout(() => {
      intervalTimer = setInterval(() => {
        setCurrentGlobalIndex((prev) => {
          let nextIndex;
          if (activeRange) {
            // Cycle within range
            nextIndex = prev + 1 <= rangeEnd ? prev + 1 : rangeStart;
          } else {
            // Cycle through all items
            nextIndex = (prev + 1) % items.length;
          }
          return nextIndex;
        });
      }, slideDelay);
    }, startTimeOffset);

    return () => {
      clearTimeout(startTimer);
      if (intervalTimer) clearInterval(intervalTimer);
    };
  }, [
    items.length,
    slideDelay,
    startTimeOffset,
    isControlled,
    activeRange,
    rangeStart,
    rangeEnd,
    rangeLength,
  ]);

  // Preload all images sequentially without blocking high-priority requests
  useEffect(() => {
    if (noPreload) return;
    if (isDataMode || !images || images.length === 0) return;
    if (typeof window === "undefined") return;

    const queue = images
      .map((image) => {
        if (typeof image === "string") {
          return {
            src: image,
            srcSet: undefined,
            sizes: undefined,
            cacheKey: `${image}|`,
          };
        }

        const imageData = image as ImageData;
        const src = imageData.src;
        if (!src) return null;

        const srcSet = imageData.srcSet;
        const sizes = imageData.sizes;
        return {
          src,
          srcSet,
          sizes,
          cacheKey: `${src}|${srcSet ?? ""}`,
        };
      })
      .filter(
        (
          entry,
        ): entry is {
          src: string;
          srcSet: string | undefined;
          sizes: string | undefined;
          cacheKey: string;
        } => !!entry,
      );

    if (queue.length === 0) return;

    let pointer = 0;
    let isCancelled = false;
    const idleHandles: number[] = [];
    const timeoutHandles: number[] = [];

    const runNext = () => {
      if (isCancelled) return;

      while (pointer < queue.length) {
        const entry = queue[pointer++];
        if (!entry) continue;
        const { src, srcSet, sizes, cacheKey } = entry;

        if (!src) {
          continue;
        }

        if (
          preloadedSourcesRef.current.has(cacheKey) ||
          PRELOADED_IMAGE_SOURCES.has(cacheKey) ||
          PRELOADING_IMAGE_SOURCES.has(cacheKey)
        ) {
          continue;
        }

        PRELOADING_IMAGE_SOURCES.add(cacheKey);

        const imageElement = new Image() as HTMLImageElement & {
          fetchPriority?: "auto" | "high" | "low";
        };
        imageElement.decoding = "async";

        if ("fetchPriority" in imageElement) {
          imageElement.fetchPriority = "low";
        }

        if (srcSet) {
          imageElement.srcset = srcSet;
        }
        if (sizes) {
          imageElement.sizes = sizes;
        }

        const handleComplete = (didLoad: boolean) => {
          imageElement.onload = null;
          imageElement.onerror = null;
          PRELOADING_IMAGE_SOURCES.delete(cacheKey);

          if (didLoad) {
            preloadedSourcesRef.current.add(cacheKey);
            PRELOADED_IMAGE_SOURCES.add(cacheKey);
          }

          scheduleNext();
        };

        imageElement.onload = () => handleComplete(true);
        imageElement.onerror = () => handleComplete(false);
        imageElement.src = src;

        return;
      }
    };

    const scheduleNext = () => {
      if (isCancelled || pointer >= queue.length) return;

      const win = window as Window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
        cancelIdleCallback?: (handle: number) => void;
      };

      if (typeof win.requestIdleCallback === "function") {
        const handle = win.requestIdleCallback(() => {
          if (!isCancelled) {
            runNext();
          }
        });
        idleHandles.push(handle);
      } else {
        const handle = window.setTimeout(() => {
          if (!isCancelled) {
            runNext();
          }
        }, 80);
        timeoutHandles.push(handle);
      }
    };

    scheduleNext();

    return () => {
      isCancelled = true;
      const win = window as Window & {
        cancelIdleCallback?: (handle: number) => void;
      };
      idleHandles.forEach((handle) => {
        win.cancelIdleCallback?.(handle);
      });
      timeoutHandles.forEach((handle) => {
        window.clearTimeout(handle);
      });
    };
  }, [images, isDataMode, noPreload]);

  if (items.length === 0) return null;

  // Create unique ID for this instance
  const uniqueId = React.useId();

  return (
    <div className={`relative z-10 h-full w-full ${containerClassName || "aspect-[4/3]"}`}>
      <div className="absolute inset-0 -mx-20 -my-10 md:-mx-16 md:-my-16 lg:-mx-12 lg:-my-12">
        <BlobMask
          id={uniqueId}
          blobPath={blobs[(currentBlobIndex + blobOffset) % blobs.length]}
          className={`absolute inset-0 ${className}`}
          springConfig={springConfig}
        >
          {isDataMode
            ? // Render custom data with renderer
              items.map((item, index) => {
                // Only render items within the active range if specified
                if (activeRange && (index < rangeStart || index > rangeEnd)) {
                  return null;
                }
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity ${
                      index === currentIndex ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ transitionDuration: `${fadeSpeed}ms` }}
                  >
                    {renderer!(item as T, index)}
                  </div>
                );
              })
            : // Render images
              items.map((image, index) => {
                const isString = typeof image === "string";
                const src = isString ? image : (image as ImageData).src;
                const shouldRender = renderedImages.has(index);

                if (!shouldRender) return null;

                return (
                  <div
                    key={`img-${index}`}
                    className={`bg-base-300 absolute inset-0 transition-opacity ${
                      index === currentIndex ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ transitionDuration: `${fadeSpeed}ms` }}
                  >
                    <img
                      src={src}
                      srcSet={!isString ? (image as ImageData).srcSet : undefined}
                      sizes={!isString ? (image as ImageData).sizes || "100vw" : undefined}
                      alt=""
                      className="bg-base-content/20 absolute inset-0 h-full w-full object-cover"
                      loading={index <= rangeStart + 1 ? "eager" : "lazy"}
                      fetchPriority={
                        index === rangeStart ? "high" : index === rangeStart + 1 ? "low" : "auto"
                      }
                    />
                  </div>
                );
              })}
        </BlobMask>
      </div>
    </div>
  );
}
