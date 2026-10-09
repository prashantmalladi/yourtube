import type { VideoDetails } from "@/lib/types";
import {
  CastIcon,
  ClosedCaptionIcon,
  FullscreenIcon,
  PlayIcon,
  SettingsIcon,
  SkipNextIcon,
  VolumeIcon,
} from "@/components/icons";

export function VideoPlayer({ video }: { video: VideoDetails }) {
  return (
    <div className="group/player relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br text-8xl">
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${video.thumbnailGradient}`}
      >
        {video.emoji}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pt-8 pb-2 opacity-0 transition-opacity group-hover/player:opacity-100">
        <div className="pointer-events-auto h-1 w-full cursor-pointer rounded-full bg-white/30">
          <div className="relative h-1 w-1/4 rounded-full bg-red-600">
            <span className="absolute top-1/2 right-0 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-red-600" />
          </div>
        </div>

        <div className="pointer-events-auto flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <button aria-label="Play" className="hover:text-zinc-300">
              <PlayIcon className="h-6 w-6" />
            </button>
            <button aria-label="Next" className="hover:text-zinc-300">
              <SkipNextIcon className="h-5 w-5" />
            </button>
            <button aria-label="Volume" className="hover:text-zinc-300">
              <VolumeIcon className="h-5 w-5" />
            </button>
            <span className="text-xs font-medium">2:34 / {video.duration}</span>
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Closed captions" className="hover:text-zinc-300">
              <ClosedCaptionIcon className="h-5 w-5" />
            </button>
            <button aria-label="Settings" className="hover:text-zinc-300">
              <SettingsIcon className="h-5 w-5" />
            </button>
            <button aria-label="Cast" className="hover:text-zinc-300">
              <CastIcon className="h-5 w-5" />
            </button>
            <button aria-label="Fullscreen" className="hover:text-zinc-300">
              <FullscreenIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
