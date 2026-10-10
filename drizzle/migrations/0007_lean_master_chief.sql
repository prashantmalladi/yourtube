ALTER TABLE "generations" ALTER COLUMN "polished_prompt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "generations" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "generations" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "generations" ALTER COLUMN "hashtags" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "generations" ALTER COLUMN "fal_model" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "generations" ALTER COLUMN "fal_request_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "generations" ALTER COLUMN "status" SET DEFAULT 'starting';