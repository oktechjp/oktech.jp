import { useEffect, useState } from "react";

/**
 * Hook that returns true when the page has been scrolled past the top
 */
export function useScrolled(): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY > 0;
    setIsScrolled(last);
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = y > 0;
        if (next !== last) {
          last = next;
          setIsScrolled(next);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return isScrolled;
}
