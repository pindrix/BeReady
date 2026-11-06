import type { Sql } from "../db/repository";
import { countryByCode } from "../data/countries";
let country: string | null = null;
let welcomeComplete = false;
let database: Sql | undefined;
let revision = 0;
const listeners = new Set<() => void>();
export const getCountryCode = () => country;
export const getRegionRevision = () => revision;
export const isWelcomeComplete = () => welcomeComplete;
export function subscribeRegion(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function publish() {
  revision++;
  listeners.forEach((fn) => fn());
}
export async function initializeRegion(db: Sql) {
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS ready_preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);",
  );
  const saved = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM ready_preferences WHERE key = ?",
    "country",
  );
  const welcome = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM ready_preferences WHERE key = ?",
    "welcome_complete",
  );
  database = db;
  country = countryByCode(saved?.value)?.code ?? null;
  welcomeComplete = welcome?.value === "1" && !!country;
  publish();
}
export async function setCountryCode(code: string) {
  if (!countryByCode(code)) throw new Error("Vyberte krajinu.");
  if (database)
    await database.runAsync(
      "INSERT INTO ready_preferences (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      "country",
      code,
    );
  country = code;
  publish();
}
export async function completeWelcome() {
  if (!country) throw new Error("Vyberte krajinu.");
  if (database)
    await database.runAsync(
      "INSERT INTO ready_preferences (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      "welcome_complete",
      "1",
    );
  welcomeComplete = true;
  publish();
}
