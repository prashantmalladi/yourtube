import type { VideoDetails } from "@/lib/mock-data";
import {
  CheckBadgeIcon,
  DownloadIcon,
  MoreIcon,
  ScissorsIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@/components/icons";

export function VideoInfo({ video }: { video: VideoDetails }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{video.title}</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl dark:bg-amber-900">
            {video.emoji}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{video.channel}</p>
              {video.verified && <CheckBadgeIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{video.subscribers}</p>
          </div>
          <button className="ml-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
            Subscribe
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-700">
              <ThumbsUpIcon className="h-4.5 w-4.5" />
              {video.likes}
            </button>
            <span className="h-5 w-px bg-zinc-300 dark:bg-zinc-600" />
            <button
              aria-label="Dislike"
              className="px-4 py-2 text-zinc-900 hover:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <ThumbsDownIcon className="h-4.5 w-4.5" />
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
            <ShareIcon className="h-4.5 w-4.5" />
            Share
          </button>
          <button className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
            <DownloadIcon className="h-4.5 w-4.5" />
            Download
          </button>
          <button className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
            <ScissorsIcon className="h-4.5 w-4.5" />
            Clip
          </button>
          <button
            aria-label="More actions"
            className="rounded-full bg-zinc-100 p-2.5 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            <MoreIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <details className="group rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
        <summary className="cursor-pointer list-none text-sm text-zinc-700 marker:content-none dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {video.views} &middot; {video.uploaded}
          </span>{" "}
          <span className="text-zinc-600 dark:text-zinc-400">{video.hashtags.join(" ")}</span>
          <span className="ml-1 font-medium text-zinc-900 group-open:hidden dark:text-zinc-100">
            ...more
          </span>
        </summary>
        <p className="mt-2 text-sm whitespace-pre-line text-zinc-700 dark:text-zinc-300">
          {video.description}
        </p>
      </details>
    </div>
  );
}
