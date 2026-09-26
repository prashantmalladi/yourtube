"use client";

import { MoonIcon, SunIcon } from "@/components/icons";

function toggleTheme() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  localStorage.setItem("theme", next ? "dark" : "light");
}

export function ThemeToggle() {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <MoonIcon className="h-5 w-5 text-zinc-700 dark:hidden" />
      <SunIcon className="hidden h-5 w-5 text-zinc-300 dark:block" />
    </button>
  );
}
