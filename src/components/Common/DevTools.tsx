import { useEffect, useState } from "react";

import { useBreakpoint } from "@/utils/hooks/useBreakpoint";

export default function DevTools() {
  return null;
  const [width, setWidth] = useState(0);
  const currentBreakpoint = useBreakpoint();

  useEffect(() => {
    const updateWidth = () => setWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-red-500 px-3 py-1.5 font-mono text-sm text-white sm:bg-orange-500 md:bg-yellow-500 lg:bg-green-500 xl:bg-blue-500 2xl:bg-purple-500`}
    >
      <span className="font-bold">{currentBreakpoint}</span>: {width}px
    </div>
  );
}
