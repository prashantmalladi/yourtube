import Link from "next/link";
import { listRows } from "@/lib/admin/data";
import { resourceList } from "@/lib/admin/resources";

export default async function AdminHome() {
  const counts = await Promise.all(resourceList.map(async (r) => (await listRows(r)).length));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {resourceList.map((resource, i) => (
        <Link
          key={resource.key}
          href={`/admin/${resource.key}`}
          className="rounded-xl border border-zinc-200 p-5 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          <p className="text-3xl font-semibold">{counts[i]}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{resource.label}</p>
        </Link>
      ))}
    </div>
  );
}
