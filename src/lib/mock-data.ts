export type Video = {
  id: string;
  title: string;
  channel: string;
  views: string;
  uploaded: string;
  duration: string;
  thumbnailGradient: string;
  emoji: string;
};

export type Short = {
  id: string;
  title: string;
  views: string;
  duration: string;
  thumbnailGradient: string;
  emoji: string;
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
    views: "1.6M views",
    uploaded: "4 days ago",
    duration: "7:19",
    thumbnailGradient: "from-yellow-100 to-amber-200",
    emoji: "🦴",
  },
];
