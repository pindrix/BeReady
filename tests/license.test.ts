import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAY_MS,
  LICENSE_TERMS,
  CLOCK_CHANGE_TOLERANCE_MS,
  addLicenseYearUtc,
  evaluateLicense,
  verifyEntitlement,
  isVerifiedEntitlement,
  evaluateFeatureAccess,
  type LicenseVerifier,
  type VerifiedEntitlement,
} from "../src/domain/license";
const start = Date.parse("2026-11-03T10:15:30Z"),
  record = { startedAt: start, lastSeenAt: start },
  configured = { billingConfigured: true };
const trusted = (
  purchasedAt: number,
  patch: Record<string, unknown> = {},
): LicenseVerifier => ({
  verify: async () => ({
    productId: LICENSE_TERMS.productId,
    basePlanId: LICENSE_TERMS.basePlanId,
    purchaseState: "purchased",
    transactionId: "store-transaction",
    purchasedAt,
    expiresAt: addLicenseYearUtc(purchasedAt),
    revoked: false,
    ...patch,
  }),
});
test("14 dní znamená presne 14×24 hodín, hranica vyprší bez ďalšieho dňa", () => {
  const first = evaluateLicense(record, start, configured);
  assert.equal(first.remainingTrialDays, 14);
  assert.equal(first.status, "trial");
  assert.equal(first.canUsePaidFeatures, true);
  const last = evaluateLicense(record, start + 14 * DAY_MS - 1, configured);
  assert.equal(last.status, "trial");
  assert.equal(last.remainingTrialDays, 1);
  const end = evaluateLicense(record, start + 14 * DAY_MS, configured);
  assert.equal(end.status, "expired");
  assert.equal(end.remainingTrialDays, 0);
  assert.equal(end.canUsePaidFeatures, false);
  assert.equal(end.requiresPurchase, true);
});
test("ročná licencia zachová UTC čas a správne obslúži priestupný február", () => {
  assert.equal(
    new Date(
      addLicenseYearUtc(Date.parse("2028-02-29T12:34:56.789Z")),
    ).toISOString(),
    "2029-02-28T12:34:56.789Z",
  );
  assert.equal(
    new Date(
      addLicenseYearUtc(Date.parse("2027-03-01T12:00:00Z")),
    ).toISOString(),
    "2028-03-01T12:00:00.000Z",
  );
  assert.equal(addLicenseYearUtc(start), Date.parse("2027-11-03T10:15:30Z"));
  assert.equal(LICENSE_TERMS.priceUsd, 10);
  assert.equal(LICENSE_TERMS.autoRenew, false);
});
test("neplatné časy a poškodené inštalačné poradie sa odmietnu", () => {
  for (const bad of [NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER])
    assert.throws(() => evaluateLicense(record, bad, configured));
  assert.throws(() =>
    evaluateLicense(
      { startedAt: start, lastSeenAt: start - 1 },
      start,
      configured,
    ),
  );
  assert.throws(() => addLicenseYearUtc(8_640_000_000_000_000));
});
test("posun hodín späť nepredĺži trial a výrazný posun je zreteľný stav", () => {
  const observed = { startedAt: start, lastSeenAt: start + 13 * DAY_MS };
  const state = evaluateLicense(observed, start + 2 * DAY_MS, configured);
  assert.equal(state.status, "clock-change");
  assert.equal(state.clockChanged, true);
  assert.equal(state.remainingTrialDays, 1);
  assert.equal(state.canUsePaidFeatures, false);
  const small = evaluateLicense(
    observed,
    observed.lastSeenAt - CLOCK_CHANGE_TOLERANCE_MS,
    configured,
  );
  assert.equal(small.status, "trial");
  assert.equal(small.effectiveNow, observed.lastSeenAt);
  const expired = evaluateLicense(
    { ...observed, lastSeenAt: start + 20 * DAY_MS },
    start + 2 * DAY_MS,
    configured,
  );
  assert.equal(expired.remainingTrialDays, 0);
  assert.equal(expired.canUsePaidFeatures, false);
});
test("vývojová verzia bez pripojenej platby nezamkne používateľa za nemožným nákupom", () => {
  const state = evaluateLicense(record, start + 20 * DAY_MS, {
    billingConfigured: false,
  });
  assert.equal(state.status, "expired");
  assert.equal(state.developmentMode, true);
  assert.equal(state.canUsePaidFeatures, true);
  assert.equal(state.requiresPurchase, false);
});
test("overený nákup odomkne iba vlastný kalendárny rok a na hranici vyprší", async () => {
  const entitlement = await verifyEntitlement(
    "trusted-receipt",
    trusted(start),
    start,
  );
  assert.equal(isVerifiedEntitlement(entitlement), true);
  const state = evaluateLicense(
    record,
    start + 100 * DAY_MS,
    configured,
    entitlement,
  );
  assert.equal(state.status, "licensed");
  assert.equal(state.licenseEndsAt, addLicenseYearUtc(start));
  assert.equal(
    evaluateLicense(record, addLicenseYearUtc(start), configured, entitlement)
      .status,
    "expired",
  );
  assert.equal(
    evaluateLicense(record, addLicenseYearUtc(start), configured, entitlement)
      .canUsePaidFeatures,
    false,
  );
});
test("surový objekt, bool a JSON kópia overenia neaktivujú platenú licenciu", async () => {
  const proof = await verifyEntitlement("receipt", trusted(start), start);
  for (const fake of [
    true,
    { ...proof },
    JSON.parse(JSON.stringify(proof)),
    { purchasedAt: start, expiresAt: addLicenseYearUtc(start), verified: true },
  ]) {
    assert.equal(isVerifiedEntitlement(fake), false);
    assert.equal(
      evaluateLicense(
        record,
        start + 20 * DAY_MS,
        configured,
        fake as VerifiedEntitlement,
      ).canUsePaidFeatures,
      false,
    );
  }
});
test("odmietne chýbajúci, odvolaný, nesprávny produkt a neplatné obdobie dokladu", async () => {
  await assert.rejects(() => verifyEntitlement("", trusted(start), start));
  await assert.rejects(() =>
    verifyEntitlement("receipt", { verify: async () => null }, start),
  );
  for (const patch of [
    { revoked: true },
    { productId: "other" },
    { transactionId: "" },
    { purchasedAt: NaN },
    { expiresAt: start },
    { basePlanId: "auto-renewing" },
    { purchaseState: "pending" },
    {
      purchasedAt: start + DAY_MS,
      expiresAt: addLicenseYearUtc(start + DAY_MS),
    },
  ])
    await assert.rejects(() =>
      verifyEntitlement("receipt", trusted(start, patch), start),
    );
});
test("aktívna overená licencia môže fungovať offline aj pri zmene hodín s dôveryhodným posledným časom", async () => {
  const proof = await verifyEntitlement("receipt", trusted(start), start);
  const state = evaluateLicense(
    { startedAt: start, lastSeenAt: start + 20 * DAY_MS },
    start + DAY_MS,
    configured,
    proof,
  );
  assert.equal(state.status, "licensed");
  assert.equal(state.clockChanged, true);
  assert.equal(state.canUsePaidFeatures, true);
});

