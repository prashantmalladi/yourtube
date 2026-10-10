import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { generations } from "../../../../../../drizzle/schema";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { publishGeneration } from "@/lib/generate/publish";
import { findOwned } from "@/lib/generate/store";

const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });

/** Publishes a finished generation so everyone can watch it. Optional body: { title }. */
export async function POST(request: Request, { params }: RouteContext<"/api/generations/[id]/publish">) {
  const session = await getSession();
  if (!session) return error("Sign in to create videos", 401);

  const { id } = await params;
  const row = await findOwned(id, session.user.id);
  if (!row) return error("Generation not found", 404);

  const body = (await request.json().catch(() => null)) as { title?: unknown } | null;
  const title = (typeof body?.title === "string" ? body.title.trim() : (row.title ?? "")).slice(0, 100);
  if (title.length < 3) return error("Give your video a title", 400);

  // Claim the generation so a double click cannot publish it twice.
  const [claimed] = await db
    .update(generations)
    .set({ status: "publishing" })
    .where(and(eq(generations.id, row.id), eq(generations.status, "ready")))
    .returning();
  if (!claimed?.videoUrl) return error("This video is not ready to upload", 409);

  try {
    const videoId = await publishGeneration(
      { videoUrl: claimed.videoUrl, description: claimed.description ?? "", hashtags: claimed.hashtags ?? [] },
      title,
      { id: session.user.id, name: session.user.name }
    );
    await db.update(generations).set({ status: "published", videoId, title }).where(eq(generations.id, row.id));
    revalidatePath("/", "layout");
    return NextResponse.json({ videoId });
  } catch (e) {
    console.error("Publishing a generation failed", e);
    await db.update(generations).set({ status: "ready" }).where(eq(generations.id, row.id));
    return error("Could not upload your video. Please try again.", 502);
  }
}
