/** Native Google Play + trusted issuer integration point. No test or fake purchase implementation is shipped. */
export interface BillingAdapter {
  readonly available: boolean;
  purchaseAnnual(): Promise<string>;
  restoreAnnual(): Promise<string>;
}
export const billingAdapter: BillingAdapter = {
  available: false,
  async purchaseAnnual() {
    throw new Error("Nákup licencie nebol overený.");
  },
  async restoreAnnual() {
    throw new Error("Nákup licencie nebol overený.");
  },
};
