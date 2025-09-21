import { useEffect, useRef, useState } from "react";

export default function NavigationProgress() {
  // Configuration variables for progress behavior
  const INITIAL_DELAY_MS = 200; // Wait before showing progress bar
  const UPDATE_INTERVAL_MS = 500; // How often to update progress (increased for smoother animation)
  const TIME_DECAY_DURATION_MS = 15000; // How long until progress updates slow to minimum
  const MIN_TIME_DECAY = 0.3; // Minimum speed multiplier (30% of original speed)
  const COMPLETION_DELAY_MS = 150; // Delay before fading out after completion
  const FADE_OUT_DURATION_MS = 200; // How long the fade out animation takes

  const progressRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const delayTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const fadeOutTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isActiveRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);

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
      // Decay from 1.0 to MIN_TIME_DECAY over TIME_DECAY_DURATION_MS
      const decayProgress = Math.min(elapsed / TIME_DECAY_DURATION_MS, 1);
      const timeDecay = 1 - decayProgress * (1 - MIN_TIME_DECAY);
      increment *= timeDecay;

      const newProgress = Math.min(currentProgress + increment, 94);
      progressRef.current = newProgress;

      setProgress(newProgress);
      setOpacity(1);
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

      // Wait INITIAL_DELAY_MS before showing the progress bar
      // This avoids flashing for fast navigations
      delayTimerRef.current = setTimeout(() => {
        // Only show if still active (navigation hasn't completed)
        if (!isActiveRef.current) return;

        // Initial burst to show immediate feedback
        setProgress(10);
        setOpacity(1);
        progressRef.current = 10;

        // Start trickling
        intervalRef.current = setInterval(trickleProgress, UPDATE_INTERVAL_MS);
      }, INITIAL_DELAY_MS);
    };

    const completeProgress = () => {
      // Mark as inactive
      isActiveRef.current = false;

      // Clear all timers
      cleanupTimers();

      // If progress never started (fast navigation), just reset
      if (progressRef.current === 0) {
        setProgress(0);
        setOpacity(0);
        return;
      }

      // Quickly go to 100%
      setProgress(100);
      setOpacity(1);
      progressRef.current = 100;

      // Fade out after completion
      fadeOutTimerRef.current = setTimeout(() => {
        setOpacity(0);
        // Reset progress after fade out completes
        setTimeout(() => {
          setProgress(0);
          progressRef.current = 0;
        }, FADE_OUT_DURATION_MS);
      }, COMPLETION_DELAY_MS);
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
  }, []);

  return (
    <div
      className="pointer-events-none fixed top-0 right-0 left-0 z-[9999] h-1 transition-opacity duration-200"
      style={{ opacity }}
      role="progressbar"
      aria-label="Page navigation progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="bg-success-content h-full transition-all duration-500 ease-out"
        style={{
          width: `${progress}%`,
          transformOrigin: "left",
        }}
      />
    </div>
  );
}
