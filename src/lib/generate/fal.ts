import { fal } from "@fal-ai/client";
import { NotConfigured } from "./polish";

export const FAL_MODEL = process.env.FAL_VIDEO_MODEL ?? "alibaba/wan-3.0/text-to-video";

// Wan 3.0 bills per second by resolution: 480p $0.05, 720p $0.10, 1080p $0.20 (so $0.50 for a 480p clip).
const RESOLUTION = process.env.FAL_VIDEO_RESOLUTION ?? "480p";

/** Models take slightly different inputs, so build them per model family. */
function inputFor(model: string, prompt: string) {
  if (model.includes("wan-3.0")) {
    return {
      prompt,
      duration: 10,
      resolution: RESOLUTION,
      aspect_ratio: "16:9",
      audio: false,
      // The prompt was already polished by OpenRouter, and expansion adds up to a minute of waiting.
      enable_prompt_expansion: false,
      // fal's own input and output moderation; keep it on.
      enable_safety_checker: true,
    };
  }
  // Kling and similar: duration is a string.
  return { prompt, duration: "10", aspect_ratio: "16:9" };
}

function configure() {
  const key = process.env.FAL_KEY;
  if (!key) throw new NotConfigured("FAL_KEY is not set");
  fal.config({ credentials: key });
}

/** Queues a 10 second video and returns the model and request id needed to check on it later. */
export async function submitVideo(prompt: string) {
  configure();
  const { request_id } = await fal.queue.submit(FAL_MODEL, {
    input: inputFor(FAL_MODEL, prompt),
  });
  return { model: FAL_MODEL, requestId: request_id };
}

export type VideoState =
  | { state: "pending" }
  | { state: "done"; url: string }
  | { state: "failed"; error: string };

export async function checkVideo(model: string, requestId: string): Promise<VideoState> {
  configure();
  const status = await fal.queue.status(model, { requestId });
  if (status.status !== "COMPLETED") return { state: "pending" };

  try {
    const result = await fal.queue.result(model, { requestId });
    const url = (result.data as { video?: { url?: string } }).video?.url;
    return url ? { state: "done", url } : { state: "failed", error: "The model returned no video" };
  } catch (error) {
    return { state: "failed", error: error instanceof Error ? error.message : "Video generation failed" };
  }
}
