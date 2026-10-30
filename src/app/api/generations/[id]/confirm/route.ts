import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generations } from "../../../../../../drizzle/schema";
import { getSession } from "@/lib/auth";
import { copyToImages } from "@/lib/cloudflare";
import { db } from "@/lib/db";
import { submitVideo } from "@/lib/generate/fal";
import { NotConfigured } from "@/lib/generate/polish";
import { findOwned, view } from "@/lib/generate/store";

const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });

/** The user approved the thumbnail: keep it on Cloudflare Images and start the video from it. */
export async function POST(_request: Request, { params }: RouteContext<"/api/generations/[id]/confirm">) {
  const session = await getSession();
  if (!session) return error("Sign in to create videos", 401);

  const { id } = await params;
  const row = await findOwned(id, session.user.id);
  if (!row) return error("Generation not found", 404);

  // Claim the thumbnail so a double click cannot start two paid videos.
  const [claimed] = await db
    .update(generations)
    .set({ status: "generating", videoStartedAt: new Date() })
    .where(and(eq(generations.id, row.id), eq(generations.status, "thumbnail_ready")))
    .returning();
  if (!claimed?.thumbnailUrl || !claimed.polishedPrompt) return error("This thumbnail is not ready to confirm", 409);

  try {
    // The fal URL is temporary, so store the thumbnail permanently before using it.
    const thumbnailUrl = await copyToImages(claimed.thumbnailUrl, `thumbnails/${claimed.id}`);
    const job = await submitVideo(claimed.polishedPrompt, thumbnailUrl);
    const [updated] = await db
      .update(generations)
      .set({ thumbnailUrl, falModel: job.model, falRequestId: job.requestId })
      .where(eq(generations.id, row.id))
      .returning();
    return NextResponse.json(view(updated));
  } catch (e) {
    // Nothing was sent to the video model, so let the user try again.
    await db.update(generations).set({ status: "thumbnail_ready" }).where(eq(generations.id, row.id));
    if (e instanceof NotConfigured) return error("Video creation is not set up yet", 503);
    console.error("Confirming a thumbnail failed", e);
    return error("Could not start your video. Please try again.", 502);
  }
}
