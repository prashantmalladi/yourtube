import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generations } from "../../../../drizzle/schema";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitVideo } from "@/lib/generate/fal";
import { MAX_IDEA_LENGTH, NotConfigured, polishIdea } from "@/lib/generate/polish";
import { DAILY_LIMIT, findOwned, reserveAttempt, usedToday, view } from "@/lib/generate/store";

const error = (message: string, status: number, extra: object = {}) =>
  NextResponse.json({ error: message, ...extra }, { status });

/** How much of today's allowance the signed-in user has used. */
export async function GET() {
  const session = await getSession();
  if (!session) return error("Sign in to create videos", 401);
  const used = await usedToday(session.user.id);
  return NextResponse.json({ used, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used) });
}

/**
 * Starts a video. Send { prompt } for a new idea, or { fromId } to regenerate an
 * earlier generation of yours with the same polished prompt.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return error("Sign in to create videos", 401);

  const body = (await request.json().catch(() => null)) as { prompt?: unknown; fromId?: unknown } | null;

  // Work out what we are generating from, and validate it, before using up a slot.
  let source: Awaited<ReturnType<typeof findOwned>>;
  let idea = "";
  if (typeof body?.fromId === "string") {
    source = await findOwned(body.fromId, session.user.id);
    if (!source?.polishedPrompt || !source.title) return error("Generation not found", 404);
    idea = source.prompt;
  } else {
    idea = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (idea.length < 3) return error("Describe the video you want in a few words", 400);
    if (idea.length > MAX_IDEA_LENGTH) return error(`Keep it under ${MAX_IDEA_LENGTH} characters`, 400);
  }

  const reservation = await reserveAttempt(session.user.id, idea);
  if (!reservation.ok) {
    if (reservation.reason === "busy") {
      return error("Your previous video is still being made. Please wait for it to finish.", 409);
    }
    if (reservation.reason === "limit") {
      return error(`You can generate ${DAILY_LIMIT} videos per day. Try again tomorrow.`, 429);
    }
    return error("Too many attempts today. Try again tomorrow.", 429);
  }
  const { row } = reservation;

  const finish = (patch: Partial<typeof generations.$inferInsert>) =>
    db.update(generations).set(patch).where(eq(generations.id, row.id)).returning();

  try {
    const polished = source
      ? {
          prompt: source.polishedPrompt!,
          title: source.title!,
          description: source.description ?? "",
          hashtags: source.hashtags ?? [],
        }
      : await polishIdea(idea);

    // Keep what the model produced even if the video step fails below.
    await finish({
      polishedPrompt: polished.prompt,
      title: polished.title,
      description: polished.description,
      hashtags: polished.hashtags,
    });

    const job = await submitVideo(polished.prompt);
    const [updated] = await finish({ falModel: job.model, falRequestId: job.requestId, status: "generating" });
    return NextResponse.json(view(updated), { status: 201 });
  } catch (e) {
    if (e instanceof NotConfigured) {
      await finish({ status: "failed", error: e.message });
      return error("Video creation is not set up yet", 503);
    }
    console.error("Starting a generation failed", e);
    await finish({ status: "failed", error: e instanceof Error ? e.message : "Unknown error" });
    return error("Could not start your video. Please try again.", 502);
  }
}
