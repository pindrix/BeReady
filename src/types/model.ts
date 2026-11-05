import { z } from "zod";
import { messages } from "../i18n";

export const categories = [
  "jedlo",
  "voda",
  "hygiena",
  "lieky",
  "energia",
  "ostatné",
] as const;
export const categoryLabels = messages.categories;
export const units = ["kg", "g", "l", "ml", "ks", "bal."] as const;
export const goals = [3, 7, 14, 30, 90] as const;
export const topics = ["evakuácia", "blackout", "povodeň", "ukrytie"] as const;
const id = z.string().min(1).max(100);
const text = z.string().trim().max(2000);
const name = z.string().trim().min(1, "Vyplňte názov.").max(150);
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Použite dátum RRRR-MM-DD.")
  .refine((v) => {
    const d = new Date(v + "T12:00:00Z");
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Dátum neexistuje.");
const date = dateSchema.nullable();
const positive = z.number().finite().positive().max(1e12);
export const householdSchema = z
  .object({
    id: z.literal("main"),
    name: z.string().trim().max(150),
    people: z.number().int().min(1).max(10),
    goal: z.union([
      z.literal(3),
      z.literal(7),
      z.literal(14),
      z.literal(30),
      z.literal(90),
    ]),
    kcal: positive,
    water: positive,
    cooking: z.boolean(),
    meeting: text,
  })
  .strict();
export const inventorySchema = z
  .object({
    id,
    name,
    category: z.enum(categories),
    quantity: positive,
    unit: z.enum(units),
    kcal: z.number().finite().nonnegative().max(1e12).nullable(),
    expiry: date,
    expiryType: z.enum(["spotreba", "trvanlivosť"]),
    purchased: date,
    note: text,
  })
  .strict()
  .refine((v) => v.category !== "voda" || v.unit === "l" || v.unit === "ml", {
    message: "Pitnú vodu evidujte v litroch alebo mililitroch.",
    path: ["unit"],
  });
export const shoppingSchema = z
  .object({
    id,
    name,
    quantity: positive,
    unit: z.enum(units),
    done: z.boolean(),
  })
  .strict();
export const checklistSchema = z
  .object({ id, name, topic: z.enum(topics), done: z.boolean() })
  .strict();
export const contactSchema = z
  .object({ id, name, details: z.string().trim().min(1).max(2000) })
  .strict();
export const placeSchema = z
  .object({
    id,
    name,
    sourceUrl: z
      .url()
      .refine((v) => v.startsWith("https://"), "Zdroj musí byť HTTPS."),
    type: z.enum(["kryt", "úkryt", "iné"]),
    verified: dateSchema,
    status: z.enum(["overené", "neoverené", "nedostupné"]),
    note: text,
  })
  .strict();
export const stateSchema = z
  .object({
    household: householdSchema.nullable(),
    inventory: z.array(inventorySchema).max(10000),
    shopping: z.array(shoppingSchema).max(10000),
    checklists: z.array(checklistSchema).max(10000),
    contacts: z.array(contactSchema).max(1000),
    safePlaces: z.array(placeSchema).max(10000),
  })
  .strict()
  .superRefine((s, ctx) => {
    for (const key of [
      "inventory",
      "shopping",
      "checklists",
      "contacts",
      "safePlaces",
    ] as const) {
      if (new Set(s[key].map((x) => x.id)).size !== s[key].length)
        ctx.addIssue({
          code: "custom",
          message: `Duplicitné identifikátory: ${key}.`,
        });
    }
  });
export const backupSchema = z
  .object({
    version: z.literal(1),
    exportedAt: z.iso.datetime(),
    data: stateSchema,
  })
  .strict();
export type Household = z.infer<typeof householdSchema>;
export type Inventory = z.infer<typeof inventorySchema>;
export type Shopping = z.infer<typeof shoppingSchema>;
export type Checklist = z.infer<typeof checklistSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type SafePlace = z.infer<typeof placeSchema>;
export type State = z.infer<typeof stateSchema>;
export type EntityKey = "inventory" | "shopping" | "checklists" | "contacts";
export type Entities = {
  inventory: Inventory;
  shopping: Shopping;
  checklists: Checklist;
  contacts: Contact;
};
export const entitySchemas = {
  inventory: inventorySchema,
  shopping: shoppingSchema,
  checklists: checklistSchema,
  contacts: contactSchema,
};
export const defaultHousehold: Household = {
  id: "main",
  name: "",
  people: 1,
  goal: 7,
  kcal: 2200,
  water: 3.8,
  cooking: false,
  meeting: "",
};
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}
export function numeric(value: string): number {
  const normalized = value
    .trim()
    .replace(/[٠-٩۰-۹०-९০-৯]/g, (ch) => {
      const ranges = [0x660, 0x6f0, 0x966, 0x9e6];
      const code = ch.charCodeAt(0);
      const start = ranges.find((s) => code >= s && code < s + 10)!;
      return String(code - start);
    })
    .replace(/٬/g, "")
    .replace(/٫/g, ".")
    .replace(",", ".");
  return normalized === "" ? NaN : Number(normalized);
}
export function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError)
    return error.issues.map((x) => x.message).join("\n");
  return error instanceof Error
    ? error.message
    : "Operácia sa nepodarila. Skúste to znova.";
}
