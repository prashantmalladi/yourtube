import type { Video } from "@/lib/types";
import { VideoThumbnail } from "@/components/home/VideoThumbnail";

export function RelatedVideoCard({ video }: { video: Video }) {
  return (
    <a href={`/watch/${video.id}`} className="group flex gap-2">
      <VideoThumbnail video={video} className="w-40 shrink-0 rounded-lg text-3xl">
        <span className="absolute right-1.5 bottom-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {video.duration}
        </span>
      </VideoThumbnail>
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-medium text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
          {video.title}
        </h3>
        <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{video.channel}</p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{video.views} &middot; {video.uploaded}</p>
      </div>
    </a>
  );
}
