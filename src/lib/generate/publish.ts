import { asc, count, eq, min } from "drizzle-orm";
import { channels, videos } from "../../../drizzle/schema";
import { copyToStream } from "../cloudflare";
import { db } from "../db";

type Generation = { videoUrl: string; description: string; hashtags: string[] };
type Owner = { id: string; name: string };

const BANNER_GRADIENTS = [
  "from-amber-200 via-lime-200 to-emerald-200",
  "from-sky-200 via-blue-200 to-indigo-200",
  "from-indigo-200 via-purple-200 to-pink-200",
  "from-rose-200 via-orange-200 to-amber-200",
];

/** A user's own channel, created the first time they publish. */
async function channelFor(owner: Owner) {
  const [existing] = await db
    .select()
    .from(channels)
    .where(eq(channels.ownerId, owner.id))
    .orderBy(asc(channels.name))
    .limit(1);
  if (existing) return existing;

  const slug = owner.name.replace(/[^\p{L}\p{N}]+/gu, "") || "Creator";
  const [created] = await db
    .insert(channels)
    .values({
      ownerId: owner.id,
      name: `${owner.name}'s Cats`,
      handle: `@${slug}${owner.id.slice(0, 4)}`,
      avatarEmoji: "🐱",
      bannerGradient: BANNER_GRADIENTS[owner.id.charCodeAt(0) % BANNER_GRADIENTS.length],
      subscribers: "0 subscribers",
      videoCount: "0 videos",
      verified: false,
      description: `Cat videos made by ${owner.name}.`,
    })
    .returning();
  return created;
}

/** Copies the generated clip to Cloudflare Stream and adds it to the site. Returns the new video id. */
export async function publishGeneration(generation: Generation, title: string, owner: Owner) {
  const stream = await copyToStream(generation.videoUrl, title);
  const channel = await channelFor(owner);

  // New uploads go to the front of the "For You" row.
  const [{ first }] = await db.select({ first: min(videos.position) }).from(videos);

  const [video] = await db
    .insert(videos)
    .values({
      channelId: channel.id,
      title,
      views: "0 views",
      uploaded: "Just now",
      duration: "0:10",
      thumbnailGradient: "from-amber-200 to-orange-300",
      thumbnailUrl: stream.thumbnailUrl,
      videoUrl: stream.playerUrl,
      emoji: "🐱",
      likes: "0",
      hashtags: generation.hashtags,
      description: generation.description,
      section: "for-you",
      position: (first ?? 0) - 1,
    })
    .returning({ id: videos.id });

  const [{ total }] = await db
    .select({ total: count() })
    .from(videos)
    .where(eq(videos.channelId, channel.id));
  await db
    .update(channels)
    .set({ videoCount: `${total} video${total === 1 ? "" : "s"}` })
    .where(eq(channels.id, channel.id));

  return video.id;
}
