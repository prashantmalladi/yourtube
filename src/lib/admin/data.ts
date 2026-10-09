import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { isUuid } from "../uuid";
import { column, getResource, type Resource } from "./resources";

export type Row = Record<string, unknown>;

export async function listRows(resource: Resource): Promise<Row[]> {
  return db
    .select()
    .from(resource.table)
    .orderBy(asc(column(resource, resource.orderBy)), asc(column(resource, resource.pk)));
}

export async function getRow(resource: Resource, id: string): Promise<Row | undefined> {
  if (!isUuid(id)) return undefined;
  const [row] = await db.select().from(resource.table).where(eq(column(resource, resource.pk), id));
  return row;
}

/** For each "select" field that references another resource, its choices as value/label pairs. */
export async function loadRefOptions(resource: Resource) {
  const options: Record<string, { value: string; label: string }[]> = {};
  for (const field of resource.fields) {
    if (!field.ref) continue;
    const target = getResource(field.ref)!;
    const rows = await listRows(target);
    options[field.name] = rows.map((row) => ({
      value: String(row[target.pk]),
      label: String(row[target.displayField]),
    }));
  }
  return options;
}
