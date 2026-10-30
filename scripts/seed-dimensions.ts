/**
 * Creates the taste dimensions used for user preferences and embeds each one with CLIP's text
 * tower, so any thumbnail embedding can be scored against them. Safe to re-run (upserts).
 * Reports which dimensions no current video lands in, so the list can be tuned to the catalogue.
 *
 *   npx tsx scripts/seed-dimensions.ts
 */
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { preferenceDimensions } from "../drizzle/schema";
import { embedText } from "../src/lib/clip";

process.loadEnvFile(".env");

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

type Kind = "style" | "genre" | "subject" | "mood" | "setting";
// [slug, label, kind, CLIP prompt]
const DIMENSIONS: [string, string, Kind, string][] = [
  // Visual styles
  ["claymation", "Claymation", "style", "a claymation stop-motion scene made of clay"],
  ["pixel-art", "Pixel art", "style", "pixel art, 8-bit retro video game graphics"],
  ["anime", "Anime", "style", "an anime illustration with big expressive eyes"],
  ["film-noir", "Film noir", "style", "a black and white film noir scene with dramatic shadows"],
  ["cyberpunk", "Cyberpunk", "style", "a cyberpunk scene with neon lights and rain"],
  ["cardboard-craft", "Cardboard & miniatures", "style", "a handmade cardboard miniature diorama"],
  ["3d-cartoon", "3D cartoon", "style", "a 3D animated cartoon in the style of a Pixar movie"],
  ["watercolor", "Watercolor", "style", "a soft watercolor painting"],
  ["comic-book", "Comic book", "style", "a comic book panel with bold ink outlines"],
  ["retro-vintage", "Retro & vintage", "style", "a vintage retro photograph with faded colours"],
  ["black-white", "Black & white", "style", "a black and white monochrome image"],
  ["vibrant-colors", "Vibrant colours", "style", "a bright, colourful, saturated image"],
  ["dark-moody", "Dark & moody", "style", "a dark, moody, low-key image"],
  ["warm-golden", "Warm golden light", "style", "warm golden sunlight, cozy glow"],
  ["extreme-closeup", "Close-ups", "style", "an extreme close-up portrait"],
  ["lowpoly-3d", "Low-poly 3D", "style", "a low-poly 3D render"],
  ["paper-cutout", "Paper cut-out", "style", "layered paper cut-out art"],
  ["felt-plush", "Felt & plush", "style", "a soft felt and plush toy scene"],
  ["photoreal", "Photorealistic", "style", "a photorealistic photograph"],
  ["painterly-fantasy", "Painterly fantasy", "style", "a hand-painted storybook illustration, Studio Ghibli style"],

  // Genres
  ["action", "Action", "genre", "an action movie scene with an explosion and a chase"],
  ["detective-mystery", "Detective & mystery", "genre", "a detective in a trench coat solving a mystery"],
  ["sci-fi", "Sci-fi", "genre", "a science fiction scene with futuristic technology"],
  ["space-adventure", "Space", "genre", "an astronaut in outer space with stars and planets"],
  ["fantasy-magic", "Fantasy & magic", "genre", "a fantasy scene with a wizard, magic spells and glowing potions"],
  ["horror-spooky", "Spooky", "genre", "a spooky haunted scene at night"],
  ["comedy", "Comedy", "genre", "a funny comedy scene with a silly expression"],
  ["adventure", "Adventure", "genre", "an adventurer exploring a jungle or mountain"],
  ["western", "Western", "genre", "a cowboy in the wild west desert"],
  ["superhero", "Superhero", "genre", "a superhero in a cape flying over a city"],
  ["heist-spy", "Heist & spy", "genre", "a secret agent spy sneaking through a high-tech vault"],
  ["romance", "Romance", "genre", "a romantic scene with hearts and a sunset"],
  ["fairy-tale", "Fairy tale", "genre", "a fairy tale castle and storybook characters"],
  ["monster-kaiju", "Giants & monsters", "genre", "a giant monster stomping through a city"],
  ["sports-competition", "Sports & competition", "genre", "an athlete winning a competition on a podium"],
  ["music-performance", "Music & performance", "genre", "a musician playing drums or guitar on stage"],
  ["gaming", "Video games", "genre", "a video game screen with a health bar and score"],
  ["tutorial-howto", "How-to & tutorials", "genre", "a step by step tutorial demonstrating how to do something"],
  ["documentary", "Documentary", "genre", "a documentary style nature film"],
  ["vlog-daily", "Daily life vlog", "genre", "a vlog about a day in the life"],

  // Subjects
  ["cats", "Cats", "subject", "a cat"],
  ["kittens", "Kittens", "subject", "a tiny fluffy kitten"],
  ["dogs", "Dogs", "subject", "a dog"],
  ["puppies", "Puppies", "subject", "a cute puppy"],
  ["orange-cat", "Orange cats", "subject", "a fluffy orange tabby cat"],
  ["black-cat", "Black cats", "subject", "a black cat with yellow eyes"],
  ["calico-cat", "Calico cats", "subject", "a calico cat with patches of colour"],
  ["cooking-baking", "Cooking & baking", "subject", "a chef cooking or baking in a kitchen"],
  ["food-treats", "Food & treats", "subject", "delicious food, cake and treats on a plate"],
  ["science-lab", "Science & labs", "subject", "a scientist in a lab coat with beakers and experiments"],
  ["books-library", "Books & libraries", "subject", "a cozy library with stacks of books"],
  ["fish-seafood", "Fish", "subject", "a fish or tuna"],
  ["birthday-party", "Parties", "subject", "a birthday party with a party hat and balloons"],
  ["flowers-nature", "Flowers & nature", "subject", "a meadow of flowers with butterflies"],
  ["rocket-vehicles", "Rockets & vehicles", "subject", "a rocket ship blasting off"],
  ["computers-tech", "Computers & tech", "subject", "a laptop and keyboard on a desk"],
  ["toys-play", "Toys & play", "subject", "toys and a red laser dot to chase"],
  ["costumes-hats", "Costumes & hats", "subject", "an animal wearing a costume, hat or goggles"],

  // Moods
  ["cozy", "Cozy", "mood", "a cozy, warm, comfortable scene"],
  ["relaxing-calm", "Relaxing", "mood", "a calm, peaceful, relaxing scene"],
  ["lofi-chill", "Lo-fi chill", "mood", "a lo-fi chill aesthetic of a sleepy room at night"],
  ["cute-wholesome", "Cute & wholesome", "mood", "an adorable, wholesome, heart-warming image"],
  ["dramatic", "Dramatic", "mood", "a dramatic, intense, cinematic scene"],
  ["mischief-chaos", "Mischief & chaos", "mood", "a mischievous animal causing chaos and a mess"],
  ["grumpy", "Grumpy", "mood", "a grumpy, unamused face"],
  ["sleepy-nap", "Naps", "mood", "a sleeping animal taking a nap"],
  ["satisfying", "Satisfying", "mood", "an oddly satisfying smooth melting scene"],
  ["whimsical", "Whimsical", "mood", "a whimsical, quirky, imaginative scene"],

  // Settings
  ["rainy-night", "Rainy nights", "setting", "a rainy window at night"],
  ["neon-city", "Neon city", "setting", "a neon-lit city street at night"],
  ["kitchen", "Kitchens", "setting", "the inside of a kitchen"],
  ["alleyway", "Dark alleys", "setting", "a dark alley with a streetlight"],
  ["outer-space", "Outer space", "setting", "stars, planets and a spaceship bridge"],
  ["meadow-outdoors", "Outdoors", "setting", "a sunny outdoor field with trees"],
  ["laboratory-set", "Laboratories", "setting", "a laboratory with glowing equipment"],
  ["city-skyline", "City skylines", "setting", "a city skyline of tall buildings"],
];

