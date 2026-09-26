export type Video = {
  id: string;
  title: string;
  channel: string;
  channelId: string;
  views: string;
  uploaded: string;
  duration: string;
  thumbnailGradient: string;
  emoji: string;
};

export type Channel = {
  id: string;
  name: string;
  handle: string;
  avatarEmoji: string;
  bannerGradient: string;
  subscribers: string;
  videoCount: string;
  verified: boolean;
  description: string;
};

export type Short = {
  id: string;
  title: string;
  views: string;
  duration: string;
  thumbnailGradient: string;
  emoji: string;
};

export type Comment = {
  id: string;
  author: string;
  avatarEmoji: string;
  time: string;
  text: string;
  likes: string;
  replies: number;
};

export type VideoDetails = Video & {
  subscribers: string;
  verified: boolean;
  likes: string;
  hashtags: string[];
  description: string;
  comments: Comment[];
};

export const categories = [
  "Dogs",
  "Puppies",
  "Training",
  "Funny Dogs",
  "Dog Care",
  "Dog Breeds",
  "Rescue Dogs",
  "Dog Vlogs",
  "Shorts",
  "Live",
];

export const forYouVideos: Video[] = [
  {
    id: "1",
    title: "Cutest Puppy Moments That Will Make Your Day",
    channel: "Doggy Joy",
    channelId: "doggy-joy",
    views: "2.4M views",
    uploaded: "3 weeks ago",
    duration: "10:24",
    thumbnailGradient: "from-amber-200 to-orange-300",
    emoji: "🐶",
  },
  {
    id: "2",
    title: "Dogs Being Funny 😂 Try Not to Laugh (Impossible!)",
    channel: "Pawsome TV",
    channelId: "pawsome-tv",
    views: "12M views",
    uploaded: "1 month ago",
    duration: "8:17",
    thumbnailGradient: "from-lime-200 to-green-300",
    emoji: "🐕",
  },
  {
    id: "3",
    title: "Basic Dog Training for Beginners | Simple & Effective Tips",
    channel: "The Balanced Dog",
    channelId: "the-balanced-dog",
    views: "1.1M views",
    uploaded: "1 month ago",
    duration: "12:36",
    thumbnailGradient: "from-sky-200 to-blue-300",
    emoji: "🦮",
  },
  {
    id: "4",
    title: "Relaxing Music for Dogs 🐾 Calm Anxiety and Help Them Sleep",
    channel: "Paw Harmony",
    channelId: "paw-harmony",
    views: "4.3M views",
    uploaded: "2 months ago",
    duration: "1:00:00",
    thumbnailGradient: "from-indigo-200 to-purple-300",
    emoji: "🐩",
  },
];

export const shorts: Short[] = [
  {
    id: "s1",
    title: "Puppy's First Bath 🫧❤️",
    views: "12M views",
    duration: "0:28",
    thumbnailGradient: "from-cyan-200 to-sky-300",
    emoji: "🐶",
  },
  {
    id: "s2",
    title: "Tiny Puppy, Big Energy! ⚡",
    views: "8.6M views",
    duration: "0:20",
    thumbnailGradient: "from-orange-200 to-amber-300",
    emoji: "🐕‍🦺",
  },
  {
    id: "s3",
    title: "Cool Dog Vibes 😎",
    views: "11M views",
    duration: "0:15",
    thumbnailGradient: "from-blue-200 to-cyan-300",
    emoji: "🐕",
  },
  {
    id: "s4",
    title: "Husky Puppy Howling ❤️",
    views: "6.9M views",
    duration: "0:18",
    thumbnailGradient: "from-slate-200 to-zinc-300",
    emoji: "🐺",
  },
  {
    id: "s5",
    title: "Epic Shake! 💦",
    views: "9.4M views",
    duration: "0:22",
    thumbnailGradient: "from-teal-200 to-emerald-300",
    emoji: "🐕",
  },
  {
    id: "s6",
    title: "Corgi Zoomies Never Get Old!",
    views: "7.1M views",
    duration: "0:16",
    thumbnailGradient: "from-yellow-200 to-orange-300",
    emoji: "🐕",
  },
];

