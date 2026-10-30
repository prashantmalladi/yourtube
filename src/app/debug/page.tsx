import { DebugControls } from "@/components/debug/DebugControls";
import { getProfileDebug, getProfileKey, SIGNAL_WEIGHT, WATCH_INCREMENT_SECONDS } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const profileKey = await getProfileKey({ create: false });
  const { dimensions, events } = profileKey ? await getProfileDebug(profileKey) : { dimensions: [], events: [] };
  const max = Math.max(...dimensions.map((d) => d.score), 0);
  const active = dimensions.filter((d) => d.score > 0.0005);
  const total = dimensions.reduce((sum, d) => sum + d.score, 0);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">What the system knows about you</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Profile: <code>{profileKey ?? "none yet (watch a video first)"}</code>
          </p>
        </div>
        <DebugControls />
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Opening a video adds {SIGNAL_WEIGHT.view} point; every {WATCH_INCREMENT_SECONDS} seconds you keep watching adds{" "}
        {SIGNAL_WEIGHT.watch}. Points go to the dimensions closest to the video&apos;s thumbnail, and every signal
        also shrinks all your scores slightly, so interests you stop feeding fade.
      </p>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Interests ({active.length} of {dimensions.length} active)
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing learned yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {active.map((d) => (
              <li key={d.slug} className="grid grid-cols-[10rem_1fr_7rem] items-center gap-3 text-sm">
                <span className="truncate text-zinc-900 dark:text-zinc-100">
                  {d.label} <span className="text-xs text-zinc-400">{d.kind}</span>
                </span>
                <span className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span
                    className="block h-3 rounded-full bg-red-500"
                    style={{ width: `${Math.max(2, (d.score / max) * 100)}%` }}
                  />
                </span>
                <span className="text-right tabular-nums text-zinc-500">
                  {d.score.toFixed(3)} · {Math.round((d.score / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent signals</h2>
        {events.length === 0 ? (
          <p className="text-sm text-zinc-500">None.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {events.map((e, i) => (
              <li key={i} className="flex justify-between gap-3 text-zinc-700 dark:text-zinc-300">
                <span className="truncate">
                  <span className="mr-2 rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">{e.kind}</span>
                  {e.title}
                </span>
                <span className="shrink-0 tabular-nums text-zinc-500">
                  +{e.weight} · {new Date(e.createdAt).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {active.length < dimensions.length && dimensions.length > 0 && (
        <details className="text-sm text-zinc-500">
          <summary className="cursor-pointer">Inactive dimensions ({dimensions.length - active.length})</summary>
          <p className="mt-2">{dimensions.filter((d) => d.score <= 0.0005).map((d) => d.label).join(", ")}</p>
        </details>
      )}
    </div>
  );
}
