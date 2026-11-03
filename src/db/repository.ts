import type { SQLiteDatabase } from "expo-sqlite";
import { initialChecklists } from "../data/content";
import {
  entitySchemas,
  householdSchema,
  stateSchema,
  type State,
  type Household,
  type EntityKey,
  type Entities,
} from "../types/model";

// Pick keeps the SQL boundary testable against a real SQLite engine in Node.
export type Sql = Pick<
  SQLiteDatabase,
  "execAsync" | "runAsync" | "getAllAsync" | "getFirstAsync"
>;
export type Database = Sql & {
  withExclusiveTransactionAsync(
    task: (tx: Sql) => Promise<void>,
  ): Promise<void>;
};
const tables = {
  inventory: "inventory_items",
  shopping: "shopping_items",
  checklists: "checklist_items",
  contacts: "emergency_contacts",
  safePlaces: "safe_places",
} as const;
const allTables = ["households", ...Object.values(tables)] as const;
async function put(
  db: Sql,
  table: (typeof allTables)[number],
  entity: { id: string },
) {
  await db.runAsync(
    `INSERT INTO ${table} (id, payload) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload`,
    entity.id,
    JSON.stringify(entity),
  );
}
export async function initialize(db: Database): Promise<void> {
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(
      "CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);",
    );
    const latest = await tx.getFirstAsync<{ version: number }>(
      "SELECT MAX(version) AS version FROM schema_migrations",
    );
    if (latest?.version && latest.version > 1)
      throw new Error("Databáza je novšia než aplikácia. Aktualizujte READY.");
    if (!latest?.version) {
      for (const table of allTables)
        await tx.execAsync(
          `CREATE TABLE ${table} (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL);`,
        );
      for (const task of initialChecklists)
        await put(tx, "checklist_items", task);
      await tx.runAsync(
        "INSERT INTO schema_migrations (version, applied_at) VALUES (1, ?)",
        new Date().toISOString(),
      );
    }
  });
}
export async function readState(db: Sql): Promise<State> {
  const households = await db.getAllAsync<{ payload: string }>(
    "SELECT payload FROM households",
  );
  const result: Record<string, unknown> = {
    household: households[0] ? JSON.parse(households[0].payload) : null,
  };
  for (const [key, table] of Object.entries(tables)) {
    const rows = await db.getAllAsync<{ payload: string }>(
      `SELECT payload FROM ${table} ORDER BY rowid`,
    );
    result[key] = rows.map((row) => JSON.parse(row.payload));
  }
  return stateSchema.parse(result);
}
export async function saveHousehold(db: Sql, data: Household) {
  await put(db, "households", householdSchema.parse(data));
}
export async function saveEntity<K extends EntityKey>(
  db: Sql,
  key: K,
  data: Entities[K],
) {
  await put(db, tables[key], entitySchemas[key].parse(data));
}
export async function deleteEntity(db: Sql, key: EntityKey, id: string) {
  await db.runAsync(`DELETE FROM ${tables[key]} WHERE id = ?`, id);
}
export async function replaceState(db: Database, raw: State) {
  const state = stateSchema.parse(raw);
  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const table of allTables) await tx.runAsync(`DELETE FROM ${table}`);
    if (state.household) await put(tx, "households", state.household);
    for (const key of Object.keys(tables) as (keyof typeof tables)[])
      for (const entity of state[key]) await put(tx, tables[key], entity);
  });
}
export async function addShopping(db: Database, items: Entities["shopping"][]) {
  const valid = items.map((item) => entitySchemas.shopping.parse(item));
  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const item of valid) await put(tx, tables.shopping, item);
  });
}