export const recommendedVideos: Video[] = [
  {
    id: "r1",
    title: "Best Dog Breeds for Families",
    channel: "Doggy Joy",
    channelId: "doggy-joy",
    views: "3.2M views",
    uploaded: "2 weeks ago",
    duration: "14:02",
    thumbnailGradient: "from-rose-200 to-pink-300",
    emoji: "🐕",
  },
  {
    id: "r2",
    title: "Rescue Dogs' Amazing Transformations",
    channel: "Second Chance Paws",
    channelId: "second-chance-paws",
    views: "5.8M views",
    uploaded: "5 days ago",
    duration: "16:45",
    thumbnailGradient: "from-stone-300 to-neutral-400",
    emoji: "🐕‍🦺",
  },
  {
    id: "r3",
    title: "A Day in the Life of a Dog",
    channel: "Paw Harmony",
    channelId: "paw-harmony",
    views: "980K views",
    uploaded: "1 week ago",
    duration: "9:53",
    thumbnailGradient: "from-orange-300 to-amber-400",
    emoji: "🐕",
  },
  {
    id: "r4",
    title: "Healthy Homemade Dog Treats",
    channel: "The Balanced Dog",
    channelId: "the-balanced-dog",
    views: "1.6M views",
    uploaded: "4 days ago",
    duration: "7:19",
    thumbnailGradient: "from-yellow-100 to-amber-200",
    emoji: "🦴",
  },
];

export const allVideos: Video[] = [...forYouVideos, ...recommendedVideos];

const sampleComments: Comment[] = [
  {
    id: "c1",
    author: "Pawfect Life",
    avatarEmoji: "🐕",
    time: "3 weeks ago",
    text: "This made my entire day! Dogs truly make the world a happier place 🥹❤️",
    likes: "1.2K",
    replies: 23,
  },
  {
    id: "c2",
    author: "Golden Retriever Fan",
    avatarEmoji: "🐩",
    time: "2 weeks ago",
    text: "I need a dog like this in my life immediately, no notes.",
    likes: "684",
    replies: 5,
  },
  {
    id: "c3",
    author: "Bark Bros",
    avatarEmoji: "🐾",
    time: "2 weeks ago",
    text: "The tennis ball at 2:34 sent me 😂 absolute chaos energy.",
    likes: "412",
    replies: 2,
  },
  {
    id: "c4",
    author: "Second Chance Paws",
    avatarEmoji: "🦴",
    time: "1 week ago",
    text: "Shared this with the whole shelter team, everyone loved it.",
    likes: "198",
    replies: 0,
  },
];

const detailExtras: Record<
  string,
  Pick<VideoDetails, "subscribers" | "verified" | "likes" | "hashtags" | "description">
> = {
  "1": {
    subscribers: "2.4M subscribers",
    verified: true,
    likes: "78K",
    hashtags: ["#Puppy", "#Dogs", "#CuteMoments"],
    description:
      "Get ready for the cutest puppy moments that will instantly brighten your day! From playful zoomies to sleepy cuddles, these adorable dogs will melt your heart.",
  },
  "2": {
    subscribers: "5.1M subscribers",
    verified: true,
    likes: "203K",
    hashtags: ["#FunnyDogs", "#DogsOfYouTube", "#Laughs"],
    description:
      "Warning: you might actually laugh out loud. A compilation of the funniest, most unpredictable dog moments sent in by our amazing community.",
  },
  "3": {
    subscribers: "890K subscribers",
    verified: false,
    likes: "34K",
    hashtags: ["#DogTraining", "#PuppyTips", "#GoodBoy"],
    description:
      "Simple, effective training tips every new dog owner needs to know. No harsh methods, just patience, consistency, and lots of treats.",
  },
  "4": {
    subscribers: "1.2M subscribers",
    verified: false,
    likes: "56K",
    hashtags: ["#DogRelaxation", "#CalmingMusic", "#DogAnxiety"],
    description:
      "An hour of gentle music composed to help anxious dogs relax, unwind, and get some well-deserved rest. Great for thunderstorms and fireworks too.",
  },
  r1: {
    subscribers: "2.4M subscribers",
    verified: true,
    likes: "61K",
    hashtags: ["#DogBreeds", "#FamilyDogs", "#Puppy"],
    description:
      "A rundown of the friendliest, most family-oriented dog breeds out there, plus what makes each one such a great companion for kids.",
  },
  r2: {
    subscribers: "610K subscribers",
    verified: false,
    likes: "89K",
    hashtags: ["#RescueDogs", "#AdoptDontShop", "#Transformation"],
    description:
      "Heartwarming before-and-after stories of rescue dogs finding their forever homes. Grab the tissues for this one.",
  },
  r3: {
    subscribers: "1.2M subscribers",
    verified: false,
    likes: "22K",
    hashtags: ["#DogVlog", "#DailyLife", "#GoldenRetriever"],
    description:
      "Follow along for a full day in the life of a very good boy, from morning zoomies to evening cuddles on the couch.",
  },
  r4: {
    subscribers: "890K subscribers",
    verified: false,
    likes: "17K",
    hashtags: ["#DogTreats", "#HomemadeRecipes", "#DogCare"],
    description:
      "Three easy, vet-approved homemade treat recipes using ingredients you already have in your kitchen.",
  },
};

