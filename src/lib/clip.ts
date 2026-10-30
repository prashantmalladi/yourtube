import {
  AutoProcessor,
  AutoTokenizer,
  CLIPTextModelWithProjection,
  CLIPVisionModelWithProjection,
  RawImage,
} from "@huggingface/transformers";

const MODEL = "Xenova/clip-vit-base-patch32";

// Loaded once per process; the first call downloads the weights (cached on disk afterwards).
let loaded: Promise<[Awaited<ReturnType<typeof AutoProcessor.from_pretrained>>, CLIPVisionModelWithProjection]> | undefined;

function load() {
  loaded ??= Promise.all([AutoProcessor.from_pretrained(MODEL), CLIPVisionModelWithProjection.from_pretrained(MODEL)]);
  loaded.catch(() => (loaded = undefined)); // retry on the next call
  return loaded;
}

/** CLIP ViT-B/32 image embedding (512 dims, L2-normalised) of the image at `url`. */
export async function embedThumbnail(url: string): Promise<number[]> {
  const [processor, model] = await load();
  const image = await RawImage.fromURL(url);
  const { image_embeds } = await model(await processor(image));
  const v = Array.from(image_embeds.data as Float32Array);
  const norm = Math.hypot(...v);
  return v.map((x) => x / norm);
}

let loadedText: Promise<[Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>>, CLIPTextModelWithProjection]> | undefined;

function loadText() {
  loadedText ??= Promise.all([AutoTokenizer.from_pretrained(MODEL), CLIPTextModelWithProjection.from_pretrained(MODEL)]);
  loadedText.catch(() => (loadedText = undefined));
  return loadedText;
}

/** CLIP text embedding of a search query, in the same space as embedThumbnail (512 dims, L2-normalised). */
export async function embedText(text: string): Promise<number[]> {
  const [tokenizer, model] = await loadText();
  const { text_embeds } = await model(tokenizer([text], { padding: true, truncation: true }));
  const v = Array.from(text_embeds.data as Float32Array);
  const norm = Math.hypot(...v);
  return v.map((x) => x / norm);
}
