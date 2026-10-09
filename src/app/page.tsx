import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryChips } from "@/components/home/CategoryChips";
import { VideoGrid } from "@/components/home/VideoGrid";
import { ShortsRow } from "@/components/home/ShortsRow";
import { getVideosBySection } from "@/lib/queries";

export default async function Home() {
  const [forYouVideos, recommendedVideos] = await Promise.all([
    getVideosBySection("for-you"),
    getVideosBySection("recommended"),
  ]);

  return (
    <div className="flex flex-col gap-8 px-4 py-4 sm:px-6">
      <HeroBanner />
      <CategoryChips />
      <VideoGrid title="For You" videos={forYouVideos} />
      <ShortsRow />
      <VideoGrid title="Recommended for You" videos={recommendedVideos} />
    </div>
  );
}
