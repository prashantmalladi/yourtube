import { shorts } from "@/lib/mock-data";
import { ChevronRightIcon, ShortsIcon } from "@/components/icons";

export function ShortsRow() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <ShortsIcon className="h-6 w-6 text-red-600" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Shorts</h2>
      </div>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {shorts.map((short) => (
            <a
              key={short.id}
              href={`/shorts/${short.id}`}
              className="group flex w-40 shrink-0 flex-col gap-2"
            >
              <div
                className={`relative flex aspect-9/16 items-center justify-center rounded-xl bg-gradient-to-br text-4xl ${short.thumbnailGradient}`}
              >
                {short.emoji}
                <span className="absolute right-1.5 bottom-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {short.duration}
                </span>
              </div>
              <p className="line-clamp-2 text-sm font-medium text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                {short.title}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{short.views}</p>
            </a>
          ))}
        </div>
        <button
          aria-label="More shorts"
          className="absolute top-1/3 -right-1 hidden h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white shadow sm:flex dark:border-zinc-700 dark:bg-zinc-900"
        >
          <ChevronRightIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        </button>
      </div>
    </section>
  );
}
