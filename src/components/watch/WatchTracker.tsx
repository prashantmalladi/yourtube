"use client";

import { useEffect } from "react";

const TICK_SECONDS = 5;
const MAX_TICKS = 120; // stop counting after 10 minutes on one page

function send(videoId: string, kind: "view" | "watch") {
  fetch("/api/signals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoId, kind }),
    keepalive: true,
  }).catch(() => {});
}

/** Reports a view when the page opens, then a watch tick for every 5 seconds the tab stays visible. */
export function WatchTracker({ videoId }: { videoId: string }) {
  useEffect(() => {
    // Sent from a timer so React Strict Mode's throwaway first mount never reports.
    const view = setTimeout(() => send(videoId, "view"), 0);
    let visibleSeconds = 0;
    let ticks = 0;
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      visibleSeconds++;
      if (visibleSeconds % TICK_SECONDS === 0 && ticks < MAX_TICKS) {
        ticks++;
        send(videoId, "watch");
      }
    }, 1000);
    return () => {
      clearTimeout(view);
      clearInterval(timer);
    };
  }, [videoId]);

  return null;
}
