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
      <LuMoon className="hidden h-[18px] w-[18px] dark:block" />
      <LuSun className="block h-[18px] w-[18px] dark:hidden" />
    </button>
  );
}
