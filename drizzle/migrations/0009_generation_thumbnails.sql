ALTER TABLE "generations" ADD COLUMN "fal_image_request_id" text;--> statement-breakpoint
ALTER TABLE "generations" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "generations" ADD COLUMN "video_started_at" timestamp with time zone;