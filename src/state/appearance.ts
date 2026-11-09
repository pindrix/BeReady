import type { Sql } from "../db/repository";
export type Appearance = "aurora" | "atlas";
let current: Appearance = "aurora";
let database: Sql | undefined;
const listeners = new Set<() => void>();
export const getAppearance = () => current;
export function subscribeAppearance(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function isAppearance(value: unknown): value is Appearance {
  return value === "aurora" || value === "atlas";
}
export async function initializeAppearance(db: Sql) {
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS ready_preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);",
  );
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM ready_preferences WHERE key = ?",
    "appearance",
  );
  database = db;
  current = isAppearance(row?.value) ? row.value : "aurora";
  listeners.forEach((fn) => fn());
}
export async function setAppearance(value: Appearance) {
  if (!isAppearance(value)) throw new Error("Operácia sa nepodarila");
  if (database)
    await database.runAsync(
      "INSERT INTO ready_preferences (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      "appearance",
      value,
    );
  if (current !== value) {
    current = value;
    listeners.forEach((fn) => fn());
  }
}
