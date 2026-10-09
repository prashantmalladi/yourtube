-- Text/serial ids cannot be cast to uuid, so the tables are recreated.
-- Existing rows are dropped; re-run scripts/seed.ts to repopulate.
DROP TABLE "comments";--> statement-breakpoint
DROP TABLE "videos";--> statement-breakpoint
DROP TABLE "channels";--> statement-breakpoint
DROP TABLE "users";--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"avatar_emoji" text NOT NULL,
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"handle" text NOT NULL,
	"avatar_emoji" text NOT NULL,
	"banner_gradient" text NOT NULL,
	"subscribers" text NOT NULL,
	"video_count" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" uuid NOT NULL,
	"title" text NOT NULL,
	"views" text NOT NULL,
	"uploaded" text NOT NULL,
	"duration" text NOT NULL,
	"thumbnail_gradient" text NOT NULL,
	"emoji" text NOT NULL,
	"likes" text NOT NULL,
	"hashtags" text[] NOT NULL,
	"description" text NOT NULL,
	"section" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"time" text NOT NULL,
	"text" text NOT NULL,
	"likes" text NOT NULL,
	"replies" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
