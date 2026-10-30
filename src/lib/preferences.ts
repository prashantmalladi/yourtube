import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";
import { getSession } from "./auth";
import { db } from "./db";
import { isUuid } from "./uuid";

/**
 * How taste is learned. Each signal has a weight; the video's thumbnail is scored against every
 * dimension (CLIP similarity, softmaxed over its closest few), and that share of the weight is
 * added to those dimensions. Every signal also shrinks *all* of the viewer's scores a little
 * (DECAY ** weight), so dimensions that are not being reinforced fade slowly.
 */
// A click only shows the thumbnail worked; time spent watching shows the video held attention.
// watch = one 5-second increment, so a full 15s clip (3 ticks) is worth 3x the click.
export const SIGNAL_WEIGHT = { view: 0.5, watch: 0.5 } as const;
export const WATCH_INCREMENT_SECONDS = 5;
const DECAY = 0.98; // per unit of weight: a 0.5-weight signal keeps ~99%
const TOP_DIMENSIONS = 4; // a video boosts at most this many dimensions
const SOFTMAX_SHARPNESS = 100; // CLIP's own logit scale; makes the closest dimension dominate

export type SignalKind = keyof typeof SIGNAL_WEIGHT;
const COOKIE = "yt_profile";

/** Who we are learning about: the signed-in user, else an anonymous browser cookie. */
export async function getProfileKey(opts: { create: boolean }): Promise<string | null> {
  const session = await getSession();
  if (session) return `user:${session.user.id}`;
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing && isUuid(existing)) return `anon:${existing}`;
  if (!opts.create) return null;
  const id = randomUUID();
  jar.set(COOKIE, id, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return `anon:${id}`;
}

/** Records one signal and updates the profile's scores. Returns false if it was ignored. */
export async function recordSignal(profileKey: string, videoId: string, kind: SignalKind): Promise<boolean> {
  if (!isUuid(videoId)) return false;
  const weight = SIGNAL_WEIGHT[kind];

  // Ignore ticks arriving faster than the increment, so a script cannot inflate watch time.
  if (kind === "watch") {
    const recent = await db.execute<{ recent: boolean }>(sql`
      select exists (
        select 1 from preference_events
        where profile_key = ${profileKey} and video_id = ${videoId} and kind = 'watch'
          and created_at > now() - interval '4 seconds'
      ) as recent`);
    if (recent[0].recent) return false;
  }

  const similar = await db.execute<{ slug: string; sim: number }>(sql`
    select d.slug, 1 - (d.embedding <=> v.thumbnail_embedding) as sim
    from videos v, preference_dimensions d
    where v.id = ${videoId} and v.thumbnail_embedding is not null
    order by d.embedding <=> v.thumbnail_embedding
    limit ${TOP_DIMENSIONS}`);
  if (!similar.length) return false; // unknown video, or not embedded yet

  const exps = similar.map((r) => Math.exp(SOFTMAX_SHARPNESS * (r.sim - similar[0].sim)));
  const total = exps.reduce((a, b) => a + b, 0);
  const boosts = similar.map((r, i) => ({ slug: r.slug, boost: (weight * exps[i]) / total }));

  await db.transaction(async (tx) => {
    // Fade everything, then add this signal's boost on top.
    await tx.execute(sql`
      update user_preferences set score = score * ${DECAY ** weight}, updated_at = now()
      where profile_key = ${profileKey}`);
    for (const { slug, boost } of boosts) {
      await tx.execute(sql`
        insert into user_preferences (profile_key, dimension, score)
        values (${profileKey}, ${slug}, ${boost})
        on conflict (profile_key, dimension)
        do update set score = user_preferences.score + excluded.score, updated_at = now()`);
    }
    await tx.execute(sql`
      insert into preference_events (profile_key, video_id, kind, weight)
      values (${profileKey}, ${videoId}, ${kind}, ${weight})`);
  });
  return true;
}

export async function resetProfile(profileKey: string) {
  await db.execute(sql`delete from user_preferences where profile_key = ${profileKey}`);
  await db.execute(sql`delete from preference_events where profile_key = ${profileKey}`);
}

/** A profile's strongest interests, highest first. Empty until something has been learned. */
export async function getTopDimensions(profileKey: string, n = 3) {
  const rows = await db.execute<{ slug: string; label: string; score: number }>(sql`
    select p.dimension as slug, d.label, p.score::float as score
    from user_preferences p join preference_dimensions d on d.slug = p.dimension
    where p.profile_key = ${profileKey} and p.score > 0.0005
    order by p.score desc limit ${n}`);
  return [...rows];
}

export type PreferenceRow = { slug: string; label: string; kind: string; score: number };
export type EventRow = { title: string; kind: string; weight: number; createdAt: Date };

/** Everything the system knows about a profile: every dimension with its score, plus recent signals. */
export async function getProfileDebug(profileKey: string) {
  const dimensions = await db.execute<PreferenceRow>(sql`
    select d.slug, d.label, d.kind, coalesce(p.score, 0)::float as score
    from preference_dimensions d
    left join user_preferences p on p.dimension = d.slug and p.profile_key = ${profileKey}
    order by score desc, d.label`);
  const events = await db.execute<EventRow>(sql`
    select v.title, e.kind, e.weight::float as weight, e.created_at as "createdAt"
    from preference_events e join videos v on v.id = e.video_id
    where e.profile_key = ${profileKey}
    order by e.created_at desc limit 25`);
  return { dimensions: [...dimensions], events: [...events] };
}
