import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSession, safeNext } from "@/lib/auth";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);
  return <AuthForm mode="signup" next={next} />;
}
