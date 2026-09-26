import { SearchIcon } from "@/components/icons";

const tabs = ["Home", "Videos", "Shorts", "Live", "Playlists", "Community"];

export function ChannelTabs() {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
      <nav className="flex gap-6 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`shrink-0 border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
              index === 0
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
      <button
        aria-label="Search channel"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
