/**
 * Creates (or promotes) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
 *   npx tsx scripts/create-admin.ts
 * An existing account with that email is only promoted; its password is left alone.
 */
import { eq } from "drizzle-orm";

process.loadEnvFile(".env");

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");

  // Imported after loadEnvFile because db.ts reads DATABASE_URL at import time.
  const { db } = await import("../src/lib/db");
  const { auth } = await import("../src/lib/auth");
  const { accounts, users } = await import("../drizzle/schema");

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    await db.update(users).set({ isAdmin: true }).where(eq(users.id, existing.id));
    console.log(`${email} already exists; ensured isAdmin = true`);
    return;
  }

  // Hash with Better Auth's own hasher so the normal sign-in flow accepts the password.
  const { password: hasher } = await auth.$context;
  const hash = await hasher.hash(password);

  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ name: "Admin", email, emailVerified: true, isAdmin: true })
      .returning();
    await tx
      .insert(accounts)
      .values({ userId: user.id, accountId: user.id, providerId: "credential", password: hash });
  });
  console.log(`Created admin ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
