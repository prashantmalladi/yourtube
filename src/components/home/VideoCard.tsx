import type { Video } from "@/lib/types";
import { VideoThumbnail } from "@/components/home/VideoThumbnail";

export function VideoCard({ video }: { video: Video }) {
  return (
    <div className="flex flex-col gap-2">
      <a href={`/watch/${video.id}`} className="group block">
        <VideoThumbnail video={video} className="rounded-xl text-5xl">
          <span className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {video.duration}
          </span>
        </VideoThumbnail>
      </a>
      <div className="flex gap-3">
        <a href={`/channel/${video.channelId}`} className="shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-lg dark:bg-amber-900">
            🐾
          </div>
        </a>
        <div className="min-w-0">
          <a href={`/watch/${video.id}`} className="group block">
            <h3 className="line-clamp-2 text-sm font-medium text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
              {video.title}
            </h3>
          </a>
          <a
            href={`/channel/${video.channelId}`}
            className="mt-1 block truncate text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            {video.channel}
          </a>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {video.views} &middot; {video.uploaded}
          </p>
        </div>
      </div>
    </div>
  );
}
