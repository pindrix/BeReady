import { ed25519 } from "@noble/curves/ed25519.js";
import { z } from "zod";
import {
  LICENSE_TERMS,
  type LicenseVerifier,
  type StoreVerification,
} from "./license";
const storeId = z
  .string()
  .min(1)
  .max(300)
  .regex(/^[A-Za-z0-9._:-]+$/);
const signedPayloadSchema = z
  .object({
    version: z.literal(1),
    productId: storeId,
    basePlanId: storeId,
    transactionId: storeId,
    purchaseState: z.literal("purchased"),
    purchasedAt: z.number().int().nonnegative().safe(),
    expiresAt: z.number().int().positive().safe(),
    revoked: z.literal(false),
  })
  .strict();
export type SignedLicensePayload = z.infer<typeof signedPayloadSchema>;
export function licenseMessage(payload: SignedLicensePayload): Uint8Array {
  const p = signedPayloadSchema.parse(payload);
  const text = JSON.stringify({
    version: p.version,
    productId: p.productId,
    basePlanId: p.basePlanId,
    transactionId: p.transactionId,
    purchaseState: p.purchaseState,
    purchasedAt: p.purchasedAt,
    expiresAt: p.expiresAt,
    revoked: p.revoked,
  });
  // The schema restricts store identifiers to ASCII; no browser-only encoding API is needed.
  return Uint8Array.from(text, (ch) => ch.charCodeAt(0));
}
function hex(value: string, length: number): Uint8Array {
  if (!new RegExp(`^[a-fA-F0-9]{${length * 2}}$`).test(value))
    throw new Error("Neplatný podpis licencie.");
  return Uint8Array.from(value.match(/../g)!, (v) => Number.parseInt(v, 16));
}
export function signedLicenseVerifier(publicKeyHex: string): LicenseVerifier {
  const publicKey = hex(publicKeyHex, 32);
  return {
    async verify(receipt: string): Promise<StoreVerification | null> {
      try {
        if (receipt.length > 16000) return null;
        const envelope = z
          .object({ payload: signedPayloadSchema, signature: z.string() })
          .strict()
          .parse(JSON.parse(receipt));
        if (
          envelope.payload.productId !== LICENSE_TERMS.productId ||
          envelope.payload.basePlanId !== LICENSE_TERMS.basePlanId
        )
          return null;
        if (
          !ed25519.verify(
            hex(envelope.signature, 64),
            licenseMessage(envelope.payload),
            publicKey,
          )
        )
          return null;
        const { version: _version, ...proof } = envelope.payload;
        return proof;
      } catch {
        return null;
      }
    },
  };
}
