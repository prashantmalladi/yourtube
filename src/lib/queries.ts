import { asc, cosineDistance, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { channels, comments, users, videos } from "../../drizzle/schema";
import { embedText } from "./clip";
import { getTopDimensions } from "./preferences";
import { db } from "./db";
import { isUuid } from "./uuid";
import type { Channel, Comment, Video, VideoDetails } from "./types";

const videoColumns = {
  id: videos.id,
  title: videos.title,
  channel: channels.name,
  channelId: videos.channelId,
  views: videos.views,
  uploaded: videos.uploaded,
  duration: videos.duration,
  thumbnailGradient: videos.thumbnailGradient,
  thumbnailUrl: videos.thumbnailUrl,
  emoji: videos.emoji,
};

function selectVideos() {
  return db
    .select(videoColumns)
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id))
    .orderBy(asc(videos.position));
}

export async function getAllVideos(): Promise<Video[]> {
  return selectVideos();
}

export async function getVideosBySection(section: "for-you" | "recommended"): Promise<Video[]> {
  return selectVideos().where(eq(videos.section, section));
}

/** Videos whose thumbnails best match the query, by CLIP text-to-image similarity (pgvector cosine distance). */
export async function searchVideos(query: string, limit = 24): Promise<Video[]> {
  const embedding = await embedText(query);
  return db
    .select(videoColumns)
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id))
    .where(isNotNull(videos.thumbnailEmbedding))
    .orderBy(cosineDistance(videos.thumbnailEmbedding, embedding))
    .limit(limit);
}

/**
 * Videos whose thumbnails are closest to the given video's, by pgvector cosine distance.
 * Videos without an embedding sort last (by position), so this degrades to the old order
 * when the source video has not been embedded yet.
 */
export async function getRelatedVideos(videoId: string, limit = 20): Promise<Video[]> {
  if (!isUuid(videoId)) return [];
  return db
    .select(videoColumns)
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id))
    .where(ne(videos.id, videoId))
    .orderBy(
      sql`${videos.thumbnailEmbedding} <=> (select thumbnail_embedding from videos where id = ${videoId})`,
      asc(videos.position)
    )
    .limit(limit);
}

/**
 * Videos that best match the viewer's top 3 interests. A video's relevance is its thumbnail's CLIP
 * similarity to each of those dimensions, weighted by how strong the interest is. Videos already
 * viewed sort after unseen ones. Returns null until the viewer has any learned interests.
 */
export async function getRecommendedVideos(
  profileKey: string,
  limit = 12
): Promise<{ because: string[]; videos: Video[] } | null> {
  const top = await getTopDimensions(profileKey, 3);
  if (!top.length) return null;

  const total = top.reduce((sum, d) => sum + d.score, 0);
  const weights = JSON.stringify(top.map((d) => ({ slug: d.slug, w: d.score / total })));

  const ranked = await db.execute<{ id: string }>(sql`
    select v.id
    from videos v
    join jsonb_to_recordset(${weights}::jsonb) as t(slug text, w float) on true
    join preference_dimensions d on d.slug = t.slug
    where v.thumbnail_embedding is not null
    group by v.id
    order by
      exists (select 1 from preference_events e
              where e.profile_key = ${profileKey} and e.video_id = v.id and e.kind = 'view') asc,
      sum(t.w * (1 - (v.thumbnail_embedding <=> d.embedding))) desc
    limit ${limit}`);
  const ids = ranked.map((r) => r.id);
  if (!ids.length) return null;

  const rows = await selectVideos().where(inArray(videos.id, ids));
  const byId = new Map(rows.map((v) => [v.id, v]));
  return { because: top.map((d) => d.label), videos: ids.map((id) => byId.get(id)!) };
}

export async function getChannel(id: string): Promise<Channel | undefined> {
  if (!isUuid(id)) return undefined;
  const [channel] = await db
    .select({
      id: channels.id,
      name: channels.name,
      handle: channels.handle,
      avatarEmoji: channels.avatarEmoji,
      bannerGradient: channels.bannerGradient,
      subscribers: channels.subscribers,
      videoCount: channels.videoCount,
      verified: channels.verified,
      description: channels.description,
    })
    .from(channels)
    .where(eq(channels.id, id));
  return channel;
}

export async function getChannelVideos(channelId: string): Promise<Video[]> {
  return selectVideos().where(eq(videos.channelId, channelId));
}

export async function getVideoDetails(id: string): Promise<VideoDetails | undefined> {
  if (!isUuid(id)) return undefined;
  const [row] = await db
    .select({
      ...videoColumns,
      subscribers: channels.subscribers,
      verified: channels.verified,
      videoUrl: videos.videoUrl,
      likes: videos.likes,
      hashtags: videos.hashtags,
      description: videos.description,
    })
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id))
    .where(eq(videos.id, id));

  if (!row) return undefined;

  const videoComments: Comment[] = await db
    .select({
      id: comments.id,
      author: users.name,
      avatarEmoji: users.avatarEmoji,
      time: comments.time,
      text: comments.text,
      likes: comments.likes,
      replies: comments.replies,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.videoId, id))
    .orderBy(asc(comments.createdAt));

  return { ...row, comments: videoComments };
}
