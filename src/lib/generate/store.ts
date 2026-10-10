import { and, eq, gte, inArray, isNull, ne, not, sql } from "drizzle-orm";
import { generations } from "../../../drizzle/schema";
import { db } from "../db";
import { isUuid } from "../uuid";

export const DAILY_LIMIT = Number(process.env.DAILY_GENERATION_LIMIT ?? 5);
/** Refused ideas and failed starts do not use up a slot, but this caps how many a user can try. */
const MAX_ATTEMPTS = DAILY_LIMIT * 4;
/** A job still unfinished after this long is treated as failed. */
export const STALE_AFTER_MS = 15 * 60 * 1000;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export type GenerationRow = typeof generations.$inferSelect;

export function view(row: GenerationRow) {
  return {
    id: row.id,
    status: row.status,
    videoUrl: row.videoUrl,
    title: row.title ?? "",
    description: row.description ?? "",
    hashtags: row.hashtags ?? [],
    polishedPrompt: row.polishedPrompt ?? "",
    error: row.error,
    videoId: row.videoId,
  };
}

/** The generation with this id, only if it belongs to the user. */
export async function findOwned(id: string, userId: string): Promise<GenerationRow | undefined> {
  if (!isUuid(id)) return undefined;
  const [row] = await db
    .select()
    .from(generations)
    .where(and(eq(generations.id, id), eq(generations.userId, userId)));
  return row;
}

export type Reservation =
  | { ok: true; row: GenerationRow }
  | { ok: false; reason: "busy" | "limit" | "attempts" };

/**
 * Records the start of an attempt and enforces the limits in one step.
 *
 * The count and the insert run in a single transaction holding a per-user lock, so two
 * requests sent at the same moment cannot both squeeze in under the limit. The row is
 * written before any paid call is made, so spend is always recorded, even if the server
 * crashes halfway through.
 *
 * A slot is used by every attempt except refused ideas and starts that failed before
 * anything was sent to fal (the user should not pay for our errors).
 */
export async function reserveAttempt(userId: string, prompt: string): Promise<Reservation> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

    const since = new Date(Date.now() - WINDOW_MS);
    const mine = and(eq(generations.userId, userId), gte(generations.createdAt, since));

    const [{ attempts }] = await tx.select({ attempts: sql<number>`count(*)::int` }).from(generations).where(mine);
    const [{ used }] = await tx
      .select({ used: sql<number>`count(*)::int` })
      .from(generations)
      .where(
        and(
          mine,
          ne(generations.status, "rejected"),
          not(and(eq(generations.status, "failed"), isNull(generations.falRequestId))!)
        )
      );
    const [{ running }] = await tx
      .select({ running: sql<number>`count(*)::int` })
      .from(generations)
      .where(
        and(
          inArray(generations.status, ["starting", "generating"]),
          eq(generations.userId, userId),
          gte(generations.createdAt, new Date(Date.now() - STALE_AFTER_MS))
        )
      );

    if (running > 0) return { ok: false, reason: "busy" } as const;
    if (used >= DAILY_LIMIT) return { ok: false, reason: "limit" } as const;
    if (attempts >= MAX_ATTEMPTS) return { ok: false, reason: "attempts" } as const;

    const [row] = await tx.insert(generations).values({ userId, prompt, status: "starting" }).returning();
    return { ok: true, row } as const;
  });
}

/** How many slots a user has used in the last 24 hours (same rule as reserveAttempt). */
export async function usedToday(userId: string): Promise<number> {
  const [{ used }] = await db
    .select({ used: sql<number>`count(*)::int` })
    .from(generations)
    .where(
      and(
        eq(generations.userId, userId),
        gte(generations.createdAt, new Date(Date.now() - WINDOW_MS)),
        ne(generations.status, "rejected"),
        not(and(eq(generations.status, "failed"), isNull(generations.falRequestId))!)
      )
    );
  return used;
}
