import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryChips } from "@/components/home/CategoryChips";
import { VideoGrid } from "@/components/home/VideoGrid";
import { ShortsRow } from "@/components/home/ShortsRow";
import { forYouVideos, recommendedVideos } from "@/lib/mock-data";

export default function Home() {
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
