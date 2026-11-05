import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { ed25519 } from "@noble/curves/ed25519.js";
import {
  licenseMessage,
  signedLicenseVerifier,
  type SignedLicensePayload,
} from "../src/domain/signed-license";
import {
  verifyEntitlement,
  evaluateLicense,
  addLicenseYearUtc,
  LICENSE_TERMS,
} from "../src/domain/license";
import {
  cacheSignedEntitlement,
  loadSignedEntitlement,
} from "../src/db/entitlement-store";
import {
  initialize,
  readState,
  replaceState,
  type Database,
} from "../src/db/repository";
const seed = new Uint8Array(32).fill(7); // Test-only signing key. Never shipped in the application bundle.
const publicKey = Buffer.from(ed25519.getPublicKey(seed)).toString("hex"),
  now = Date.UTC(2026, 10, 3);
const payload: SignedLicensePayload = {
  version: 1,
  productId: LICENSE_TERMS.productId,
  basePlanId: LICENSE_TERMS.basePlanId,
  transactionId: "test.GPA-001",
  purchaseState: "purchased",
  purchasedAt: now,
  expiresAt: addLicenseYearUtc(now),
  revoked: false,
};
function token(data = payload) {
  return JSON.stringify({
    payload: data,
    signature: Buffer.from(ed25519.sign(licenseMessage(data), seed)).toString(
      "hex",
    ),
  });
}
test("podpis od dôveryhodného vydavateľa aktivuje offline prístup; ručne zostavený objekt nie", async () => {
  const proof = await verifyEntitlement(
    token(),
    signedLicenseVerifier(publicKey),
    now,
  );
  assert.equal(
    evaluateLicense(
      { startedAt: now, lastSeenAt: now },
      now,
      { billingConfigured: true },
      proof,
    ).canUseOffline,
    true,
  );
  const raw = JSON.parse(JSON.stringify(proof));
  assert.equal(
    evaluateLicense(
      { startedAt: now, lastSeenAt: now },
      now,
      { billingConfigured: true },
      raw,
    ).canUseOffline,
    false,
  );
});
test("zmenený dátum, iný kľúč a poškodený podpis sa odmietnu", async () => {
  const verifier = signedLicenseVerifier(publicKey),
    forged = JSON.parse(token());
  forged.payload.expiresAt += 1;
  assert.equal(await verifier.verify(JSON.stringify(forged)), null);
  assert.equal(
    await signedLicenseVerifier("01".repeat(32)).verify(token()),
    null,
  );
  assert.equal(await verifier.verify("{"), null);
  forged.payload.expiresAt -= 1;
  forged.signature = "00".repeat(64);
  assert.equal(await verifier.verify(JSON.stringify(forged)), null);
});
test("overená expirovaná licencia neodomkne offline funkcie", async () => {
  const proof = await verifyEntitlement(
    token(),
    signedLicenseVerifier(publicKey),
    payload.expiresAt,
  );
  assert.equal(
    evaluateLicense(
      { startedAt: now, lastSeenAt: now },
      payload.expiresAt,
      { billingConfigured: true },
      proof,
    ).canUseOffline,
    false,
  );
});
test("podpísaná cache sa znovu overí bez siete a import domácnosti ju nemení", async () => {
  const raw = new DatabaseSync(":memory:");
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
  try {
    await initialize(db);
    await cacheSignedEntitlement(db, token(), publicKey, now);
    const state = await readState(db);
    await replaceState(db, { ...state, checklists: [] });
    const reloaded = await loadSignedEntitlement(db, publicKey, now + 1);
    assert.ok(reloaded);
    assert.equal(
      evaluateLicense(
        { startedAt: now, lastSeenAt: now },
        now + 1,
        { billingConfigured: true },
        reloaded,
      ).canUseOffline,
      true,
    );
    assert.equal(await loadSignedEntitlement(db, "", now), null);
  } finally {
    raw.close();
  }
});
