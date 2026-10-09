"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AccountMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div className="h-9 w-9" />;

  if (!session) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-400 dark:hover:bg-zinc-800"
      >
        Sign in
      </Link>
    );
  }

  const { user } = session;

  return (
    <details className="relative">
      <summary
        aria-label="Account"
        className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full bg-amber-200 text-sm font-semibold text-amber-950 dark:bg-amber-700 dark:text-amber-50"
      >
        {user.name.slice(0, 1).toUpperCase()}
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <p className="truncate px-3 py-1 font-medium">{user.name}</p>
        <p className="truncate px-3 pb-2 text-xs text-zinc-500">{user.email}</p>
        {user.isAdmin && (
          <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            Admin
          </Link>
        )}
        <button
          onClick={async () => {
            await authClient.signOut();
            router.refresh();
          }}
          className="block w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Sign out
        </button>
      </div>
    </details>
  );
}
