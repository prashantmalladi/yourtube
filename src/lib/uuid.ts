const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Guards queries against malformed ids, which Postgres rejects with an error instead of no rows. */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
