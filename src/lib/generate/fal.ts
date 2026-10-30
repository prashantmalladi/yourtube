import { fal } from "@fal-ai/client";
import { NotConfigured } from "./polish";

export const FAL_IMAGE_MODEL = process.env.FAL_IMAGE_MODEL ?? "openai/gpt-image-2";
/** The video is animated from the confirmed thumbnail, so this must be an image-to-video model. */
export const FAL_VIDEO_MODEL = process.env.FAL_IMAGE_TO_VIDEO_MODEL ?? "minimax/h3-max-turbo/image-to-video";

/** Length of the generated clip, shown on the video once it is published. */
export const VIDEO_SECONDS = 15;
export const VIDEO_DURATION = `0:${VIDEO_SECONDS}`;

function configure() {
  const key = process.env.FAL_KEY;
  if (!key) throw new NotConfigured("FAL_KEY is not set");
  fal.config({ credentials: key });
}

/** Rendering the thumbnail is cheap, so keep the quality low. */
function imagePrompt(scene: string) {
  return [
    "Photorealistic 16:9 YouTube thumbnail of a real cat.",
    `Scene: ${scene}`,
    "One clear subject, bright natural light, no text, no letters, no logo, no watermark.",
  ].join(" ");
}

/** Queues a thumbnail and returns the request id needed to check on it later. */
export async function submitThumbnail(scene: string) {
  configure();
  const { request_id } = await fal.queue.submit(FAL_IMAGE_MODEL, {
    input: {
      prompt: imagePrompt(scene),
      image_size: { width: 1280, height: 720 },
      quality: "low",
      num_images: 1,
      output_format: "jpeg",
    },
  });
  return { model: FAL_IMAGE_MODEL, requestId: request_id };
}

/** Queues the video, starting from the confirmed thumbnail. */
export async function submitVideo(prompt: string, imageUrl: string) {
  configure();
  const { request_id } = await fal.queue.submit(FAL_VIDEO_MODEL, {
    input: {
      prompt,
      image_url: imageUrl,
      duration: VIDEO_SECONDS,
      resolution: "768P",
      // The prompt was already polished by OpenRouter.
      prompt_expansion_mode: "disabled",
    },
  });
  return { model: FAL_VIDEO_MODEL, requestId: request_id };
}

export type JobState<T> =
  | { state: "pending" }
  | { state: "done"; url: T }
  | { state: "failed"; error: string };

async function check(
  model: string,
  requestId: string,
  pick: (data: unknown) => string | undefined,
  empty: string
): Promise<JobState<string>> {
  configure();
  const status = await fal.queue.status(model, { requestId });
  if (status.status !== "COMPLETED") return { state: "pending" };

  try {
    const result = await fal.queue.result(model, { requestId });
    const url = pick(result.data);
    return url ? { state: "done", url } : { state: "failed", error: empty };
  } catch (error) {
    return { state: "failed", error: error instanceof Error ? error.message : "Generation failed" };
  }
}

export function checkThumbnail(model: string, requestId: string) {
  return check(
    model,
    requestId,
    (data) => (data as { images?: { url?: string }[] }).images?.[0]?.url,
    "The model returned no image"
  );
}

export function checkVideo(model: string, requestId: string) {
  return check(model, requestId, (data) => (data as { video?: { url?: string } }).video?.url, "The model returned no video");
}
