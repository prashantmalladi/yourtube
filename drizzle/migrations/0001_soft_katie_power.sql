DELETE FROM "comments";--> statement-breakpoint
DELETE FROM "videos";--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "section" text NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "position" integer NOT NULL;