import type { VideoDetails } from "@/lib/types";

export function FeaturedVideo({ video }: { video: VideoDetails }) {
  return (
    <a href={`/watch/${video.id}`} className="group flex flex-col gap-4 sm:flex-row">
      <div
        className={`relative flex aspect-video shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-6xl sm:w-96 ${video.thumbnailGradient}`}
      >
        {video.emoji}
        <span className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {video.duration}
        </span>
      </div>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
          {video.title}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {video.views} &middot; {video.uploaded}
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{video.description}</p>
        <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">{video.hashtags.join(" ")}</p>
      </div>
    </a>
  );
}
