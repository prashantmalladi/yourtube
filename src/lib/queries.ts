import { asc, eq } from "drizzle-orm";
import { channels, comments, users, videos } from "../../drizzle/schema";
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
