"use client";

import { useState } from "react";
import { categories } from "@/lib/mock-data";
import { ChevronRightIcon, PawIcon } from "@/components/icons";

export function CategoryChips() {
  const [active, setActive] = useState("All");
  const allCategories = ["All", ...categories];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      <PawIcon className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
      {allCategories.map((category) => (
        <button
          key={category}
          onClick={() => setActive(category)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
            active === category
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          {category}
        </button>
      ))}
      <button
        aria-label="More categories"
        className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      >
        <ChevronRightIcon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
      </button>
    </div>
  );
}
