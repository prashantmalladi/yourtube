import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/watch/VideoPlayer";
import { VideoInfo } from "@/components/watch/VideoInfo";
import { CommentsSection } from "@/components/watch/CommentsSection";
import { WatchTracker } from "@/components/watch/WatchTracker";
import { RelatedVideos } from "@/components/watch/RelatedVideos";
import { getRelatedVideos, getVideoDetails } from "@/lib/queries";

export default async function WatchPage({ params }: PageProps<"/watch/[id]">) {
  const { id } = await params;
  const video = await getVideoDetails(id);

  if (!video) {
    notFound();
  }

  const relatedVideos = await getRelatedVideos(video.id);

  return (
    <div className="mx-auto flex max-w-[1750px] flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-4 lg:max-w-[calc(100%-402px)]">
        <WatchTracker videoId={video.id} />
        <VideoPlayer video={video} />
        <VideoInfo video={video} />
        <CommentsSection comments={video.comments} />
      </div>

      <aside className="w-full shrink-0 lg:w-96">
        <RelatedVideos videos={relatedVideos} />
      </aside>
    </div>
  );
}
