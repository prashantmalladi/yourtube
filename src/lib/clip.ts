// transformers.js pulls in a native runtime (onnxruntime-node), so it is imported lazily: only the
// callers that embed something (search, publish) load it; every other page stays unaffected.
const MODEL = "Xenova/clip-vit-base-patch32";

async function transformers() {
  const lib = await import("@huggingface/transformers");
  // Serverless filesystems are read-only except /tmp.
  if (process.env.VERCEL) lib.env.cacheDir = "/tmp/transformers-cache";
  return lib;
}

// Each model is loaded once per process; the first call downloads the weights (cached afterwards).
let vision: Promise<{ processor: unknown; model: unknown }> | undefined;
let text: Promise<{ tokenizer: unknown; model: unknown }> | undefined;

function loadVision() {
  vision ??= transformers()
    .then(async (t) => ({
      processor: await t.AutoProcessor.from_pretrained(MODEL),
      model: await t.CLIPVisionModelWithProjection.from_pretrained(MODEL),
    }))
    .catch((e) => {
      vision = undefined; // retry on the next call
      throw e;
    });
  return vision;
}

function loadText() {
  text ??= transformers()
    .then(async (t) => ({
      tokenizer: await t.AutoTokenizer.from_pretrained(MODEL),
      model: await t.CLIPTextModelWithProjection.from_pretrained(MODEL),
    }))
    .catch((e) => {
      text = undefined;
      throw e;
    });
  return text;
}

function normalise(data: Float32Array): number[] {
  const v = Array.from(data);
  const norm = Math.hypot(...v);
  return v.map((x) => x / norm);
}

/** CLIP ViT-B/32 image embedding (512 dims, L2-normalised) of the image at `url`. */
export async function embedThumbnail(url: string): Promise<number[]> {
  const { RawImage } = await transformers();
  const { processor, model } = await loadVision();
  const image = await RawImage.fromURL(url);
  type Fn = (input: unknown) => Promise<unknown>;
  const { image_embeds } = (await (model as Fn)(await (processor as Fn)(image))) as {
    image_embeds: { data: Float32Array };
  };
  return normalise(image_embeds.data);
}

/** CLIP text embedding of a search query, in the same space as embedThumbnail (512 dims, L2-normalised). */
export async function embedText(query: string): Promise<number[]> {
  const { tokenizer, model } = await loadText();
  type Fn = (input: unknown, opts?: unknown) => unknown;
  const inputs = (tokenizer as Fn)([query], { padding: true, truncation: true });
  const { text_embeds } = (await (model as Fn)(inputs)) as { text_embeds: { data: Float32Array } };
  return normalise(text_embeds.data);
}
