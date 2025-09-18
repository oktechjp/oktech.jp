"use client";

import { useEffect, useState } from "react";

import clsx from "clsx";
import { LuMoon, LuSun } from "react-icons/lu";

interface ThemeToggleProps {
  testId?: string;
  onClick?: () => void;
  className?: string;
}

export default function ThemeToggle({
  testId = "theme-switcher",
  onClick,
  className,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark";
    setTheme(currentTheme || "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
    onClick?.();
  };

  return (
    <button
      onClick={toggleTheme}
      className={clsx("flex items-center justify-center", className)}
      aria-label="Toggle theme"
      data-testid={testId}
    >
      <LuMoon className="hidden h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5 dark:block" />
      <LuSun className="block h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5 dark:hidden" />
    </button>
  );
}
