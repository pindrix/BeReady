import type { Sql } from "./repository";
import {
  assertLicenseTimestamp,
  validateInstallation,
  type InstallationRecord,
} from "../domain/license";

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS device_installation (
 id TEXT PRIMARY KEY NOT NULL CHECK (id = 'install'),
 started_at INTEGER NOT NULL CHECK (started_at >= 0),
 last_seen_at INTEGER NOT NULL CHECK (last_seen_at >= started_at)
);`;
/** This device-local metadata is deliberately outside readState/replaceState and JSON backups. */
export async function initializeLicense(
  db: Sql,
  now: number,
): Promise<InstallationRecord> {
  assertLicenseTimestamp(now);
  await db.execAsync(CREATE_TABLE);
  // One atomic statement: concurrent initializers cannot reset started_at or move last_seen_at back.
  await db.runAsync(
    `INSERT INTO device_installation (id,started_at,last_seen_at) VALUES ('install',?,?)
    ON CONFLICT(id) DO UPDATE SET last_seen_at=MAX(device_installation.last_seen_at,excluded.last_seen_at)`,
    now,
    now,
  );
  return readLicenseInstallation(db);
}
export async function readLicenseInstallation(
  db: Sql,
): Promise<InstallationRecord> {
  const row = await db.getFirstAsync<{
    started_at: number;
    last_seen_at: number;
  }>(
    "SELECT started_at,last_seen_at FROM device_installation WHERE id='install'",
  );
  if (!row) throw new Error("Chýba lokálny záznam skúšobného obdobia.");
  return Object.freeze(
    validateInstallation({
      startedAt: row.started_at,
      lastSeenAt: row.last_seen_at,
    }),
  );
}
/** Observing the clock never accepts a supplied trial start, receipt or paid flag. */
export async function observeLicense(
  db: Sql,
  now: number,
): Promise<InstallationRecord> {
  return initializeLicense(db, now);
}
