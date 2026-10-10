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
  return {
    playerUrl: `${host}/${uid}/iframe`,
    // Stream makes this frame itself; it 404s for a few seconds while the video is processed.
    thumbnailUrl: `${host}/${uid}/thumbnails/thumbnail.jpg?time=1s`,
  };
}
