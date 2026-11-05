/** Visual fixture, not a billing adapter or production entitlement. */
export const BILLING_CONFIGURATION = { configured: false };
export function useLicense() {
  return {
    state: { status: "trial", remainingTrialDays: 14, canUseOffline: false },
    connectivity: "online",
    error: "",
    refresh: async () => {},
    purchase: async () => {},
    restorePurchase: async () => {},
  };
}

export function protectedAccess() {
  return { allowed: true, reason: "development-online" };
}
