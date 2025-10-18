import { type RefCallback, useCallback, useEffect, useRef, useState } from "react";

interface Options {
  batchSize?: number;
  resetKey?: unknown;
  rootMargin?: string;
  threshold?: number | number[];
}

interface IncrementalVisibilityResult {
  visibleCount: number;
  registerTrigger: RefCallback<HTMLDivElement>;
  hasMore: boolean;
}

export function useIncrementalVisibility(
  totalItems: number,
  options?: Options,
): IncrementalVisibilityResult {
  const { batchSize = 3, resetKey, rootMargin = "0px 0px 0px 0px", threshold = 0 } = options ?? {};
  const [visibleCount, setVisibleCount] = useState(() => Math.min(batchSize, totalItems));
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(batchSize, totalItems));
  }, [totalItems, batchSize, resetKey]);

  useEffect(() => {
    if (visibleCount >= totalItems) {
      observerRef.current?.disconnect();
      observerRef.current = null;
    }
  }, [visibleCount, totalItems]);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
    },
    [],
  );

  const registerTrigger = useCallback<RefCallback<HTMLDivElement>>(
    (node) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node) {
        return;
      }

      if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
        setVisibleCount(totalItems);
        return;
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCount((count) => {
                const nextCount = Math.min(count + batchSize, totalItems);
                if (nextCount === count) {
                  return count;
                }
                return nextCount;
              });
            }
          });
        },
        { rootMargin, threshold },
      );

      observerRef.current.observe(node);
    },
    [batchSize, rootMargin, threshold, totalItems],
  );

  return {
    visibleCount,
    registerTrigger,
    hasMore: visibleCount < totalItems,
  };
}
