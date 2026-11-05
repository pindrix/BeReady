import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  initialize,
  readState,
  replaceState,
  type Database,
} from "../src/db/repository";
import {
  initializeLicense,
  observeLicense,
  readLicenseInstallation,
} from "../src/db/license-store";
import { decodeBackup, encodeBackup } from "../src/domain/backup";
import { DAY_MS } from "../src/domain/license";
function open(path: string) {
  const raw = new DatabaseSync(path);
  const sql = {
    execAsync: async (q: string) => {
      raw.exec(q);
    },
    runAsync: async (q: string, ...p: SQLInputValue[]) =>
      raw.prepare(q).run(...p),
    getAllAsync: async (q: string, ...p: SQLInputValue[]) =>
      raw.prepare(q).all(...p),
    getFirstAsync: async (q: string, ...p: SQLInputValue[]) =>
      raw.prepare(q).get(...p) ?? null,
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
  const db = sql as unknown as Database;
  return { db, raw };
}
const start = Date.parse("2026-11-03T12:00:00Z");
test("inštalácia sa začne iba raz a posledný čas nikdy neklesne", async () => {
  const { db, raw } = open(":memory:");
  try {
    assert.deepEqual(await initializeLicense(db, start), {
      startedAt: start,
      lastSeenAt: start,
    });
    assert.deepEqual(await observeLicense(db, start + DAY_MS), {
      startedAt: start,
      lastSeenAt: start + DAY_MS,
    });
    assert.deepEqual(await initializeLicense(db, start - 1000), {
      startedAt: start,
      lastSeenAt: start + DAY_MS,
    });
    assert.equal(
      (
        raw.prepare("SELECT COUNT(*) n FROM device_installation").get() as {
          n: number;
        }
      ).n,
      1,
    );
  } finally {
    raw.close();
  }
});
test("JSON záloha a obnovenie domácnosti neprenesú ani neresetujú trial", async () => {
  const { db, raw } = open(":memory:");
  try {
    await initialize(db);
    await initializeLicense(db, start);
    await observeLicense(db, start + 10 * DAY_MS);
    const before = await readLicenseInstallation(db),
      state = await readState(db),
      backup = encodeBackup(state);
    assert.ok(!backup.includes("startedAt"));
    assert.ok(!backup.includes("device_installation"));
    await replaceState(db, decodeBackup(backup));
    assert.deepEqual(await readLicenseInstallation(db), before);
  } finally {
    raw.close();
  }
});
test("lokálna inštalácia pretrvá zatvorenie a opätovné otvorenie SQLite", async () => {
  const dir = mkdtempSync(join(tmpdir(), "ready-license-")),
    path = join(dir, "db.sqlite");
  let c = open(path);
  try {
    await initializeLicense(c.db, start);
    await observeLicense(c.db, start + 5 * DAY_MS);
    c.raw.close();
    c = open(path);
    assert.deepEqual(await initializeLicense(c.db, start + 8 * DAY_MS), {
      startedAt: start,
      lastSeenAt: start + 8 * DAY_MS,
    });
  } finally {
    c.raw.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test("neplatný čas sa odmietne pred zmenou inštalačného záznamu", async () => {
  const { db, raw } = open(":memory:");
  try {
    await initializeLicense(db, start);
    await assert.rejects(() => observeLicense(db, NaN));
    assert.deepEqual(await readLicenseInstallation(db), {
      startedAt: start,
      lastSeenAt: start,
    });
  } finally {
    raw.close();
  }
});
