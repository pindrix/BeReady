import type { Sql } from "./repository";
import { verifyEntitlement, type VerifiedEntitlement } from "../domain/license";
import { signedLicenseVerifier } from "../domain/signed-license";
const TABLE =
  "CREATE TABLE IF NOT EXISTS signed_entitlements (id TEXT PRIMARY KEY NOT NULL CHECK (id = 'annual'), receipt TEXT NOT NULL);";
/** Call only after the store/server returns a signed, verified license envelope. Never from household import. */
export async function cacheSignedEntitlement(
  db: Sql,
  receipt: string,
  publicKeyHex: string,
  now: number,
): Promise<VerifiedEntitlement> {
  const verified = await verifyEntitlement(
    receipt,
    signedLicenseVerifier(publicKeyHex),
    now,
  );
  await db.execAsync(TABLE);
  await db.runAsync(
    "INSERT INTO signed_entitlements (id,receipt) VALUES ('annual',?) ON CONFLICT(id) DO UPDATE SET receipt=excluded.receipt",
    receipt,
  );
  return verified;
}
export async function loadSignedEntitlement(
  db: Sql,
  publicKeyHex: string,
  now: number,
): Promise<VerifiedEntitlement | null> {
  if (!publicKeyHex) return null;
  await db.execAsync(TABLE);
  const row = await db.getFirstAsync<{ receipt: string }>(
    "SELECT receipt FROM signed_entitlements WHERE id='annual'",
  );
  if (!row) return null;
  try {
    return await verifyEntitlement(
      row.receipt,
      signedLicenseVerifier(publicKeyHex),
      now,
    );
  } catch {
    return null;
  }
}
