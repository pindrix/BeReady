import { test } from "node:test";
import assert from "node:assert/strict";
import { kitModules, KIT_PETS_FLAG } from "../src/data/field-kit";
import {
  kitItemRecord,
  kitPetsRecord,
  packingProgress,
  waterPackingPlan,
} from "../src/domain/field-kit";
import { academyGuides } from "../src/data/academy";
import {
  defaultHousehold,
  type Inventory,
  type State,
} from "../src/types/model";
import { encodeBackup, decodeBackup } from "../src/domain/backup";
test("baliaca stanica má osem skutočných modulov, jedinečné položky a funkčné návody", () => {
  assert.equal(kitModules.length, 8);
  assert.equal(kitModules.flatMap((x) => x.items).length, 24);
  assert.equal(
    new Set(kitModules.flatMap((x) => x.items).map((x) => x.id)).size,
    24,
  );
  for (const module of kitModules) {
    assert.ok(academyGuides.some((g) => g.id === module.guide));
    assert.ok(module.items.every((x) => x.name && x.detail));
  }
});
test("pokrok počíta len známe položky bez duplicít a začína bez zvierat", () => {
  const item = kitItemRecord(kitModules[0].items[0], true);
  const progress = packingProgress([
    item,
    item,
    { id: "kit-unknown", name: "starý záznam", topic: "evakuácia", done: true },
    { id: "mission-water", name: "misia", topic: "ukrytie", done: true },
  ]);
  assert.equal(progress.completed, 1);
  assert.equal(progress.total, 21);
  assert.equal(progress.modules.length, 7);
  assert.equal(progress.includePets, false);
});
test("voliteľný modul zvierat sa aktivuje vedome a po vypnutí nepočíta jeho úlohy", () => {
  const pet = kitItemRecord(
    kitModules.find((x) => x.id === "pets")!.items[0],
    true,
  );
  assert.equal(packingProgress([pet]).completed, 0);
  const enabled = packingProgress([kitPetsRecord(true), pet]);
  assert.equal(enabled.total, 24);
  assert.equal(enabled.completed, 1);
  assert.equal(enabled.modules.length, 8);
  assert.equal(packingProgress([kitPetsRecord(false), pet]).completed, 0);
  assert.equal(kitPetsRecord(true).id, KIT_PETS_FLAG);
});
test("všetky známe moduly môžu mať dokončenie100 percent, zrušenie ho zmení", () => {
  const rows = kitModules
    .flatMap((x) => x.items)
    .map((item) => kitItemRecord(item, true));
  const done = packingProgress([kitPetsRecord(true), ...rows]);
  assert.equal(done.percent, 100);
  assert.equal(done.completed, 24);
  const undone = packingProgress([kitPetsRecord(true), ...rows.slice(1)]);
  assert.equal(undone.completed, 23);
  assert.ok(undone.percent < 100);
});
test("výpočet vody preberá profil a skutočné litre z inventára bez jedla", () => {
  const inventory: Inventory[] = [
    {
      id: "water",
      name: "Voda",
      category: "voda",
      quantity: 22800,
      unit: "ml",
      kcal: null,
      expiry: null,
      expiryType: "spotreba",
      purchased: null,
      note: "",
    },
    {
      id: "food",
      name: "Polievka",
      category: "jedlo",
      quantity: 50,
      unit: "l",
      kcal: null,
      expiry: null,
      expiryType: "spotreba",
      purchased: null,
      note: "",
    },
  ];
  const p = waterPackingPlan({ ...defaultHousehold, people: 2 }, inventory, 3);
  assert.ok(Math.abs(p.required - 22.8) < 1e-10);
  assert.ok(Math.abs(p.stored - 22.8) < 1e-10);
  assert.ok(Math.abs(p.missing) < 1e-10);
  assert.equal(p.coverage, 1);
  assert.equal(p.waterMassApproxKg, p.required);
  const bigger = waterPackingPlan(
    { ...defaultHousehold, people: 2 },
    inventory,
    7,
  );
  assert.ok(Math.abs(bigger.required - 53.2) < 1e-10);
  assert.ok(bigger.missing > 0);
});
test("voda nesmie mať nulový profil ani nepodporované dni a deficit nie je záporný", () => {
  assert.throws(() =>
    waterPackingPlan({ ...defaultHousehold, people: 0 }, [], 3),
  );
  for (const days of [0, -1, NaN, 1, 365])
    assert.throws(() => waterPackingPlan(defaultHousehold, [], days));
  const inventory: Inventory[] = [
    {
      id: "w",
      name: "Voda",
      category: "voda",
      quantity: 1000,
      unit: "l",
      kcal: null,
      expiry: null,
      expiryType: "spotreba",
      purchased: null,
      note: "",
    },
  ];
  const p = waterPackingPlan(defaultHousehold, inventory, 3);
  assert.equal(p.missing, 0);
  assert.equal(p.coverage, 1);
});
test("stará schéma zálohy zachová nové potvrdenia výbavy aj voliteľný modul", () => {
  const state: State = {
    household: defaultHousehold,
    inventory: [],
    shopping: [],
    checklists: [
      kitPetsRecord(true),
      kitItemRecord(kitModules[0].items[0], true),
    ],
    contacts: [],
    safePlaces: [],
  };
  assert.deepEqual(decodeBackup(encodeBackup(state)), state);
});
