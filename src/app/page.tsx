import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryChips } from "@/components/home/CategoryChips";
import { VideoGrid } from "@/components/home/VideoGrid";
import { ShortsRow } from "@/components/home/ShortsRow";
import { getProfileKey } from "@/lib/preferences";
import { getRecommendedVideos, getVideosBySection } from "@/lib/queries";

export default async function Home() {
  const profileKey = await getProfileKey({ create: false });
  const [forYouVideos, fallbackVideos, personal] = await Promise.all([
    getVideosBySection("for-you"),
    getVideosBySection("recommended"),
    profileKey ? getRecommendedVideos(profileKey) : null,
  ]);

  return (
    <div className="flex flex-col gap-8 px-4 py-4 sm:px-6">
      <HeroBanner />
      <CategoryChips />
      <VideoGrid title="For You" videos={forYouVideos} />
      <ShortsRow />
      <VideoGrid
        title={personal ? `Recommended for You · because you like ${personal.because.join(", ")}` : "Recommended for You"}
        videos={personal?.videos ?? fallbackVideos}
      />
    </div>
  );
}