export const videoDetails: Record<string, VideoDetails> = Object.fromEntries(
  allVideos.map((video) => [
    video.id,
    {
      ...video,
      ...detailExtras[video.id],
      comments: sampleComments,
    },
  ])
);

export function getVideoDetails(id: string): VideoDetails | undefined {
  return videoDetails[id];
}

export const channels: Channel[] = [
  {
    id: "doggy-joy",
    name: "Doggy Joy",
    handle: "@DoggyJoy",
    avatarEmoji: "🐶",
    bannerGradient: "from-amber-200 via-lime-200 to-emerald-200",
    subscribers: "2.4M subscribers",
    videoCount: "412 videos",
    verified: true,
    description:
      "Spreading joy, one wag at a time! 🐾❤️ Cute moments, training tips, dog care, and fun adventures to make a happier world with dogs.",
  },
  {
    id: "pawsome-tv",
    name: "Pawsome TV",
    handle: "@PawsomeTV",
    avatarEmoji: "🐕",
    bannerGradient: "from-lime-200 via-green-200 to-teal-200",
    subscribers: "5.1M subscribers",
    videoCount: "268 videos",
    verified: true,
    description:
      "The internet's favorite home for hilarious dog moments. New funny videos every week — guaranteed to make you smile.",
  },
  {
    id: "the-balanced-dog",
    name: "The Balanced Dog",
    handle: "@TheBalancedDog",
    avatarEmoji: "🦮",
    bannerGradient: "from-sky-200 via-blue-200 to-indigo-200",
    subscribers: "890K subscribers",
    videoCount: "156 videos",
    verified: false,
    description:
      "Practical, positive dog training for real life. No harsh methods, just patience, consistency, and lots of treats.",
  },
  {
    id: "paw-harmony",
    name: "Paw Harmony",
    handle: "@PawHarmony",
    avatarEmoji: "🐩",
    bannerGradient: "from-indigo-200 via-purple-200 to-pink-200",
    subscribers: "1.2M subscribers",
    videoCount: "94 videos",
    verified: false,
    description:
      "Calming music, gentle vlogs, and relaxed days with dogs. Help your pup unwind, and yourself too.",
  },
  {
    id: "second-chance-paws",
    name: "Second Chance Paws",
    handle: "@SecondChancePaws",
    avatarEmoji: "🐕‍🦺",
    bannerGradient: "from-stone-200 via-neutral-200 to-orange-100",
    subscribers: "610K subscribers",
    videoCount: "203 videos",
    verified: false,
    description:
      "Rescue stories, adoption tips, and transformations that will restore your faith in second chances.",
  },
];

export function getChannel(id: string): Channel | undefined {
  return channels.find((channel) => channel.id === id);
}

export function getChannelVideos(id: string): Video[] {
  return allVideos.filter((video) => video.channelId === id);
}
