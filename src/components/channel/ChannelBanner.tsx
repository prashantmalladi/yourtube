import type { Channel } from "@/lib/types";

export function ChannelBanner({ channel }: { channel: Channel }) {
  return (
    <div
      className={`relative flex h-32 items-center overflow-hidden rounded-2xl bg-gradient-to-r text-4xl sm:h-48 ${channel.bannerGradient}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 text-3xl opacity-30 sm:text-4xl">
        <span className="absolute left-6 top-4 sm:top-6">🐾</span>
        <span className="absolute right-10 top-8 sm:top-10">🐾</span>
        <span className="absolute bottom-6 left-1/3">🐾</span>
        <span className="absolute right-1/4 bottom-4 sm:bottom-6">❤️</span>
      </div>
      <span className="relative mx-auto">{channel.avatarEmoji}</span>
    </div>
  );
}
