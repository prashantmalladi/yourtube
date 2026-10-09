import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteRecord } from "../actions";
import { listRows, loadRefOptions } from "@/lib/admin/data";
import { getResource } from "@/lib/admin/resources";

export default async function ResourceList({
  params,
  searchParams,
}: PageProps<"/admin/[resource]">) {
  const { resource: key } = await params;
  const { error } = await searchParams;
  const resource = getResource(key);
  if (!resource) notFound();

  const [rows, refOptions] = await Promise.all([listRows(resource), loadRefOptions(resource)]);
  const fieldByName = new Map(resource.fields.map((f) => [f.name, f]));
  const label = (name: string) => fieldByName.get(name)?.label ?? name;

  function display(name: string, value: unknown) {
    const match = refOptions[name]?.find((c) => c.value === String(value));
    if (match) return match.label;
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(" ");
    // Full uuids are noisy in a table; the edit link carries the whole id.
    if (name === resource!.pk) return String(value).slice(0, 8);
    return String(value ?? "");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {resource.label} <span className="text-base text-zinc-500">({rows.length})</span>
        </h1>
        <Link
          href={`/admin/${resource.key}/new`}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New {resource.singular}
        </Link>
      </div>

      {typeof error === "string" && (
        <p className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              {resource.columns.map((name) => (
                <th key={name} className="px-3 py-2 font-medium">
                  {name === resource.pk ? "ID" : label(name)}
                </th>
              ))}
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = String(row[resource.pk]);
              return (
                <tr key={id} className="border-t border-zinc-200 dark:border-zinc-800">
                  {resource.columns.map((name) => (
                    <td key={name} className="max-w-64 truncate px-3 py-2">
                      {display(name, row[name])}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <Link
                      href={`/admin/${resource.key}/${encodeURIComponent(id)}`}
                      className="mr-3 text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Edit
                    </Link>
                    <form action={deleteRecord.bind(null, resource.key, id)} className="inline">
                      <button className="text-red-600 hover:underline dark:text-red-400">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={resource.columns.length + 1}
                  className="px-3 py-6 text-center text-zinc-500"
                >
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
