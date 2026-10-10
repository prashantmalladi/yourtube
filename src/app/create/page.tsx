import { redirect } from "next/navigation";
import { CreateVideo } from "@/components/create/CreateVideo";
import { getSession } from "@/lib/auth";

export default async function CreatePage() {
  if (!(await getSession())) redirect("/login?next=/create");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold">Create a cat video</h1>
      <CreateVideo />
    </div>
  );
}
