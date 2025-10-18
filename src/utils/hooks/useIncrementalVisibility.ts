import { type RefObject, useEffect, useRef, useState } from "react";

interface Options {
  batchSize?: number;
  resetKey?: unknown;
}

interface IncrementalVisibilityResult {
  visibleCount: number;
  sentinelRef: RefObject<HTMLDivElement | null>;
  hasMore: boolean;
}

export function useIncrementalVisibility(
  totalItems: number,
  options?: Options,
): IncrementalVisibilityResult {
  const { batchSize = 3, resetKey } = options ?? {};
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(batchSize, totalItems),
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(batchSize, totalItems));
  }, [totalItems, batchSize, resetKey]);

  useEffect(() => {
    if (visibleCount >= totalItems) {
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisibleCount(totalItems);
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + batchSize, totalItems));
        }
      });
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [visibleCount, totalItems, batchSize]);

  return {
    visibleCount,
    sentinelRef,
    hasMore: visibleCount < totalItems,
  };
}

export default useIncrementalVisibility;
