import Link from "next/link";
import { redirect } from "next/navigation";
import { resourceList } from "@/lib/admin/resources";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!session.user.isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Admins only</h1>
        <p className="mt-2 text-sm text-zinc-500">
          You are signed in as {session.user.email}, which does not have admin access.
        </p>
      </div>
    );
  }

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
