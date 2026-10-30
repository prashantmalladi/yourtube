type ImagesResponse = {
  success?: boolean;
  errors?: { message?: string }[];
  result?: { variants?: string[] };
};

/**
 * Copies an image from a URL into Cloudflare Images under the given id and returns its public URL.
 * Safe to repeat: if the id already exists, the stored image's URL is returned.
 */
export async function copyToImages(url: string, id: string) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !token) throw new Error("Cloudflare credentials are not set");

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${account}/images/v1`;
  const headers = { Authorization: `Bearer ${token}` };
  const form = new FormData();
  form.set("url", url);
  form.set("id", id);

  const res = await fetch(endpoint, { method: "POST", headers, body: form });
  const body = (await res.json()) as ImagesResponse;
  if (body.success && body.result?.variants?.[0]) return body.result.variants[0];

  const existing = await fetch(`${endpoint}/${id}`, { headers });
  const stored = (await existing.json().catch(() => ({}))) as ImagesResponse;
  const variant = stored.result?.variants?.[0];
  if (existing.ok && stored.success && variant) return variant;
  throw new Error(`Cloudflare Images upload failed: ${body.errors?.[0]?.message ?? res.status}`);
}

const READY_TIMEOUT_MS = 120_000;

/** Asks Cloudflare Stream to fetch a video from a URL, so the server never handles the file itself. */
export async function copyToStream(url: string, name: string) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !token) throw new Error("Cloudflare credentials are not set");

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/stream/copy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, meta: { name } }),
  });
  const body = (await res.json()) as {
    success: boolean;
    errors: unknown[];
    result?: { uid: string; playback?: { hls: string } };
  };
  if (!body.success || !body.result?.playback) {
    throw new Error(`Cloudflare Stream copy failed: ${JSON.stringify(body.errors)}`);
  }

  const host = new URL(body.result.playback.hls).origin;
  const { uid } = body.result;

  // The copy returns straight away, but the player says "video not found" until Stream has processed the file.
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const status = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/stream/${uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const state = (await status.json().catch(() => ({}))) as {
      result?: { readyToStream?: boolean; status?: { state?: string; errorReasonText?: string } };
    };
    if (state.result?.status?.state === "error") {
      throw new Error(`Cloudflare Stream could not process the video: ${state.result.status.errorReasonText}`);
    }
    if (state.result?.readyToStream) break;
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  return {
    playerUrl: `${host}/${uid}/iframe`,
    // Stream makes this frame itself; it 404s for a few seconds while the video is processed.
    thumbnailUrl: `${host}/${uid}/thumbnails/thumbnail.jpg?time=1s`,
  };
}
