"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "@/components/icons";

export function SearchBar() {
  const router = useRouter();
  const q = useSearchParams().get("q") ?? "";

  return (
    <form
      role="search"
      action="/search"
      onSubmit={(e) => {
        e.preventDefault();
        const value = String(new FormData(e.currentTarget).get("q") ?? "").trim();
        if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
      }}
      className="flex flex-1 items-center rounded-full border border-zinc-300 focus-within:border-blue-400 dark:border-zinc-700 dark:focus-within:border-blue-500"
    >
      <div className="flex-1 px-4 py-2">
        <input
          key={q}
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by what's in the thumbnail, e.g. claymation cat baking"
          className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>
      <button
        type="submit"
        aria-label="Search"
        className="flex h-10 w-16 items-center justify-center rounded-r-full border-l border-zinc-300 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        <SearchIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
      </button>
    </form>
  );
}
