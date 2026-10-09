"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { column, getResource, type Field } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/uuid";

function parseField(field: Field, formData: FormData): unknown {
  const raw = formData.get(field.name);
  const value = typeof raw === "string" ? raw.trim() : "";

  switch (field.type) {
    case "checkbox":
      return raw === "on";
    case "number": {
      const num = Number(value);
      if (value === "" || !Number.isFinite(num)) throw new Error(`${field.label} must be a number`);
      return num;
    }
    case "tags":
      return value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
    case "select": {
      if (field.required && value === "") throw new Error(`${field.label} is required`);
      return value;
    }
    default:
      if (field.required && value === "") throw new Error(`${field.label} is required`);
      return value;
  }
}

function messageOf(error: unknown) {
  // Surface Postgres errors (e.g. duplicate key, foreign key) without the full query dump.
  const cause = (error as { cause?: { message?: string } })?.cause?.message;
  return cause ?? (error instanceof Error ? error.message : "Something went wrong");
}

export async function saveRecord(resourceKey: string, id: string | null, formData: FormData) {
  await requireAdmin();
  const resource = getResource(resourceKey);
  if (!resource) throw new Error("Unknown resource");

  const base = `/admin/${resource.key}`;
  const formPath = `${base}/${id === null ? "new" : encodeURIComponent(id)}`;

  try {
    const values: Record<string, unknown> = {};
    for (const field of resource.fields) {
      values[field.name] = parseField(field, formData);
    }

    if (id === null) {
      await db.insert(resource.table).values(values as never);
    } else {
      await db.update(resource.table).set(values as never).where(eq(column(resource, resource.pk), id));
    }
  } catch (error) {
    redirect(`${formPath}?error=${encodeURIComponent(messageOf(error))}`);
  }

  revalidatePath("/", "layout");
  redirect(base);
}

export async function deleteRecord(resourceKey: string, id: string) {
  await requireAdmin();
  const resource = getResource(resourceKey);
  if (!resource) throw new Error("Unknown resource");

  const base = `/admin/${resource.key}`;

  try {
    if (!isUuid(id)) throw new Error("Invalid id");
    await db.delete(resource.table).where(eq(column(resource, resource.pk), id));
  } catch (error) {
    redirect(`${base}?error=${encodeURIComponent(messageOf(error))}`);
  }

  revalidatePath("/", "layout");
  redirect(base);
}
