import { useEffect, useState } from "react";

import { LuConstruction, LuX } from "react-icons/lu";

export default function Toast() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const dismissedTimestamp = localStorage.getItem("constructionToastDismissedAt");
    console.log("Toast component mounted, dismissedTimestamp:", dismissedTimestamp);

    if (!dismissedTimestamp) {
      console.log("No timestamp found, showing toast");
      setIsMounted(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      const dismissedAt = parseInt(dismissedTimestamp, 10);
      const oneHourInMs = 60 * 60 * 1000;
      const now = Date.now();

      if (now - dismissedAt > oneHourInMs) {
        console.log("More than 1 hour passed, showing toast again");
        setIsMounted(true);
        setTimeout(() => setIsVisible(true), 10);
        localStorage.removeItem("constructionToastDismissedAt");
      } else {
        console.log("Less than 1 hour since dismissal, not showing toast");
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
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="alert alert-soft alert-warning max-w-md shadow-lg">
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
