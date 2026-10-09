import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { channels, comments, users, videos } from "../drizzle/schema";
import {
  channels as mockChannels,
  forYouVideos,
  videoDetails,
} from "../src/lib/mock-data";

process.loadEnvFile(".env");

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

async function main() {
  const details = Object.values(videoDetails);

  // One user per channel owner and per distinct comment author.
  const userList = new Map<string, string>();
  for (const c of mockChannels) userList.set(c.name, c.avatarEmoji);
  for (const v of details)
    for (const c of v.comments)
      if (!userList.has(c.author)) userList.set(c.author, c.avatarEmoji);

  // Clear in FK order so the seed can be re-run.
  await db.delete(comments);
  await db.delete(videos);
  await db.delete(channels);
  await db.delete(users);

  const insertedUsers = await db
    .insert(users)
    .values([...userList].map(([name, avatarEmoji]) => ({ name, avatarEmoji })))
    .returning();
  const userId = new Map(insertedUsers.map((u) => [u.name, u.id]));

  // The mock data uses slugs as ids; the database uses uuids.
  const channelId = new Map(mockChannels.map((c) => [c.id, randomUUID()]));
  const videoId = new Map(details.map((v) => [v.id, randomUUID()]));

  await db.insert(channels).values(
    mockChannels.map((c) => ({
      id: channelId.get(c.id)!,
      ownerId: userId.get(c.name)!,
      name: c.name,
      handle: c.handle,
      avatarEmoji: c.avatarEmoji,
      bannerGradient: c.bannerGradient,
      subscribers: c.subscribers,
      videoCount: c.videoCount,
      verified: c.verified,
      description: c.description,
    }))
  );

  await db.insert(videos).values(
    details.map((v, position) => ({
      id: videoId.get(v.id)!,
      channelId: channelId.get(v.channelId)!,
      title: v.title,
      views: v.views,
      uploaded: v.uploaded,
      duration: v.duration,
      thumbnailGradient: v.thumbnailGradient,
      emoji: v.emoji,
      likes: v.likes,
      hashtags: v.hashtags,
      description: v.description,
      section: forYouVideos.some((f) => f.id === v.id) ? "for-you" : "recommended",
      position,
    }))
  );

  // Stagger timestamps so comments keep their order (ids are random uuids).
  const start = Date.now();
  let n = 0;
  const commentRows = details.flatMap((v) =>
    v.comments.map((c) => ({
      createdAt: new Date(start + n++),
      videoId: videoId.get(v.id)!,
      userId: userId.get(c.author)!,
      time: c.time,
      text: c.text,
      likes: c.likes,
      replies: c.replies,
    }))
  );
  await db.insert(comments).values(commentRows);

  console.log(
    `Seeded ${insertedUsers.length} users, ${mockChannels.length} channels, ${details.length} videos, ${commentRows.length} comments`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
