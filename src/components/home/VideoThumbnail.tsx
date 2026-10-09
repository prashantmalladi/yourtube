import type { ReactNode } from "react";
import type { Video } from "@/lib/types";

/** Video thumbnail: the CDN image when there is one, otherwise the emoji-on-gradient tile. */
export function VideoThumbnail({
  video,
  className = "",
  children,
}: {
  video: Pick<Video, "title" | "emoji" | "thumbnailGradient" | "thumbnailUrl">;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br ${video.thumbnailGradient} ${className}`}
    >
      {video.thumbnailUrl ? (
        // Cloudflare Images already serves the resized file, so next/image optimization adds nothing.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        video.emoji
      )}
      {children}
    </div>
  );
}
