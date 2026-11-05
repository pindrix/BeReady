import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import * as Network from "expo-network";
import { billingAdapter } from "../billing/adapter";
import {
  cacheSignedEntitlement,
  loadSignedEntitlement,
} from "../db/entitlement-store";
import { observeLicense } from "../db/license-store";
import {
  evaluateLicense,
  evaluateFeatureAccess,
  type LicenseState,
  type Connectivity,
} from "../domain/license";
// A release must replace this adapter with store billing and verified, signed entitlements.
export const BILLING_CONFIGURATION = {
  configured: billingAdapter.available,
  // Public verification key only. The signing private key must never enter the app.
  publicKey: process.env.EXPO_PUBLIC_LICENSE_VERIFICATION_KEY ?? "",
  platform: "google-play",
  productId: "ready_year_access",
  basePlanId: "annual-prepaid",
} as const;
type Value = {
  state: LicenseState | null;
  connectivity: Connectivity;
  error: string;
  refresh: () => Promise<void>;
  purchase: () => Promise<void>;
  restorePurchase: () => Promise<void>;
};
const Context = createContext<Value | null>(null);
function networkState(v: Network.NetworkState): Connectivity {
  if (v.isConnected === false || v.isInternetReachable === false)
    return "offline";
  if (v.isInternetReachable === true) return "online";
  return "unknown";
}
export function LicenseProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext(),
    [state, setState] = useState<LicenseState | null>(null),
    [connectivity, setConnectivity] = useState<Connectivity>("unknown"),
    [error, setError] = useState("");
  async function refresh() {
    try {
      const now = Date.now(),
        record = await observeLicense(db, now),
        entitlement = await loadSignedEntitlement(
          db,
          BILLING_CONFIGURATION.publicKey,
          now,
        );
      setState(
        evaluateLicense(
          record,
          now,
          { billingConfigured: BILLING_CONFIGURATION.configured },
          entitlement,
        ),
      );
      const network = await Network.getNetworkStateAsync();
      setConnectivity(networkState(network));
      setError("");
    } catch {
      setConnectivity("unknown");
      setError("Stav licencie alebo siete sa nepodarilo načítať.");
    }
  }
  async function checkout(restore: boolean) {
    if (
      connectivity !== "online" ||
      !billingAdapter.available ||
      !BILLING_CONFIGURATION.publicKey
    )
      throw new Error("Nákup licencie nebol overený.");
    const signed = await (restore
      ? billingAdapter.restoreAnnual()
      : billingAdapter.purchaseAnnual());
    const now = Date.now(),
      entitlement = await cacheSignedEntitlement(
        db,
        signed,
        BILLING_CONFIGURATION.publicKey,
        now,
      ),
      record = await observeLicense(db, now);
    setState(
      evaluateLicense(
        record,
        now,
        { billingConfigured: BILLING_CONFIGURATION.configured },
        entitlement,
      ),
    );
  }
  useEffect(() => {
    let active = true;
    async function observe() {
      try {
        const now = Date.now(),
          record = await observeLicense(db, now),
          entitlement = await loadSignedEntitlement(
            db,
            BILLING_CONFIGURATION.publicKey,
            now,
          );
        if (active)
          setState(
            evaluateLicense(
              record,
              now,
              { billingConfigured: BILLING_CONFIGURATION.configured },
              entitlement,
            ),
          );
        const network = await Network.getNetworkStateAsync();
        if (active) {
          setConnectivity(networkState(network));
          setError("");
        }
      } catch {
        if (active) {
          setConnectivity("unknown");
          setError("Stav licencie alebo siete sa nepodarilo načítať.");
        }
      }
    }
    void observe();
    const network = Network.addNetworkStateListener((v) => {
      if (active) setConnectivity(networkState(v));
    });
    const app = AppState.addEventListener("change", (v) => {
      if (v === "active") void observe();
    });
    const timer = setInterval(() => void observe(), 60000);
    return () => {
      active = false;
      network.remove();
      app.remove();
      clearInterval(timer);
    };
  }, [db]);
  return (
    <Context.Provider
      value={{
        state,
        connectivity,
        error,
        refresh,
        purchase: () => checkout(false),
        restorePurchase: () => checkout(true),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useLicense() {
  const value = useContext(Context);
  if (!value) throw new Error("Chýba kontext licencie.");
  return value;
}
export function protectedAccess(value: Pick<Value, "state" | "connectivity">) {
  return value.state
    ? evaluateFeatureAccess(value.state, value.connectivity)
    : { allowed: false as const, reason: "connectivity-unknown" as const };
}
