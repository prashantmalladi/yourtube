import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { accounts, sessions, users, verifications } from "../../drizzle/schema";
import { db } from "./db";

// Better Auth rejects sign-in requests whose Origin is not its base URL or listed here. Every Vercel
// deployment has its own hostname (and BETTER_AUTH_URL can only name one), so trust the ones Vercel
// reports for this deployment. A *.vercel.app wildcard would trust anyone's Vercel app, so it is not used.
const vercelOrigins = [
  process.env.VERCEL_URL, // this deployment, e.g. yourtube-abc123-team.vercel.app
  process.env.VERCEL_BRANCH_URL, // the branch alias
  process.env.VERCEL_PROJECT_PRODUCTION_URL, // the production domain
].flatMap((host) => (host ? [`https://${host}`] : []));

export const auth = betterAuth({
  trustedOrigins: vercelOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { users, sessions, accounts, verifications },
  }),
  user: {
    modelName: "users",
    additionalFields: {
      // input: false means a sign-up request cannot set this; only server code can.
      isAdmin: { type: "boolean", defaultValue: false, input: false },
    },
  },
  session: { modelName: "sessions" },
  account: { modelName: "accounts" },
  verification: { modelName: "verifications" },
  advanced: { database: { generateId: "uuid" } },
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  // Must be last so cookies set inside server actions are applied.
  plugins: [nextCookies()],
});

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** For server actions and route handlers: they are reachable by direct POST, so check every time. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user.isAdmin) throw new Error("Admin access required");
  return session;
}

/** Only same-site relative paths are allowed, so a crafted link cannot bounce users elsewhere. */
export function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
