import Link from "next/link";
import {
  HistoryIcon,
  HomeIcon,
  ShortsIcon,
  SubscriptionsIcon,
  ThumbsUpIcon,
  UserIcon,
  VideosIcon,
  WatchLaterIcon,
} from "@/components/icons";

const mainLinks = [
  { label: "Home", href: "/", icon: HomeIcon, active: true },
  { label: "Shorts", href: "/shorts", icon: ShortsIcon },
  { label: "Subscriptions", href: "/subscriptions", icon: SubscriptionsIcon },
];

const youLinks = [
  { label: "You", href: "/you", icon: UserIcon },
  { label: "History", href: "/history", icon: HistoryIcon },
  { label: "Your videos", href: "/your-videos", icon: VideosIcon },
  { label: "Watch later", href: "/watch-later", icon: WatchLaterIcon },
  { label: "Liked videos", href: "/liked", icon: ThumbsUpIcon },
];

const exploreLinks = [
  "Trending",
  "Music",
  "Movies & TV",
  "Live",
  "Gaming",
  "News",
  "Sports",
  "Learning",
  "Fashion & Beauty",
  "Podcasts",
];

function SidebarLink({
  label,
  href,
  Icon,
  active,
}: {
  label: string;
  href: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm ${
        active
          ? "bg-red-50 font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400"
          : "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto px-2 py-3 md:block">
      <nav className="flex flex-col gap-0.5">
        {mainLinks.map((link) => (
          <SidebarLink key={link.label} label={link.label} href={link.href} Icon={link.icon} active={link.active} />
        ))}
      </nav>

      <hr className="my-3 border-zinc-200 dark:border-zinc-800" />

      <nav className="flex flex-col gap-0.5">
        {youLinks.map((link) => (
          <SidebarLink key={link.label} label={link.label} href={link.href} Icon={link.icon} />
        ))}
      </nav>

      <hr className="my-3 border-zinc-200 dark:border-zinc-800" />

      <div className="px-3 pb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">Explore</div>
      <nav className="flex flex-col gap-0.5">
        {exploreLinks.map((label) => (
          <a
            key={label}
            href="#"
            className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <span aria-hidden className="w-5 text-center">🐾</span>
            {label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
