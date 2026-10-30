import { NextResponse } from "next/server";
import { getProfileKey, recordSignal, resetProfile, SIGNAL_WEIGHT, type SignalKind } from "@/lib/preferences";

/** Body: { videoId, kind: "view" | "watch" }. "watch" is one 5-second increment of watch time. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { videoId?: unknown; kind?: unknown } | null;
  const kind = body?.kind;
  if (typeof body?.videoId !== "string" || typeof kind !== "string" || !(kind in SIGNAL_WEIGHT)) {
    return NextResponse.json({ error: "Expected { videoId, kind: 'view' | 'watch' }" }, { status: 400 });
  }
  const profileKey = await getProfileKey({ create: true });
  const recorded = await recordSignal(profileKey!, body.videoId, kind as SignalKind);
  return NextResponse.json({ recorded });
}

/** Forgets everything learned about the caller. */
export async function DELETE() {
  const profileKey = await getProfileKey({ create: false });
  if (profileKey) await resetProfile(profileKey);
  return NextResponse.json({ ok: true });
}
