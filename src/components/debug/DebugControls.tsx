"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function DebugControls() {
  const router = useRouter();
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(timer);
  }, [auto, router]);

  const button =
    "rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700";

  return (
    <div className="flex gap-2">
      <button className={button} onClick={() => setAuto(!auto)}>
        Auto-refresh: {auto ? "on" : "off"}
      </button>
      <button className={button} onClick={() => router.refresh()}>
        Refresh
      </button>
      <button
        className={button}
        onClick={async () => {
          if (!confirm("Forget everything learned about you?")) return;
          await fetch("/api/signals", { method: "DELETE" });
          router.refresh();
        }}
      >
        Reset my profile
      </button>
    </div>
  );
}
