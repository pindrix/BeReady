import { kitModules, KIT_PETS_FLAG, type KitModule } from "../data/field-kit";
import {
  checklistSchema,
  householdSchema,
  goals,
  type Checklist,
  type Household,
  type Inventory,
} from "../types/model";
import { coverage } from "./readiness";
export function kitItemRecord(
  item: KitModule["items"][number],
  done: boolean,
): Checklist {
  return checklistSchema.parse({
    id: `kit-${item.id}`,
    name: item.name,
    topic: "evakuácia",
    done,
  });
}
export function kitPetsRecord(done: boolean): Checklist {
  return checklistSchema.parse({
    id: KIT_PETS_FLAG,
    name: "Domáce zvieratá sú súčasťou našej výbavy",
    topic: "evakuácia",
    done,
  });
}
export function packingProgress(checklists: Checklist[]) {
  const includePets = checklists.some((x) => x.id === KIT_PETS_FLAG && x.done);
  const doneIds = new Set(checklists.filter((x) => x.done).map((x) => x.id));
  const modules = kitModules
    .filter((module) => !module.optional || includePets)
    .map((module) => ({
      module,
      completed: module.items.filter((item) => doneIds.has(`kit-${item.id}`))
        .length,
      total: module.items.length,
      items: module.items.map((item) => ({
        ...item,
        done: doneIds.has(`kit-${item.id}`),
      })),
    }));
  const completed = modules.reduce((sum, module) => sum + module.completed, 0),
    total = modules.reduce((sum, module) => sum + module.total, 0);
  return {
    includePets,
    modules,
    completed,
    total,
    percent: (completed / total) * 100,
  };
}
export function waterPackingPlan(
  profile: Household,
  inventory: Inventory[],
  days: number,
) {
  const p = householdSchema.parse(profile);
  if (!(goals as readonly number[]).includes(days))
    throw new Error("Vyberte podporovaný počet dní.");
  const current = coverage(p, inventory, undefined, days),
    required = p.people * p.water * days;
  return {
    days,
    people: p.people,
    perPerson: p.water,
    required,
    stored: current.liters,
    missing: current.missingWater,
    coverage: Math.min(1, current.liters / required),
    waterMassApproxKg: required,
  };
}
