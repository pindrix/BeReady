/** Device-local trial accounting and the trust boundary for future store billing. */
export const DAY_MS = 24 * 60 * 60 * 1000;
export const CLOCK_CHANGE_TOLERANCE_MS = 5 * 60 * 1000;
export const LICENSE_TERMS = Object.freeze({
  trialDays: 14,
  priceUsd: 10,
  durationMonths: 12,
  autoRenew: false,
  productId: "ready_year_access",
  basePlanId: "annual-prepaid",
});
export type InstallationRecord = Readonly<{
  startedAt: number;
  lastSeenAt: number;
}>;
export type LicensePolicy = Readonly<{ billingConfigured: boolean }>;
export type LicenseStatus = "trial" | "licensed" | "expired" | "clock-change";
export type LicenseState = Readonly<{
  status: LicenseStatus;
  /** Online eligibility. Route gates must additionally evaluate connectivity. */
  canUsePaidFeatures: boolean;
  canUseOffline: boolean;
  hasVerifiedOfflineAccess: boolean;
  requiresPurchase: boolean;
  developmentMode: boolean;
  trialEndsAt: number;
  remainingTrialDays: number;
  licenseEndsAt: number | null;
  clockChanged: boolean;
  effectiveNow: number;
}>;

export function assertLicenseTimestamp(value: number): void {
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > 8_640_000_000_000_000
  )
    throw new Error("Neplatný čas licencie.");
}
export function validateInstallation(
  record: InstallationRecord,
): InstallationRecord {
  if (!record || typeof record !== "object")
    throw new Error("Chýba záznam inštalácie.");
  assertLicenseTimestamp(record.startedAt);
  assertLicenseTimestamp(record.lastSeenAt);
  if (record.lastSeenAt < record.startedAt)
    throw new Error("Záznam inštalácie obsahuje neplatné poradie časov.");
  assertLicenseTimestamp(record.startedAt + LICENSE_TERMS.trialDays * DAY_MS);
  return record;
}
/** Calendar-year duration, retaining UTC clock time; Feb 29 becomes Feb 28. */
export function addLicenseYearUtc(start: number): number {
  assertLicenseTimestamp(start);
  const date = new Date(start),
    year = date.getUTCFullYear() + 1,
    month = date.getUTCMonth(),
    day = date.getUTCDate();
  const result = new Date(start);
  result.setUTCDate(1);
  result.setUTCFullYear(year);
  result.setUTCMonth(month);
  const monthEnd = new Date(start);
  monthEnd.setUTCFullYear(year, month + 1, 0);
  result.setUTCDate(Math.min(day, monthEnd.getUTCDate()));
  const value = result.getTime();
  assertLicenseTimestamp(value);
  return value;
}

export type StoreVerification = Readonly<{
  productId: string;
  basePlanId: string;
  purchaseState: "purchased" | "pending";
  transactionId: string;
  purchasedAt: number;
  expiresAt: number;
  revoked: boolean;
}>;
/** The bridge must validate the store transaction or a signed entitlement before returning data. */
export type LicenseVerifier = {
  verify(receipt: string): Promise<StoreVerification | null>;
};
declare const entitlementBrand: unique symbol;
export type VerifiedEntitlement = Readonly<
  StoreVerification & { [entitlementBrand]: true }
>;
const trustedEntitlements = new WeakSet<object>();
/**
 * Only this trusted-verifier boundary can mint an accepted in-memory entitlement.
 * Never implement the verifier as a local Boolean, date entry, test button or backup parser.
 */
