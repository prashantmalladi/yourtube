import { notFound } from "next/navigation";
import { ChannelBanner } from "@/components/channel/ChannelBanner";
import { ChannelHeader } from "@/components/channel/ChannelHeader";
import { ChannelTabs } from "@/components/channel/ChannelTabs";
import { FeaturedVideo } from "@/components/channel/FeaturedVideo";
import { VideoGrid } from "@/components/home/VideoGrid";
import { channels, getChannel, getChannelVideos, getVideoDetails } from "@/lib/mock-data";

export async function generateStaticParams() {
  return channels.map((channel) => ({ id: channel.id }));
}

export default async function ChannelPage({ params }: PageProps<"/channel/[id]">) {
  const { id } = await params;
  const channel = getChannel(id);

  if (!channel) {
    notFound();
  }

  const channelVideos = getChannelVideos(channel.id);
  const [featured, ...rest] = channelVideos;
  const featuredDetails = featured ? getVideoDetails(featured.id) : undefined;

  return (
    <div className="mx-auto flex max-w-[1750px] flex-col gap-6 px-4 py-4 sm:px-6">
      <ChannelBanner channel={channel} />
      <ChannelHeader channel={channel} />
      <ChannelTabs />

      {featuredDetails && <FeaturedVideo video={featuredDetails} />}

      <VideoGrid title="For You" videos={rest.length > 0 ? rest : channelVideos} />
    </div>
  );
}
