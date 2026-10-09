/**
 * Pairs every video in the database with one mp4 from mock_data/videos and one
 * thumbnail from mock_data/images, creating extra videos until there is one per mp4.
 *
 *   npx tsx scripts/assign-media.ts assign   insert missing videos, write mock_data/assignments.json
 *   npx tsx scripts/assign-media.ts rename   rename the paired files to <video-id>.<ext>
 *   npx tsx scripts/assign-media.ts upload   upload thumbnails to Cloudflare Images, store the URL
 *   npx tsx scripts/assign-media.ts upload-videos   upload mp4s to Cloudflare Stream, store the player URL
 */
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { asc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { channels, videos } from "../drizzle/schema";

process.loadEnvFile(".env");

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

const IMAGES = "mock_data/images";
const VIDEOS = "mock_data/videos";
const MANIFEST = "mock_data/assignments.json";

type Assignment = { videoId: string; title: string; image: string; video: string };

// Thumbnail index = position in the sorted list of mock_data/images/*.png at the time of assignment.
const EXISTING_THUMBS: Record<string, number> = {
  "Cutest Puppy Moments That Will Make Your Day": 0,
  "Dogs Being Funny 😂 Try Not to Laugh (Impossible!)": 2,
  "Basic Dog Training for Beginners | Simple & Effective Tips": 10,
  "Relaxing Music for Dogs 🐾 Calm Anxiety and Help Them Sleep": 20,
  "Best Dog Breeds for Families": 27,
  "Rescue Dogs' Amazing Transformations": 8,
  "A Day in the Life of a Dog": 23,
  "Healthy Homemade Dog Treats": 21,
};

const NEW_VIDEOS: [thumb: number, title: string, channel: string, tags: string[], blurb: string][] = [
  [1, "Sleepy Cat vs. Laptop Keyboard", "Pawsome TV", ["#CatsOfYouTube", "#WorkFromHome"], "A very sleepy orange cat does their best to help with the quarterly report."],
  [3, "Cat Math: Can You Solve It?", "The Balanced Dog", ["#CatMath", "#FunnyAnimals"], "Two naps plus one treat equals what, exactly? Nine lives minus one? Class is in session."],
  [4, "Mad Scientist Cat's Flying Fish Lab", "Pawsome TV", ["#MadScientist", "#Claymation"], "Safety goggles on, fish in the air. Things get out of paw in the lab."],
  [5, "A Kitten's Cozy Library Afternoon", "Paw Harmony", ["#CozyVibes", "#Kitten"], "Quiet pages, scattered quills and one curious kitten peeking over the desk."],
  [6, "Clay Cat Melts Into a Puddle", "Pawsome TV", ["#Claymation", "#Satisfying"], "A little blue clay cat slowly loses its shape in the most relaxing way."],
  [7, "Noir Chef Cat and the Crying Pie", "Pawsome TV", ["#Noir", "#Cartoon"], "Black-and-white drama in the kitchen: one stern chef and one very sad pie."],
  [9, "The Detective Cat and the Spinning Top", "Second Chance Paws", ["#Detective", "#Mystery"], "A hat, a lamp and a top that will not stop spinning. Is it a dream?"],
  [12, "Wizard Cat's Magical Library", "Paw Harmony", ["#Magic", "#Anime"], "Scrolls float, potions glow and one tiny wizard tries to keep up."],
  [13, "Fluffy Cat Chases the Red Dot to Victory", "Pawsome TV", ["#LaserPointer", "#Champion"], "The red dot is fast. The fluffy champion is faster. Winner's podium ready."],
  [14, "Retro Game: Calico Cat Health Bar", "Doggy Joy", ["#PixelArt", "#RetroGaming"], "Eight bits of calico cat, one health bar, zero chill."],
  [15, "Clay Cat Bakes a Chocolate Souffle", "Doggy Joy", ["#Claymation", "#Baking"], "Chocolate everywhere, including the chef hat. The souffle still rose."],
  [16, "Calico Cat Spills the Water on Purpose", "Pawsome TV", ["#Mischief", "#Claymation"], "Eye contact. Slow push. Splash. A masterclass in mischief."],
  [17, "Film Noir: The Case of the Spilled Jar", "Second Chance Paws", ["#FilmNoir", "#Detective"], "It was a dark and stormy kitchen counter. Someone knocked the jar over."],
  [18, "Chef Cat's Sunny Kitchen", "Doggy Joy", ["#CookingWithCats", "#Cozy"], "Fluffy orange chef, warm morning light and a very well-stocked spice shelf."],
  [22, "Pixel Art Cherry Blossom Nap", "Paw Harmony", ["#PixelArt", "#Lofi"], "A grey cat naps by a neon-lit window while cherry blossoms drift past."],
  [24, "Giant Fluffy Cat Attacks Cardboard City", "Pawsome TV", ["#Giant", "#Miniatures"], "A fluffy giant stomps through a handmade cardboard skyline."],
  [25, "Goggle Cat Up Close", "The Balanced Dog", ["#Claymation", "#CloseUp"], "Big goggles, bigger eyes. A claymation portrait in extreme close-up."],
  [26, "Witch Kitten and the Purple Butterflies", "Paw Harmony", ["#Fantasy", "#Kitten"], "A tiny witch kitten in a flower meadow, surrounded by glowing butterflies."],
  [28, "Flour Cat Baking Disaster", "Doggy Joy", ["#BakingFail", "#Claymation"], "One dropped bag of flour later, the whole kitchen is a blizzard."],
  [29, "Cat-Toast Gravity Experiment Explained", "The Balanced Dog", ["#Science", "#CatToast"], "If a cat always lands on its feet and toast lands butter side down, what happens when you strap them together?"],
  [30, "Library Kittens Climb the Book Tower", "Second Chance Paws", ["#Kittens", "#Books"], "Four fluffy kittens, one tall stack of books and zero librarians."],
  [32, "Cyberpunk Pink Cat Naps on the Keyboard", "Paw Harmony", ["#Cyberpunk", "#PixelArt"], "A neon city, a rainy window and a pink cat asleep on the keys."],
  [33, "Cardboard Rocket Cat Blasts Off", "Pawsome TV", ["#Space", "#Cardboard"], "Three, two, one, meow. A black cat in a cardboard rocket heads for the stars."],
  [34, "Lab Coat Cat Discovers Glowing Tuna", "The Balanced Dog", ["#Science", "#Tuna"], "A very surprised scientist has found the world's first glowing tuna."],
  [35, "Space Cat Captain's Log", "Paw Harmony", ["#SciFi", "#Space"], "Day 1 on the bridge. The stars look good. The treats look better."],
  [36, "Rainy Alley Detective Cat", "Second Chance Paws", ["#Noir", "#Detective"], "A trench coat, a red light and a case that will not close itself."],
  [37, "Party Hat Cat Is Not Amused", "Second Chance Paws", ["#Birthday", "#GrumpyCat"], "A rainy window, a tiny party hat and a very clear opinion about birthdays."],
  [38, "Cat Hides in a Chocolate Cake", "Doggy Joy", ["#Claymation", "#Baking"], "Where did the cat go? Look closely at the cake."],
  [40, "Hungry Anime Cat Gets Dinner", "Doggy Joy", ["#Anime", "#Dinner"], "Big eyes, bigger feelings. Dinner has been served at last."],
];

const VIEWS = ["1.8M", "940K", "3.1M", "512K", "2.2M", "1.4M", "780K", "4.6M", "630K", "1.1M"];
const UPLOADED = ["2 days ago", "5 days ago", "1 week ago", "2 weeks ago", "3 weeks ago", "1 month ago"];
const LIKES = ["54K", "21K", "88K", "12K", "36K", "67K", "9.4K", "102K"];
const GRADIENTS = [
  "from-amber-200 to-orange-300",
  "from-lime-200 to-green-300",
  "from-sky-200 to-blue-300",
  "from-indigo-200 to-purple-300",
  "from-rose-200 to-pink-300",
  "from-teal-200 to-emerald-300",
];
const SECTIONS = ["for-you", "recommended"];

const sortedFiles = (dir: string, ext: string) => fs.readdirSync(dir).filter((f) => f.endsWith(ext)).sort();

/** Duration of an mp4 from its mvhd box, as m:ss. */
function mp4Duration(file: string): string {
  const head = fs.readFileSync(file).subarray(0, 4_000_000);
  const at = head.indexOf("mvhd");
  if (at < 0) return "0:08";
  const version = head[at + 4];
  const timescale = head.readUInt32BE(at + (version === 0 ? 16 : 24));
  const duration = version === 0 ? head.readUInt32BE(at + 20) : Number(head.readBigUInt64BE(at + 28));
  const secs = Math.round(duration / timescale);
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

async function assign() {
  if (fs.existsSync(MANIFEST)) throw new Error(`${MANIFEST} already exists; assignment was already done`);

  const images = sortedFiles(IMAGES, ".png");
  const mp4s = sortedFiles(VIDEOS, ".mp4");

  const existing = await db.select().from(videos).orderBy(asc(videos.position));
  const channelRows = await db.select().from(channels);
  const channelId = new Map(channelRows.map((c) => [c.name, c.id]));

  const toInsert: (typeof videos.$inferInsert)[] = [];
  const thumbFor = new Map<string, number>();

  for (const v of existing) {
    const t = EXISTING_THUMBS[v.title];
    if (t === undefined) throw new Error(`No thumbnail chosen for existing video "${v.title}"`);
    thumbFor.set(v.id, t);
  }

  const needed = mp4s.length - existing.length;
  if (needed !== NEW_VIDEOS.length) throw new Error(`Need ${needed} new videos, have ${NEW_VIDEOS.length} specs`);

  NEW_VIDEOS.forEach(([thumb, title, channel, tags, blurb], i) => {
    const id = randomUUID();
    const owner = channelId.get(channel);
    if (!owner) throw new Error(`Unknown channel ${channel}`);
    thumbFor.set(id, thumb);
    const n = existing.length + i;
    toInsert.push({
      id,
      channelId: owner,
      title,
      views: `${VIEWS[i % VIEWS.length]} views`,
      uploaded: UPLOADED[i % UPLOADED.length],
      duration: mp4Duration(path.join(VIDEOS, mp4s[n])),
      thumbnailGradient: GRADIENTS[i % GRADIENTS.length],
      emoji: "🐱",
      likes: LIKES[i % LIKES.length],
      hashtags: tags,
      description: blurb,
      section: SECTIONS[i % SECTIONS.length],
      position: n,
    });
  });

  const used = [...thumbFor.values()];
  if (new Set(used).size !== used.length) throw new Error("A thumbnail is assigned twice");

  await db.insert(videos).values(toInsert);

  const ordered = [...existing.map((v) => ({ id: v.id, title: v.title })), ...toInsert.map((v) => ({ id: v.id!, title: v.title }))];
  const manifest: Assignment[] = ordered.map((v, i) => ({
    videoId: v.id,
    title: v.title,
    image: images[thumbFor.get(v.id)!],
    video: mp4s[i],
  }));
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`Inserted ${toInsert.length} videos; paired ${manifest.length} videos with thumbnails and mp4s`);
}

function readManifest(): Assignment[] {
  return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
}

function rename() {
  let moved = 0;
  for (const a of readManifest()) {
    const pairs: [string, string][] = [
      [path.join(IMAGES, a.image), path.join(IMAGES, `${a.videoId}.png`)],
      [path.join(IMAGES, a.image.replace(/\.png$/, ".json")), path.join(IMAGES, `${a.videoId}.json`)],
      [path.join(VIDEOS, a.video), path.join(VIDEOS, `${a.videoId}.mp4`)],
    ];
    for (const [from, to] of pairs) {
      if (!fs.existsSync(from)) continue; // already renamed, or no sidecar
      if (fs.existsSync(to)) throw new Error(`${to} already exists`);
      fs.renameSync(from, to);
      moved++;
    }
  }
  console.log(`Renamed ${moved} files`);
}

async function upload() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !token) throw new Error("CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN not set");

  const manifest = readManifest();
  const have = new Set(
    (await db.select({ id: videos.id, url: videos.thumbnailUrl }).from(videos).where(inArray(videos.id, manifest.map((m) => m.videoId))))
      .filter((v) => v.url)
      .map((v) => v.id)
  );

  for (const a of manifest) {
    if (have.has(a.videoId)) continue;
    const file = path.join(IMAGES, `${a.videoId}.png`);
    const form = new FormData();
    // Cloudflare rejects bare UUIDs as custom ids, so nest it under a subpath.
    form.set("id", `video-thumbnails/${a.videoId}`);
    form.set("file", new Blob([fs.readFileSync(file)], { type: "image/jpeg" }), `${a.videoId}.png`);
    form.set("metadata", JSON.stringify({ videoId: a.videoId }));

    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/images/v1`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const body = (await res.json()) as { success: boolean; errors: unknown[]; result?: { variants: string[] } };
    if (!body.success || !body.result) throw new Error(`Upload failed for ${a.videoId}: ${JSON.stringify(body.errors)}`);

    const url = body.result.variants.find((v) => v.endsWith("/public")) ?? body.result.variants[0];
    await db.update(videos).set({ thumbnailUrl: url }).where(eq(videos.id, a.videoId));
    console.log(`${a.videoId} -> ${url}`);
  }
}

async function uploadVideos() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !token) throw new Error("CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN not set");

  const manifest = readManifest();
  const have = new Set(
    (await db.select({ id: videos.id, url: videos.videoUrl }).from(videos).where(inArray(videos.id, manifest.map((m) => m.videoId))))
      .filter((v) => v.url)
      .map((v) => v.id)
  );

  for (const a of manifest) {
    if (have.has(a.videoId)) continue;
    const form = new FormData();
    form.set("file", new Blob([fs.readFileSync(path.join(VIDEOS, `${a.videoId}.mp4`))], { type: "video/mp4" }), `${a.videoId}.mp4`);
    form.set("meta", JSON.stringify({ name: a.title, videoId: a.videoId }));

    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/stream`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const body = (await res.json()) as {
      success: boolean;
      errors: unknown[];
      result?: { uid: string; playback?: { hls: string } };
    };
    if (!body.success || !body.result) throw new Error(`Upload failed for ${a.videoId}: ${JSON.stringify(body.errors)}`);

    // The playback host is the account's customer-<code>.cloudflarestream.com domain.
    const host = new URL(body.result.playback!.hls).origin;
    const url = `${host}/${body.result.uid}/iframe`;
    await db.update(videos).set({ videoUrl: url }).where(eq(videos.id, a.videoId));
    console.log(`${a.videoId} -> ${url}`);
  }
}

async function main() {
  const step = process.argv[2];
  if (step === "assign") await assign();
  else if (step === "rename") rename();
  else if (step === "upload") await upload();
  else if (step === "upload-videos") await uploadVideos();
  else throw new Error("Usage: assign-media.ts assign | rename | upload | upload-videos");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
