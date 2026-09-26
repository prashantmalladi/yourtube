import type { Channel } from "@/lib/mock-data";
import { CheckBadgeIcon } from "@/components/icons";

export function ChannelHeader({ channel }: { channel: Channel }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-amber-100 text-5xl dark:bg-amber-900">
          {channel.avatarEmoji}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{channel.name}</h1>
            {channel.verified && <CheckBadgeIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />}
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {channel.handle} &middot; {channel.subscribers} &middot; {channel.videoCount}
          </p>
          <details className="group mt-1">
            <summary className="cursor-pointer list-none text-sm text-zinc-600 marker:content-none dark:text-zinc-400">
              <span className="line-clamp-1 group-open:line-clamp-none">{channel.description}</span>{" "}
              <span className="font-medium text-zinc-900 group-open:hidden dark:text-zinc-100">...more</span>
            </summary>
          </details>
        </div>
      </div>

      <button className="shrink-0 self-start rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 sm:self-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
        Subscribe
      </button>
    </div>
  );
}
