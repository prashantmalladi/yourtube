import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { channels, comments, users, videos } from "../../../drizzle/schema";

export type ResourceKey = "users" | "channels" | "videos" | "comments";

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "tags" | "select";
  required?: boolean;
  /** Static choices for a "select" field. */
  options?: string[];
  /** Makes a "select" field choose a row from another resource. */
  ref?: ResourceKey;
};

export type Resource = {
  key: ResourceKey;
  label: string;
  singular: string;
  table: PgTable;
  pk: string;
  /** Column used to describe a row when another resource references it. */
  displayField: string;
  orderBy: string;
  /** Fields shown in the list view. */
  columns: string[];
  fields: Field[];
};

export const resources: Record<ResourceKey, Resource> = {
  users: {
    key: "users",
    label: "Users",
    singular: "user",
    table: users,
    pk: "id",
    displayField: "name",
    orderBy: "name",
    columns: ["id", "avatarEmoji", "name", "email", "isAdmin"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "avatarEmoji", label: "Avatar emoji", type: "text", required: true },
      { name: "email", label: "Email (needed to sign in)", type: "text" },
      { name: "isAdmin", label: "Admin", type: "checkbox" },
    ],
  },
  channels: {
    key: "channels",
    label: "Channels",
    singular: "channel",
    table: channels,
    pk: "id",
    displayField: "name",
    orderBy: "name",
    columns: ["id", "avatarEmoji", "name", "handle", "subscribers", "verified", "ownerId"],
    fields: [
      { name: "ownerId", label: "Owner", type: "select", ref: "users", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "handle", label: "Handle", type: "text", required: true },
      { name: "avatarEmoji", label: "Avatar emoji", type: "text", required: true },
      { name: "bannerGradient", label: "Banner gradient (Tailwind)", type: "text", required: true },
      { name: "subscribers", label: "Subscribers", type: "text", required: true },
      { name: "videoCount", label: "Video count", type: "text", required: true },
      { name: "verified", label: "Verified", type: "checkbox" },
      { name: "description", label: "Description", type: "textarea", required: true },
    ],
  },
  videos: {
    key: "videos",
    label: "Videos",
    singular: "video",
    table: videos,
    pk: "id",
    displayField: "title",
    orderBy: "position",
    columns: ["id", "emoji", "title", "channelId", "views", "section", "position"],
    fields: [
      { name: "channelId", label: "Channel", type: "select", ref: "channels", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "views", label: "Views", type: "text", required: true },
      { name: "uploaded", label: "Uploaded", type: "text", required: true },
      { name: "duration", label: "Duration", type: "text", required: true },
      { name: "thumbnailGradient", label: "Thumbnail gradient (Tailwind)", type: "text", required: true },
      { name: "thumbnailUrl", label: "Thumbnail URL", type: "text" },
      { name: "videoUrl", label: "Video player URL", type: "text" },
      { name: "emoji", label: "Emoji", type: "text", required: true },
      { name: "likes", label: "Likes", type: "text", required: true },
      { name: "hashtags", label: "Hashtags (comma separated)", type: "tags" },
      { name: "description", label: "Description", type: "textarea", required: true },
      {
        name: "section",
        label: "Home section",
        type: "select",
        options: ["for-you", "recommended"],
        required: true,
      },
      { name: "position", label: "Position", type: "number", required: true },
    ],
  },
  comments: {
    key: "comments",
    label: "Comments",
    singular: "comment",
    table: comments,
    pk: "id",
    displayField: "text",
    orderBy: "createdAt",
    columns: ["id", "videoId", "userId", "text", "likes", "replies"],
    fields: [
      { name: "videoId", label: "Video", type: "select", ref: "videos", required: true },
      { name: "userId", label: "Author", type: "select", ref: "users", required: true },
      { name: "time", label: "Time", type: "text", required: true },
      { name: "text", label: "Text", type: "textarea", required: true },
      { name: "likes", label: "Likes", type: "text", required: true },
      { name: "replies", label: "Replies", type: "number", required: true },
    ],
  },
};

export const resourceList = Object.values(resources);

export function getResource(key: string): Resource | undefined {
  return Object.hasOwn(resources, key) ? resources[key as ResourceKey] : undefined;
}

export function column(resource: Resource, name: string): PgColumn {
  return (resource.table as unknown as Record<string, PgColumn>)[name];
}
