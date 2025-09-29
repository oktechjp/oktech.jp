import { useEffect, useState } from "react";

import clsx from "clsx";
import { LuConstruction, LuX } from "react-icons/lu";

export default function Toast() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const dismissedTimestamp = localStorage.getItem("constructionToastDismissedAt");

    if (!dismissedTimestamp) {
      setIsMounted(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      const dismissedAt = parseInt(dismissedTimestamp, 10);
      const oneHourInMs = 60 * 60 * 1000;
      const now = Date.now();

      if (now - dismissedAt > oneHourInMs) {
        setIsMounted(true);
        setTimeout(() => setIsVisible(true), 10);
        localStorage.removeItem("constructionToastDismissedAt");
      } else {
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsMounted(false);
      localStorage.setItem("constructionToastDismissedAt", Date.now().toString());
    }, 500);
  };

  if (!isMounted) return null;

  return (
    <div
      className={clsx(
        "fixed right-2 bottom-6 left-2 z-50 transition-opacity duration-500",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="alert alert-warning m-auto max-w-md">
        <LuConstruction className="h-5 w-5" />
        <span>We're actively working on this site. You will encounter visual inconsistencies.</span>
        <button
          onClick={handleDismiss}
          className="btn btn-ghost btn-sm btn-square"
          aria-label="Dismiss"
        >
          <LuX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
