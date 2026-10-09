export type Video = {
  id: string;
  title: string;
  channel: string;
  channelId: string;
  views: string;
  uploaded: string;
  duration: string;
  thumbnailGradient: string;
  thumbnailUrl?: string | null;
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
  videoUrl?: string | null;
  hashtags: string[];
  description: string;
  comments: Comment[];
};