async function main() {
  if (DIMENSIONS.length < 64) throw new Error(`Need at least 64 dimensions, have ${DIMENSIONS.length}`);
  if (new Set(DIMENSIONS.map((d) => d[0])).size !== DIMENSIONS.length) throw new Error("Duplicate slug");

  for (const [slug, label, kind, prompt] of DIMENSIONS) {
    const embedding = await embedText(prompt);
    await db
      .insert(preferenceDimensions)
      .values({ slug, label, kind, prompt, embedding })
      .onConflictDoUpdate({
        target: preferenceDimensions.slug,
        set: {
          label: sql`excluded.label`,
          kind: sql`excluded.kind`,
          prompt: sql`excluded.prompt`,
          embedding: sql`excluded.embedding`,
        },
      });
  }
  console.log(`Upserted ${DIMENSIONS.length} dimensions`);

  // Coverage: dimensions that are among the 5 closest for at least one video.
  const rows = await client`
    select d.slug,
      exists (
        select 1 from videos v where v.thumbnail_embedding is not null and d.slug in (
          select d2.slug from preference_dimensions d2 order by v.thumbnail_embedding <=> d2.embedding limit 5
        )
      ) as used
    from preference_dimensions d order by d.slug`;
  const unused = rows.filter((r) => !r.used).map((r) => r.slug);
  console.log(`Dimensions in some video's top 5: ${rows.length - unused.length}/${rows.length}`);
  if (unused.length) console.log(`Never in a top 5 (consider revising): ${unused.join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