export async function verifyEntitlement(
  receipt: string,
  verifier: LicenseVerifier,
  now: number,
): Promise<VerifiedEntitlement> {
  assertLicenseTimestamp(now);
  if (
    typeof receipt !== "string" ||
    receipt.trim().length === 0 ||
    receipt.length > 1_000_000
  )
    throw new Error("Chýba platný doklad o nákupe.");
  const proof = await verifier.verify(receipt);
  if (
    !proof ||
    proof.productId !== LICENSE_TERMS.productId ||
    proof.basePlanId !== LICENSE_TERMS.basePlanId ||
    proof.purchaseState !== "purchased" ||
    typeof proof.transactionId !== "string" ||
    !proof.transactionId.trim() ||
    proof.transactionId.length > 300 ||
    proof.revoked !== false
  )
    throw new Error("Nákup licencie nebol overený.");
  assertLicenseTimestamp(proof.purchasedAt);
  assertLicenseTimestamp(proof.expiresAt);
  // The trusted Play bridge checks the annual prepaid base plan. Its verified expiryTime is authoritative, including top-ups.
  if (
    proof.purchasedAt > now + CLOCK_CHANGE_TOLERANCE_MS ||
    proof.expiresAt <= proof.purchasedAt
  )
    throw new Error("Overená licencia nemá platné ročné obdobie.");
  const entitlement = Object.freeze({ ...proof }) as VerifiedEntitlement;
  trustedEntitlements.add(entitlement);
  return entitlement;
}
export function isVerifiedEntitlement(
  value: unknown,
): value is VerifiedEntitlement {
  return (
    typeof value === "object" &&
    value !== null &&
    trustedEntitlements.has(value)
  );
}
export function evaluateLicense(
  record: InstallationRecord,
  now: number,
  policy: LicensePolicy,
  entitlement?: VerifiedEntitlement | null,
): LicenseState {
  validateInstallation(record);
  assertLicenseTimestamp(now);
  if (!policy || typeof policy.billingConfigured !== "boolean")
    throw new Error("Chýba konfigurácia licencie.");
  const effectiveNow = Math.max(now, record.lastSeenAt),
    trialEndsAt = record.startedAt + LICENSE_TERMS.trialDays * DAY_MS;
  const clockChanged = now + CLOCK_CHANGE_TOLERANCE_MS < record.lastSeenAt;
  const trusted = isVerifiedEntitlement(entitlement),
    licenseEndsAt = trusted ? entitlement.expiresAt : null;
  const paid =
    trusted &&
    effectiveNow >= entitlement.purchasedAt &&
    effectiveNow < entitlement.expiresAt;
  const trial = effectiveNow < trialEndsAt;
  const status: LicenseStatus = paid
    ? "licensed"
    : clockChanged
      ? "clock-change"
      : trial
        ? "trial"
        : "expired";
  const developmentMode = !policy.billingConfigured;
  // Once a significant rollback is observed, never grant fresh trial time based on that clock.
  const active = paid || (trial && !clockChanged);
  return Object.freeze({
    status,
    canUsePaidFeatures: active || developmentMode,
    canUseOffline: paid,
    hasVerifiedOfflineAccess: paid,
    requiresPurchase: !active && !developmentMode,
    developmentMode,
    trialEndsAt,
    remainingTrialDays: Math.max(
      0,
      Math.ceil((trialEndsAt - effectiveNow) / DAY_MS),
    ),
    licenseEndsAt,
    clockChanged,
    effectiveNow,
  });
}

export type Connectivity = "online" | "offline" | "unknown";
export type FeatureScope = "protected" | "essential";
export type FeatureAccess = Readonly<{
  allowed: boolean;
  reason:
    | "essential"
    | "licensed"
    | "trial-online"
    | "development-online"
    | "offline-license-required"
    | "connectivity-unknown"
    | "purchase-required"
    | "clock-change";
}>;
/**
 * Online trial is separate from the paid offline entitlement. This is an access policy,
 * not encryption of bundled content or a replacement for authenticating purchases.
 */
export function evaluateFeatureAccess(
  state: LicenseState,
  connectivity: Connectivity,
  scope: FeatureScope = "protected",
): FeatureAccess {
  if (!["online", "offline", "unknown"].includes(connectivity))
    throw new Error("Neplatný stav pripojenia.");
  if (scope !== "protected" && scope !== "essential")
    throw new Error("Neplatný rozsah funkcie.");
  if (scope === "essential") return { allowed: true, reason: "essential" };
  if (
    state.hasVerifiedOfflineAccess &&
    state.canUseOffline &&
    state.status === "licensed"
  )
    return { allowed: true, reason: "licensed" };
  if (connectivity === "offline")
    return { allowed: false, reason: "offline-license-required" };
  if (connectivity === "unknown")
    return { allowed: false, reason: "connectivity-unknown" };
  if (state.developmentMode)
    return { allowed: true, reason: "development-online" };
  if (state.status === "clock-change")
    return { allowed: false, reason: "clock-change" };
  if (state.status === "trial" && state.canUsePaidFeatures)
    return { allowed: true, reason: "trial-online" };
  return { allowed: false, reason: "purchase-required" };
}
