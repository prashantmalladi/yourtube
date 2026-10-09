"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const { error } = isSignup
      ? await authClient.signUp.email({ name: String(form.get("name")), email, password })
      : await authClient.signIn.email({ email, password });

    setPending(false);
    if (error) {
      setError(error.message ?? "Something went wrong");
      return;
    }
    router.push(next);
    router.refresh();
  }

  const other = isSignup ? "/login" : "/signup";

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">{isSignup ? "Create your account" : "Sign in"}</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {isSignup && (
          <label className="flex flex-col gap-1 text-sm font-medium">
            Name
            <input name="name" required autoComplete="name" className={inputClass} />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            className={inputClass}
          />
          {isSignup && <span className="text-xs font-normal text-zinc-500">At least 8 characters.</span>}
        </label>

        {error && (
          <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}

        <button
          disabled={pending}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-500">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link
          href={next === "/" ? other : `${other}?next=${encodeURIComponent(next)}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
