import type { Video } from "@/lib/mock-data";
import { VideoCard } from "@/components/home/VideoCard";

export function VideoGrid({ title, videos }: { title?: string; videos: Video[] }) {
  return (
    <section>
      {title && <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>}
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
