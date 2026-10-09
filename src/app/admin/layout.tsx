import Link from "next/link";
import { resourceList } from "@/lib/admin/resources";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <nav className="mb-6 flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <Link href="/admin" className="mr-2 text-lg font-semibold">
          Admin
        </Link>
        {resourceList.map((resource) => (
          <Link
            key={resource.key}
            href={`/admin/${resource.key}`}
            className="rounded-full px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {resource.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
