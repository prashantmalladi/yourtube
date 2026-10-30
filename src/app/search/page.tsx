import { VideoGrid } from "@/components/home/VideoGrid";
import { searchVideos } from "@/lib/queries";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 200);

  if (!query) {
    return <p className="px-4 py-8 text-sm text-zinc-500 sm:px-6">Type something to search.</p>;
  }

  const results = await searchVideos(query);

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Results for &ldquo;{query}&rdquo;</h1>
      <VideoGrid videos={results} />
    </div>
  );
}
