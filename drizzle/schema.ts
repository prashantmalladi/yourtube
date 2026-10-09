import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  avatarEmoji: text("avatar_emoji").notNull(),
});

export const channels = pgTable("channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  handle: text("handle").notNull(),
  avatarEmoji: text("avatar_emoji").notNull(),
  bannerGradient: text("banner_gradient").notNull(),
  subscribers: text("subscribers").notNull(),
  videoCount: text("video_count").notNull(),
  verified: boolean("verified").notNull().default(false),
  description: text("description").notNull(),
});

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelId: uuid("channel_id")
    .notNull()
    .references(() => channels.id),
  title: text("title").notNull(),
  views: text("views").notNull(),
  uploaded: text("uploaded").notNull(),
  duration: text("duration").notNull(),
  thumbnailGradient: text("thumbnail_gradient").notNull(),
  emoji: text("emoji").notNull(),
  likes: text("likes").notNull(),
  hashtags: text("hashtags").array().notNull(),
  description: text("description").notNull(),
  section: text("section").notNull(),
  position: integer("position").notNull(),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  time: text("time").notNull(),
  text: text("text").notNull(),
  likes: text("likes").notNull(),
  replies: integer("replies").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
