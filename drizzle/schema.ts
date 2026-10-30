import { boolean, index, integer, pgTable, primaryKey, real, text, timestamp, uuid, vector } from "drizzle-orm/pg-core";

// Doubles as Better Auth's user table. Rows without an email are display-only
// users (comment authors, channel owners) who cannot sign in.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatarEmoji: text("avatar_emoji").notNull().default("🐾"),
  email: text("email").unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
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
  thumbnailUrl: text("thumbnail_url"),
  /** CLIP ViT-B/32 image embedding of the thumbnail (L2-normalised), see scripts/embed-thumbnails.ts. */
  thumbnailEmbedding: vector("thumbnail_embedding", { dimensions: 512 }),
  videoUrl: text("video_url"),
  emoji: text("emoji").notNull(),
  likes: text("likes").notNull(),
  hashtags: text("hashtags").array().notNull(),
  description: text("description").notNull(),
  section: text("section").notNull(),
  position: integer("position").notNull(),
}, (t) => [
  index("videos_thumbnail_embedding_idx").using("hnsw", t.thumbnailEmbedding.op("vector_cosine_ops")),
]);

// One attempt at making a video. A user can have several per idea (regenerate).
export const generations = pgTable("generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** What the user typed. */
  prompt: text("prompt").notNull(),
  /** The cat-safe prompt actually sent to the video model. Empty until polishing finishes. */
  polishedPrompt: text("polished_prompt"),
  title: text("title"),
  description: text("description"),
  hashtags: text("hashtags").array(),
  /** Set once the job has been sent to fal; null means no paid video call was made. */
  falModel: text("fal_model"),
  falRequestId: text("fal_request_id"),
  /** Set once the thumbnail job has been sent to fal. */
  falImageRequestId: text("fal_image_request_id"),
  /** The thumbnail: a temporary fal URL while the user reviews it, then a permanent Cloudflare Images URL once confirmed. */
  thumbnailUrl: text("thumbnail_url"),
  /** When the confirmed thumbnail was sent to the video model; the video timeout counts from here, not from createdAt. */
  videoStartedAt: timestamp("video_started_at", { withTimezone: true }),
  /** starting | thumbnailing | thumbnail_ready | generating | ready | publishing | published | failed | rejected */
  status: text("status").notNull().default("starting"),
  /** Temporary fal-hosted URL, valid until the clip is copied to Cloudflare. */
  videoUrl: text("video_url"),
  error: text("error"),
  videoId: uuid("video_id").references(() => videos.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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

// Taste dimensions ("noir", "anime", ...). The embedding is CLIP's text embedding of `prompt`,
// so a video's thumbnail embedding can be scored against every dimension. See scripts/seed-dimensions.ts.
export const preferenceDimensions = pgTable("preference_dimensions", {
  slug: text("slug").primaryKey(),
  label: text("label").notNull(),
  /** style | genre | subject | mood | setting */
  kind: text("kind").notNull(),
  prompt: text("prompt").notNull(),
  embedding: vector("embedding", { dimensions: 512 }).notNull(),
});

// How much a viewer likes each dimension. profile_key is "user:<id>" when signed in, else "anon:<cookie>".
export const userPreferences = pgTable(
  "user_preferences",
  {
    profileKey: text("profile_key").notNull(),
    dimension: text("dimension")
      .notNull()
      .references(() => preferenceDimensions.slug, { onDelete: "cascade" }),
    score: real("score").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.profileKey, t.dimension] })]
);

// Raw signals, kept so the debug page can show what the system saw.
export const preferenceEvents = pgTable(
  "preference_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileKey: text("profile_key").notNull(),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    /** view | watch */
    kind: text("kind").notNull(),
    weight: real("weight").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("preference_events_profile_idx").on(t.profileKey, t.createdAt.desc())]
);
