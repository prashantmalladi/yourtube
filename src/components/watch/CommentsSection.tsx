import type { Comment } from "@/lib/mock-data";
import { ChevronDownIcon, MoreIcon, SortIcon, ThumbsDownIcon, ThumbsUpIcon } from "@/components/icons";

export function CommentsSection({ comments }: { comments: Comment[] }) {
  const commentCount = comments.reduce((total, comment) => total + 1 + comment.replies, 0);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {commentCount.toLocaleString()} Comments
        </h2>
        <button className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <SortIcon className="h-5 w-5" />
          Sort by
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg dark:bg-amber-900">
          🐕
        </div>
        <input
          type="text"
          placeholder="Add a comment..."
          className="w-full border-b border-zinc-200 bg-transparent pb-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-400"
        />
      </div>

      <ul className="flex flex-col gap-6">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg dark:bg-amber-900">
              {comment.avatarEmoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {comment.author}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{comment.time}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">{comment.text}</p>
              <div className="mt-2 flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <ThumbsUpIcon className="h-4 w-4" />
                    <span className="text-xs">{comment.likes}</span>
                  </button>
                  <button aria-label="Dislike" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                    <ThumbsDownIcon className="h-4 w-4" />
                  </button>
                </div>
                <button className="text-xs font-medium hover:text-zinc-900 dark:hover:text-zinc-100">
                  Reply
                </button>
                <button aria-label="More" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                  <MoreIcon className="h-4 w-4" />
                </button>
              </div>
              {comment.replies > 0 && (
                <button className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-400">
                  <ChevronDownIcon className="h-4 w-4" />
                  View {comment.replies} {comment.replies === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
