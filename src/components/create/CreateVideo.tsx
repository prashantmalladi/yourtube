"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Generation = {
  id: string;
  status: "generating" | "ready" | "failed" | "publishing" | "published";
  videoUrl: string | null;
  title: string;
  description: string;
  hashtags: string[];
  polishedPrompt: string;
  error: string | null;
};

type Phase = "idle" | "working" | "review" | "publishing" | "done";

const POLL_MS = 4000;
/** Give up after this many failed status checks in a row (about a minute). */
const MAX_POLL_ERRORS = 15;

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700";
const primaryButton =
  "rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900";
const secondaryButton =
  "rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800";

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: data.error ?? "Something went wrong" };
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, message: "Network error. Please try again." };
  }
}

export function CreateVideo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  async function refreshUsage() {
    const result = await api<{ remaining: number }>("/api/generations");
    if (result.ok) setRemaining(result.data.remaining);
  }

  useEffect(() => {
    // Load today's allowance once when the page opens.
    let active = true;
    api<{ remaining: number }>("/api/generations").then((result) => {
      if (active && result.ok) setRemaining(result.data.remaining);
    });
    return () => {
      active = false;
    };
  }, []);

  const generationId = generation?.id;

  // While a video is being made, ask the server for progress until it is ready or fails.
  useEffect(() => {
    if (phase !== "working" || !generationId) return;

    let failures = 0;
    let stopped = false;

    const timer = setInterval(async () => {
      const result = await api<Generation>(`/api/generations/${generationId}`);
      if (stopped) return;

      if (!result.ok) {
        if (++failures >= MAX_POLL_ERRORS) {
          setError(result.message);
          setPhase("idle");
        }
        return;
      }
      failures = 0;

      if (result.data.status === "ready") {
        setGeneration(result.data);
        setTitle(result.data.title);
        setPhase("review");
      } else if (result.data.status === "failed") {
        setError(result.data.error ?? "Video generation failed. Please try again.");
        setPhase("idle");
      }
    }, POLL_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [phase, generationId]);

  async function start(body: { prompt: string } | { fromId: string }) {
    setError(null);
    setPhase("working");
    const result = await api<Generation>("/api/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!result.ok) {
      setError(result.message);
      setPhase(generation ? "review" : "idle");
      refreshUsage();
      return;
    }
    setGeneration(result.data);
    refreshUsage();
  }

  async function upload() {
    if (!generation) return;
    setError(null);
    setPhase("publishing");
    const result = await api<{ videoId: string }>(`/api/generations/${generation.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!result.ok) {
      setError(result.message);
      setPhase("review");
      return;
    }
    setPublishedId(result.data.videoId);
    setPhase("done");
  }

  function reset() {
    setGeneration(null);
    setPublishedId(null);
    setPrompt("");
    setTitle("");
    setError(null);
    setPhase("idle");
  }

  const allowance = remaining !== null && (
    <p className="text-xs text-zinc-500">
      {remaining} of your daily videos left today.
    </p>
  );

  const errorBox = error && (
    <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>
  );

  if (phase === "done" && publishedId) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-lg font-semibold">Your video is live! 🎉</p>
        <p className="text-sm text-zinc-500">It can take a few seconds for the thumbnail to appear while it finishes processing.</p>
        <div className="flex gap-3">
          <Link href={`/watch/${publishedId}`} className={primaryButton}>
            Watch it
          </Link>
          <button onClick={reset} className={secondaryButton}>
            Make another
          </button>
        </div>
      </div>
    );
  }

  if (phase === "review" || phase === "publishing") {
    const busy = phase === "publishing";
    return (
      <div className="flex flex-col gap-4">
        {generation?.videoUrl && (
          <video
            src={generation.videoUrl}
            controls
            autoPlay
            muted
            loop
            playsInline
            className="aspect-video w-full rounded-xl bg-black"
          />
        )}

        <label className="flex flex-col gap-1 text-sm font-medium">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className={inputClass} />
        </label>
        <p className="text-sm text-zinc-500">
          {generation?.description} <span className="text-blue-700 dark:text-blue-400">{generation?.hashtags.join(" ")}</span>
        </p>

        {errorBox}
        {allowance}

        <div className="flex flex-wrap gap-3">
          <button onClick={upload} disabled={busy || title.trim().length < 3} className={primaryButton}>
            {busy ? "Uploading…" : "Upload"}
          </button>
          <button onClick={() => generation && start({ fromId: generation.id })} disabled={busy} className={secondaryButton}>
            Regenerate
          </button>
          <button onClick={reset} disabled={busy} className={secondaryButton}>
            Start over
          </button>
        </div>
      </div>
    );
  }

  const working = phase === "working";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start({ prompt });
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        What should the cat do?
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          maxLength={300}
          required
          disabled={working}
          placeholder="A fluffy orange cat chases a butterfly through a sunny garden"
          className={inputClass}
        />
        <span className="text-xs font-normal text-zinc-500">
          Whatever you type, we turn it into a family-friendly video starring a cat, about 10 seconds long.
        </span>
      </label>

      {errorBox}
      {allowance}

      {working ? (
        <p className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          Making your video. This usually takes a few minutes…
        </p>
      ) : (
        <button disabled={prompt.trim().length < 3} className={`${primaryButton} self-start`}>
          Generate
        </button>
      )}
    </form>
  );
}
