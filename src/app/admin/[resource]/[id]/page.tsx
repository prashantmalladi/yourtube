import Link from "next/link";
import { notFound } from "next/navigation";
import { saveRecord } from "../../actions";
import { RecordForm } from "@/components/admin/RecordForm";
import { getRow, loadRefOptions } from "@/lib/admin/data";
import { getResource } from "@/lib/admin/resources";

export default async function EditRecord({
  params,
  searchParams,
}: PageProps<"/admin/[resource]/[id]">) {
  const { resource: key, id: rawId } = await params;
  const { error } = await searchParams;
  const resource = getResource(key);
  if (!resource) notFound();

  const id = decodeURIComponent(rawId);
  const isNew = id === "new";
  const row = isNew ? undefined : await getRow(resource, id);
  if (!isNew && !row) notFound();

  const refOptions = await loadRefOptions(resource);

  return (
    <div className="max-w-2xl">
      <Link href={`/admin/${resource.key}`} className="text-sm text-zinc-500 hover:underline">
        ← {resource.label}
      </Link>
      <h1 className="mb-4 mt-1 text-2xl font-semibold">
        {isNew ? `New ${resource.singular}` : `Edit ${resource.singular}`}
      </h1>

      {typeof error === "string" && (
        <p className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      <RecordForm
        resource={resource}
        row={row}
        refOptions={refOptions}
        isNew={isNew}
        action={saveRecord.bind(null, resource.key, isNew ? null : id)}
      />
    </div>
  );
}
