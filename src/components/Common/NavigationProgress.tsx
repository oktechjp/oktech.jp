import { useEffect, useRef } from "react";

import { animated, useSpring } from "@react-spring/web";

export default function NavigationProgress() {
  const progressRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const delayTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const fadeOutTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isActiveRef = useRef(false);

  const [{ progress, opacity }, api] = useSpring(() => ({
    progress: 0,
    opacity: 0,
    config: {
      tension: 200,
      friction: 30,
      clamp: false,
    },
  }));

  useEffect(() => {
    const trickleProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = progressRef.current;

      // Logarithmic growth that slows down over time
      // Inspired by NProgress algorithm
      let increment: number;

      if (currentProgress < 20) {
        // Start fast (0-20%)
        increment = Math.random() * 10 + 5;
      } else if (currentProgress < 50) {
        // Slow down (20-50%)
        increment = Math.random() * 4 + 1;
      } else if (currentProgress < 80) {
        // Even slower (50-80%)
        increment = Math.random() * 2;
      } else if (currentProgress < 94) {
        // Crawl (80-94%)
        increment = 0.5;
      } else {
        // Stop at 94% and wait for completion
        increment = 0;
      }

      // Apply time-based decay - slower progress over time
      const timeDecay = Math.max(0.1, 1 - elapsed / 10000);
      increment *= timeDecay;

      const newProgress = Math.min(currentProgress + increment, 94);
      progressRef.current = newProgress;

      api.start({
        progress: newProgress,
        opacity: 1,
      });
    };

    const cleanupTimers = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = undefined;
      }
      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current);
        fadeOutTimerRef.current = undefined;
      }
    };

    const startProgress = () => {
      // Clean up any existing timers
      cleanupTimers();

      // Mark as active
      isActiveRef.current = true;

      // Reset progress
      progressRef.current = 0;
      startTimeRef.current = Date.now();

      // Wait 200ms before showing the progress bar
      // This avoids flashing for fast navigations
      delayTimerRef.current = setTimeout(() => {
        // Only show if still active (navigation hasn't completed)
        if (!isActiveRef.current) return;

        // Initial burst to show immediate feedback
        api.start({
          progress: 10,
          opacity: 1,
          config: {
            tension: 400,
            friction: 30,
          },
        });
        progressRef.current = 10;

        // Start trickling
        intervalRef.current = setInterval(trickleProgress, 300);
      }, 200);
    };

    const completeProgress = () => {
      // Mark as inactive
      isActiveRef.current = false;

      // Clear all timers
      cleanupTimers();

      // If progress never started (fast navigation), just reset
      if (progressRef.current === 0) {
        api.set({ progress: 0, opacity: 0 });
        return;
      }

      // Quickly go to 100%
      api.start({
        progress: 100,
        opacity: 1,
        config: {
          tension: 400,
          friction: 25,
        },
        onRest: () => {
          // Fade out after completion
          fadeOutTimerRef.current = setTimeout(() => {
            api.start({
              opacity: 0,
              config: {
                duration: 200,
              },
              onRest: () => {
                // Reset progress after fade out
                api.set({ progress: 0 });
                progressRef.current = 0;
              },
            });
          }, 150);
        },
      });
    };

    const handlePreparation = () => {
      startProgress();
    };

    const handleSwap = () => {
      completeProgress();
    };

    const handleLoad = () => {
      completeProgress();
    };

    document.addEventListener("astro:before-preparation", handlePreparation);
    document.addEventListener("astro:after-swap", handleSwap);
    document.addEventListener("astro:page-load", handleLoad);

    return () => {
      cleanupTimers();
      document.removeEventListener("astro:before-preparation", handlePreparation);
      document.removeEventListener("astro:after-swap", handleSwap);
      document.removeEventListener("astro:page-load", handleLoad);
    };
  }, [api]);

  return (
    <animated.div
      className="pointer-events-none fixed top-0 right-0 left-0 z-[9999] h-1"
      style={{ opacity }}
      role="progressbar"
      aria-label="Page navigation progress"
      aria-valuenow={Math.round(progressRef.current)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <animated.div
        className="bg-primary shadow-primary/50 h-full shadow-sm"
        style={{
          width: progress.to((p) => `${p}%`),
          transformOrigin: "left",
        }}
      />
    </animated.div>
  );
}
