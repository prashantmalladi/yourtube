import type { Row } from "@/lib/admin/data";
import type { Field, Resource } from "@/lib/admin/resources";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700";

function FieldInput({
  field,
  value,
  choices,
}: {
  field: Field;
  value: unknown;
  choices: { value: string; label: string }[];
}) {
  const common = { name: field.name, required: field.required, className: inputClass };

  switch (field.type) {
    case "textarea":
      return <textarea {...common} rows={4} defaultValue={String(value ?? "")} />;
    case "number":
      return (
        <input {...common} type="number" defaultValue={value === undefined ? "" : Number(value)} />
      );
    case "checkbox":
      return (
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={Boolean(value)}
          className="h-4 w-4"
        />
      );
    case "tags":
      return (
        <input
          {...common}
          type="text"
          defaultValue={Array.isArray(value) ? value.join(", ") : ""}
        />
      );
    case "select": {
      const options = field.options?.map((o) => ({ value: o, label: o })) ?? choices;
      return (
        <select {...common} defaultValue={value === undefined ? "" : String(value)}>
          <option value="" disabled>
            Select…
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    default:
      return <input {...common} type="text" defaultValue={String(value ?? "")} />;
  }
}

export function RecordForm({
  resource,
  row,
  refOptions,
  isNew,
  action,
}: {
  resource: Resource;
  row: Row | undefined;
  refOptions: Record<string, { value: string; label: string }[]>;
  isNew: boolean;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      {resource.fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1 text-sm font-medium">
          {field.label}
          <FieldInput
            field={field}
            value={row?.[field.name]}
            choices={refOptions[field.name] ?? []}
          />
        </label>
      ))}
      <button className="self-start rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
        {isNew ? "Create" : "Save changes"}
      </button>
    </form>
  );
}
