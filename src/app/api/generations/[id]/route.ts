import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generations } from "../../../../../drizzle/schema";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkVideo } from "@/lib/generate/fal";
import { NotConfigured } from "@/lib/generate/polish";
import { STALE_AFTER_MS, findOwned, view } from "@/lib/generate/store";

/** Current state of a generation. While it is running, this also asks fal how it is getting on. */
export async function GET(_request: Request, { params }: RouteContext<"/api/generations/[id]">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to create videos" }, { status: 401 });

  const { id } = await params;
  const row = await findOwned(id, session.user.id);
  if (!row) return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  if (row.status !== "generating" || !row.falModel || !row.falRequestId) return NextResponse.json(view(row));

  try {
    const result = await checkVideo(row.falModel, row.falRequestId);
    const stale = Date.now() - row.createdAt.getTime() > STALE_AFTER_MS;

    const patch =
      result.state === "done"
        ? { status: "ready", videoUrl: result.url }
        : result.state === "failed"
          ? { status: "failed", error: result.error }
          : stale
            ? { status: "failed", error: "Timed out while making your video" }
            : null;

    if (!patch) return NextResponse.json(view(row));
    const [updated] = await db.update(generations).set(patch).where(eq(generations.id, row.id)).returning();
    return NextResponse.json(view(updated));
  } catch (e) {
    if (e instanceof NotConfigured) {
      return NextResponse.json({ error: "Video creation is not set up yet" }, { status: 503 });
    }
    console.error("Checking a generation failed", e);
    return NextResponse.json({ error: "Could not check your video yet" }, { status: 502 });
  }
}
