/**
 * Embeds every video thumbnail with CLIP (ViT-B/32, 512 dims, runs locally) and stores the
 * L2-normalised vector in videos.thumbnail_embedding. Text queries embedded with the same
 * model's text tower land in the same space, so `<=>` (cosine) ranks thumbnails by text.
 *
 *   npx tsx scripts/embed-thumbnails.ts          embed videos that have no embedding yet
 *   npx tsx scripts/embed-thumbnails.ts --all    re-embed everything
 */
import { eq, isNull, and, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from "@huggingface/transformers";
import { videos } from "../drizzle/schema";

process.loadEnvFile(".env");

const MODEL = "Xenova/clip-vit-base-patch32";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

async function main() {
  const all = process.argv.includes("--all");
  const rows = await db
    .select({ id: videos.id, url: videos.thumbnailUrl })
    .from(videos)
    .where(all ? isNotNull(videos.thumbnailUrl) : and(isNotNull(videos.thumbnailUrl), isNull(videos.thumbnailEmbedding)));
  console.log(`${rows.length} thumbnails to embed`);
  if (!rows.length) return;

  const processor = await AutoProcessor.from_pretrained(MODEL);
  const model = await CLIPVisionModelWithProjection.from_pretrained(MODEL);

  for (const row of rows) {
    const image = await RawImage.fromURL(row.url!);
    const { image_embeds } = await model(await processor(image));
    const v = Array.from(image_embeds.data as Float32Array);
    const norm = Math.hypot(...v);
    await db
      .update(videos)
      .set({ thumbnailEmbedding: v.map((x) => x / norm) })
      .where(eq(videos.id, row.id));
    console.log(`${row.id} embedded (${v.length} dims)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
