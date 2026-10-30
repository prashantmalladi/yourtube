"use client";

import Link from "next/link";
import { Suspense } from "react";
import { BellIcon, MenuIcon, MicIcon } from "@/components/icons";
import { SearchBar } from "@/components/layout/SearchBar";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useSidebar } from "@/components/layout/SidebarContext";

export function Header() {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          aria-label="Open menu"
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <MenuIcon className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
        </button>
        <Link href="/" className="flex items-center gap-1">
          <span className="flex h-7 w-10 items-center justify-center rounded-lg bg-red-600">
            <span className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-white" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            YouTube
          </span>
          <span className="ml-1 text-base">🐾</span>
        </Link>
      </div>

      <div className="hidden max-w-2xl flex-1 items-center gap-3 sm:flex">
        <Suspense fallback={<div className="h-10 flex-1" />}>
          <SearchBar />
        </Suspense>
        <button
          aria-label="Search with voice"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <MicIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/create"
          className="hidden items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium hover:bg-zinc-200 sm:flex dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <span className="text-lg leading-none">+</span> Create
        </Link>
        <ThemeToggle />
        <button
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <BellIcon className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
        </button>
        <AccountMenu />
      </div>
    </header>
  );
}
