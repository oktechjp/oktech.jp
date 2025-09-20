import { useEffect, useState } from "react";

import { useBreakpoint } from "@/utils/hooks/useBreakpoint";

export default function DevTools() {
  const [width, setWidth] = useState(0);
  const currentBreakpoint = useBreakpoint();

  useEffect(() => {
    const updateWidth = () => setWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className={`fixed bottom-2 left-2 z-50`}>
      <div className="rounded-full bg-red-500 px-2 py-1 font-mono text-sm text-white sm:bg-orange-500 md:bg-yellow-500 lg:bg-green-500 xl:bg-blue-500 2xl:bg-purple-500">
        <span className="font-bold">{currentBreakpoint}</span>: {width}px
      </div>
    </div>
  );
}
