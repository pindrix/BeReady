import {
  householdSchema,
  inventorySchema,
  type Household,
  type Inventory,
  type Shopping,
  newId,
  goals,
} from "../types/model";
export function localDay(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function expiryStatus(
  item: Inventory,
  today = localDay(),
): "past" | "soon" | "ok" {
  if (!item.expiry) return "ok";
  if (item.expiry < today) return "past";
  const days =
    (Date.parse(item.expiry + "T12:00:00Z") -
      Date.parse(today + "T12:00:00Z")) /
    86400000;
  return days <= 30 ? "soon" : "ok";
}
export function coverage(
  profile: Household,
  items: Inventory[],
  today = localDay(),
  target: number = profile.goal,
) {
  householdSchema.parse(profile);
  if (!(goals as readonly number[]).includes(target))
    throw new Error("Neplatné cieľové obdobie.");
  let energy = 0,
    liters = 0,
    unknown = 0,
    expired = 0,
    soon = 0;
  for (const raw of items) {
    const item = inventorySchema.parse(raw),
      status = expiryStatus(item, today);
    if (status === "past") {
      expired++;
      continue;
    }
    if (status === "soon") soon++;
    if (item.category === "jedlo") {
      if (item.kcal === null) unknown++;
      else energy += item.quantity * item.kcal;
    }
    if (item.category === "voda")
      liters += item.quantity * (item.unit === "ml" ? 0.001 : 1);
  }
  const energyNeed = profile.people * profile.kcal,
    waterNeed = profile.people * profile.water;
  return {
    energy,
    liters,
    unknown,
    expired,
    soon,
    foodDays: energy / energyNeed,
    waterDays: liters / waterNeed,
    missingKcal: Math.max(0, energyNeed * target - energy),
    missingWater: Math.max(0, waterNeed * target - liters),
  };
}
// Planner reference densities are explicit assumptions, never inventory nutrition data.
export const shoppingTemplates = {
  cooking: [
    {
      name: "Ryža (overte energiu na obale)",
      unit: "kg" as const,
      kcal: 3600,
      share: 0.4,
    },
    {
      name: "Ovsené vločky (overte obal)",
      unit: "kg" as const,
      kcal: 3700,
      share: 0.3,
    },
    {
      name: "Strukoviny suché (overte obal)",
      unit: "kg" as const,
      kcal: 3300,
      share: 0.3,
    },
  ],
  noCooking: [
    {
      name: "Konzervy pripravené na jedenie (overte obal)",
      unit: "kg" as const,
      kcal: 1200,
      share: 0.6,
    },
    {
      name: "Trvanlivé pečivo (overte obal)",
      unit: "kg" as const,
      kcal: 3500,
      share: 0.4,
    },
  ],
};
export function shoppingProposal(
  p: Household,
  items: Inventory[],
  target: number,
  today = localDay(),
): Shopping[] {
  const c = coverage(p, items, today, target);
  const roundUp = (v: number) => Math.ceil(v * 100) / 100;
  const result = shoppingTemplates[p.cooking ? "cooking" : "noCooking"]
    .filter(() => c.missingKcal > 0)
    .map((t) => ({
      id: newId(),
      name: t.name,
      quantity: roundUp((c.missingKcal * t.share) / t.kcal),
      unit: t.unit,
      done: false,
    }));
  return c.missingWater > 0
    ? [
        ...result,
        {
          id: newId(),
          name: "Pitná voda",
          quantity: roundUp(c.missingWater),
          unit: "l",
          done: false,
        },
      ]
    : result;
}