test("14-dňová skúška odomyká online nástroje, nie offline funkcie", () => {
  const trial = evaluateLicense(record, start, configured);
  assert.equal(trial.canUseOffline, false);
  assert.equal(trial.hasVerifiedOfflineAccess, false);
  assert.deepEqual(evaluateFeatureAccess(trial, "online"), {
    allowed: true,
    reason: "trial-online",
  });
  assert.deepEqual(evaluateFeatureAccess(trial, "offline"), {
    allowed: false,
    reason: "offline-license-required",
  });
  assert.deepEqual(evaluateFeatureAccess(trial, "unknown"), {
    allowed: false,
    reason: "connectivity-unknown",
  });
});
test("vývojový režim nepredstiera zaplatený offline prístup", () => {
  const dev = evaluateLicense(record, start + 30 * DAY_MS, {
    billingConfigured: false,
  });
  assert.equal(dev.canUsePaidFeatures, true);
  assert.equal(dev.canUseOffline, false);
  assert.equal(dev.hasVerifiedOfflineAccess, false);
  assert.equal(evaluateFeatureAccess(dev, "online").allowed, true);
  assert.equal(evaluateFeatureAccess(dev, "offline").allowed, false);
  assert.equal(evaluateFeatureAccess(dev, "unknown").allowed, false);
});
test("iba platné overené ročné oprávnenie umožní chránené nástroje offline", async () => {
  const proof = await verifyEntitlement("receipt", trusted(start), start);
  const paid = evaluateLicense(record, start + 30 * DAY_MS, configured, proof);
  assert.equal(paid.canUseOffline, true);
  assert.equal(paid.hasVerifiedOfflineAccess, true);
  for (const connectivity of ["online", "offline", "unknown"] as const)
    assert.deepEqual(evaluateFeatureAccess(paid, connectivity), {
      allowed: true,
      reason: "licensed",
    });
  const expired = evaluateLicense(record, proof.expiresAt, configured, proof);
  assert.equal(expired.canUseOffline, false);
  assert.equal(evaluateFeatureAccess(expired, "offline").allowed, false);
});
test("tiesňové vytáčanie a čítanie/export údajov sú mimo zámku aj po skončení skúšky", () => {
  const expired = evaluateLicense(record, start + 30 * DAY_MS, configured);
  for (const connectivity of ["online", "offline", "unknown"] as const)
    assert.deepEqual(
      evaluateFeatureAccess(expired, connectivity, "essential"),
      { allowed: true, reason: "essential" },
    );
  assert.equal(evaluateFeatureAccess(expired, "online").allowed, false);
});

test("overený Play expiryTime je autoritatívny aj pri dobití ročného prepaid plánu", async () => {
  const expiresAt = addLicenseYearUtc(addLicenseYearUtc(start));
  const proof = await verifyEntitlement(
    "receipt",
    trusted(start, { expiresAt }),
    start,
  );
  const state = evaluateLicense(
    record,
    addLicenseYearUtc(start) + DAY_MS,
    configured,
    proof,
  );
  assert.equal(state.status, "licensed");
  assert.equal(state.licenseEndsAt, expiresAt);
  assert.equal(state.canUseOffline, true);
});
