import type { Video } from "@/lib/mock-data";

export function VideoCard({ video }: { video: Video }) {
  return (
    <a href={`/watch/${video.id}`} className="group flex flex-col gap-2">
      <div
        className={`relative flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br text-5xl ${video.thumbnailGradient}`}
      >
        {video.emoji}
        <span className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {video.duration}
        </span>
      </div>
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg dark:bg-amber-900">
          🐾
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
            {video.title}
          </h3>
          <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{video.channel}</p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {video.views} &middot; {video.uploaded}
          </p>
        </div>
      </div>
    </a>
  );
}
