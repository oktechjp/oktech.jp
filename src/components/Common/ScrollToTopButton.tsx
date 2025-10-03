import type { JSX } from "react";
import { useEffect, useState } from "react";

const APPEAR_THRESHOLD = 800;

const springTimingFunction = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export default function ScrollToTopButton(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > APPEAR_THRESHOLD;
      setIsVisible((previous) => (previous !== shouldShow ? shouldShow : previous));
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  const visibilityClasses = isVisible
    ? "opacity-100 translate-y-0 pointer-events-auto"
    : "opacity-0 translate-y-4 pointer-events-none";

  return (
    <div
      className={`tooltip tooltip-left fixed bottom-6 right-6 z-50 transition duration-300 ease-out md:bottom-8 md:right-8 ${visibilityClasses}`}
      style={{ transitionTimingFunction: springTimingFunction }}
      data-tip="Scroll to top"
      aria-hidden={!isVisible}
    >
      <button
        type="button"
        aria-label="Scroll to top"
        onClick={handleClick}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-base-900 text-base-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100/70"
        tabIndex={isVisible ? 0 : -1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
