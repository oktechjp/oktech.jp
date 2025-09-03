"use client";

import { useEffect, useState } from "react";

import { LuMoon, LuSun } from "react-icons/lu";

import TooltipButton from "@/components/Common/TooltipButton";

interface ThemeToggleProps {
  testId?: string;
}

export default function ThemeToggle({ testId = "theme-switcher" }: ThemeToggleProps) {
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
  };

  return (
    <TooltipButton
      tooltip={theme === "dark" ? "Light Mode" : "Dark Mode"}
      tooltipPosition="bottom"
      onClick={toggleTheme}
      className="btn btn-circle btn-sm btn-ghost"
      aria-label="Toggle theme"
      data-testid={testId}
    >
      <LuMoon className="hidden h-[18px] w-[18px] dark:block" />
      <LuSun className="block h-[18px] w-[18px] dark:hidden" />
    </TooltipButton>
  );
}
