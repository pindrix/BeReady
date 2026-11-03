import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  initialize,
  readState,
  saveEntity,
  saveHousehold,
  deleteEntity,
  replaceState,
  addShopping,
  type Database,
} from "../src/db/repository";
import { defaultHousehold } from "../src/types/model";
import { decodeBackup, encodeBackup } from "../src/domain/backup";
function open(path: string) {
  const raw = new DatabaseSync(path);
  const sql = {
    execAsync: async (query: string) => {
      raw.exec(query);
    },
    runAsync: async (query: string, ...params: SQLInputValue[]) =>
      raw.prepare(query).run(...params),
    getAllAsync: async (query: string, ...params: SQLInputValue[]) =>
      raw.prepare(query).all(...params),
    getFirstAsync: async (query: string, ...params: SQLInputValue[]) =>
      raw.prepare(query).get(...params) ?? null,
    withExclusiveTransactionAsync: async (
      task: (tx: Database) => Promise<void>,
    ) => {
      raw.exec("BEGIN IMMEDIATE");
      try {
        await task(db);
        raw.exec("COMMIT");
      } catch (e) {
        raw.exec("ROLLBACK");
        throw e;
      }
    },
  };
  // Node and Expo expose different result metadata, but identical SQL binding and row semantics used here.
  const db = sql as unknown as Database;
  return { db, raw };
}
test("čistá DB vytvorí tabuľky, migráciu a úlohy iba raz; žiadne kryty", async () => {
  const { db, raw } = open(":memory:");
  try {
    await initialize(db);
    const s = await readState(db);
    assert.equal(s.household, null);
    assert.equal(s.safePlaces.length, 0);
    assert.ok(s.checklists.length > 10);
    await saveEntity(db, "checklists", { ...s.checklists[0], done: true });
    await initialize(db);
    const after = await readState(db);
    assert.equal(after.checklists.length, s.checklists.length);
    assert.equal(after.checklists[0].done, true);
    assert.equal(
      (
        raw.prepare("SELECT COUNT(*) AS n FROM schema_migrations").get() as {
          n: number;
        }
      ).n,
      1,
    );
  } finally {
    raw.close();
  }
});
test("CRUD a všetky entity pretrvajú zatvorenie a nové otvorenie SQLite", async () => {
  const dir = mkdtempSync(join(tmpdir(), "ready-test-")),
    path = join(dir, "ready.db");
  let connection = open(path);
  try {
    const { db } = connection;
    await initialize(db);
    await saveHousehold(db, {
      ...defaultHousehold,
      name: "Domov",
      meeting: "Námestie",
    });
    const item = {
      id: "quoted",
      name: "Ryža '); DROP TABLE households; --",
      quantity: 2.5,
      unit: "kg" as const,
      category: "jedlo" as const,
      kcal: 3500,
      expiry: null,
      expiryType: "trvanlivosť" as const,
      purchased: null,
      note: "Test",
    };
    await saveEntity(db, "inventory", item);
    await saveEntity(db, "inventory", { ...item, quantity: 3 });
    await saveEntity(db, "inventory", { ...item, id: "delete" });
    await deleteEntity(db, "inventory", "delete");
    await saveEntity(db, "contacts", {
      id: "c",
      name: "Mama",
      details: "Text",
    });
    await addShopping(db, [
      { id: "s", name: "Voda", quantity: 3, unit: "l", done: true },
    ]);
    const before = await readState(db);
    connection.raw.close();
    connection = open(path);
    await initialize(connection.db);
    const after = await readState(connection.db);
    assert.deepEqual(after, before);
    assert.equal(after.inventory.length, 1);
    assert.equal(after.inventory[0].quantity, 3);
    assert.equal(after.household?.meeting, "Námestie");
  } finally {
    connection.raw.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test("export/import obnoví celý stav bez opätovného nasadenia úloh", async () => {
  const { db, raw } = open(":memory:");
  try {
    await initialize(db);
    await saveHousehold(db, defaultHousehold);
    const state = await readState(db);
    const incoming = {
      ...state,
      checklists: [],
      shopping: [
        {
          id: "s",
          name: "Ryža",
          unit: "kg" as const,
          quantity: 2,
          done: false,
        },
      ],
    };
    await replaceState(db, decodeBackup(encodeBackup(incoming)));
    await initialize(db);
    assert.deepEqual(await readState(db), incoming);
  } finally {
    raw.close();
  }
});
test("neplatné údaje sa neuložia a chybný import nič neprepíše", async () => {
  const { db, raw } = open(":memory:");
  try {
    await initialize(db);
    const before = await readState(db);
    await assert.rejects(() =>
      saveHousehold(db, { ...defaultHousehold, people: 0 }),
    );
    await assert.rejects(() =>
      replaceState(db, {
        ...before,
        contacts: [{ id: "x", name: "", details: "" }],
      }),
    );
    assert.deepEqual(await readState(db), before);
  } finally {
    raw.close();
  }
});
test("SQL chyba počas importu vráti aj už zmazané údaje (rollback)", async () => {
  const { db, raw } = open(":memory:");
  try {
    await initialize(db);
    await saveHousehold(db, { ...defaultHousehold, name: "Pôvodný profil" });
    const before = await readState(db);
    raw.exec(
      "CREATE TRIGGER fail_import BEFORE INSERT ON shopping_items BEGIN SELECT RAISE(ABORT, 'test failure'); END;",
    );
    await assert.rejects(() =>
      replaceState(db, {
        ...before,
        household: { ...defaultHousehold, name: "Nový profil" },
        shopping: [
          { id: "x", name: "Test", quantity: 1, unit: "ks", done: false },
        ],
      }),
    );
    assert.deepEqual(await readState(db), before);
  } finally {
    raw.close();
  }
});
test("novšia migrácia nespôsobí tiché prepísanie schémy", async () => {
  const { db, raw } = open(":memory:");
  try {
    await initialize(db);
    raw.exec("INSERT INTO schema_migrations VALUES (2, '2026-11-03');");
    await assert.rejects(() => initialize(db), /novšia/);
  } finally {
    raw.close();
  }
});
