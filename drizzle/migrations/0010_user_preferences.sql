CREATE TABLE "preference_dimensions" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"kind" text NOT NULL,
	"prompt" text NOT NULL,
	"embedding" vector(512) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preference_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_key" text NOT NULL,
	"video_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"weight" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"profile_key" text NOT NULL,
	"dimension" text NOT NULL,
	"score" real DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_profile_key_dimension_pk" PRIMARY KEY("profile_key","dimension")
);
--> statement-breakpoint
ALTER TABLE "preference_events" ADD CONSTRAINT "preference_events_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_dimension_preference_dimensions_slug_fk" FOREIGN KEY ("dimension") REFERENCES "public"."preference_dimensions"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "preference_events_profile_idx" ON "preference_events" USING btree ("profile_key","created_at" DESC NULLS LAST);