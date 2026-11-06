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

test("country and first-run choice persist independently from language and household backup", async () => {
  const region = await import("../src/state/region");
  await region.initializeRegion(db);
  assert.equal(region.getCountryCode(), null);
  assert.equal(region.isWelcomeComplete(), false);
  await region.setCountryCode("US");
  await region.completeWelcome();
  await setLocale("en", db);
  await replaceState(db, await readState(db));
  await region.initializeRegion(db);
  assert.equal(region.getCountryCode(), "US");
  assert.equal(region.isWelcomeComplete(), true);
  assert.equal(getLocale(), "en");
  const { translateText } = await import("../src/i18n");
  assert.equal(translateText("150 l", "sk"), "150 l");
  assert.equal(
    translateText("Pri ohrození volajte 112.", "sk"),
    "Pri ohrození volajte 911.",
  );
  await region.setCountryCode("SK");
  await setLocale("sk", db);
});
