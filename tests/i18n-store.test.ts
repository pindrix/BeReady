import { test, after } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import {
  initialize,
  readState,
  replaceState,
  type Database,
} from "../src/db/repository";
import { initializeLocale, setLocale, getLocale } from "../src/i18n";
const raw = new DatabaseSync(":memory:");
after(() => raw.close());
const db = {
  execAsync: async (q: string) => {
    raw.exec(q);
  },
  runAsync: async (q: string, ...p: SQLInputValue[]) =>
    raw.prepare(q).run(...p),
  getFirstAsync: async (q: string, ...p: SQLInputValue[]) =>
    raw.prepare(q).get(...p) ?? null,
  getAllAsync: async (q: string, ...p: SQLInputValue[]) =>
    raw.prepare(q).all(...p),
  withExclusiveTransactionAsync: async (
    fn: (db: Database) => Promise<void>,
  ) => {
    raw.exec("BEGIN");
    try {
      await fn(db);
      raw.exec("COMMIT");
    } catch (e) {
      raw.exec("ROLLBACK");
      throw e;
    }
  },
} as unknown as Database;
test("jazyková preferencia sa uloží a import domácnosti ju neresetuje", async () => {
  await initialize(db);
  await initializeLocale(db);
  await setLocale("ar");
  const before = await readState(db);
  await replaceState(db, before);
  assert.equal(await initializeLocale(db), "ar");
  await setLocale("sk");
  assert.equal(getLocale(), "sk");
});
