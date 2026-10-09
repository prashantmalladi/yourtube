import type { Video } from "@/lib/types";
import { RelatedVideoCard } from "@/components/watch/RelatedVideoCard";

const filters = ["All", "From Channel", "Puppies", "Related"];

export function RelatedVideos({ videos }: { videos: Video[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter, index) => (
          <button
            key={filter}
            className={
              index === 0
                ? "shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            }
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {videos.map((video) => (
          <RelatedVideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
