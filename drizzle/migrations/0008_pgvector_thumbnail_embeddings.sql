CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_embedding" vector(512);--> statement-breakpoint
CREATE INDEX "videos_thumbnail_embedding_idx" ON "videos" USING hnsw ("thumbnail_embedding" vector_cosine_ops);
