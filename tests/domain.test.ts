import { test } from "node:test";
import assert from "node:assert/strict";
import {
  coverage,
  expiryStatus,
  shoppingProposal,
} from "../src/domain/readiness";
import { decodeBackup, encodeBackup } from "../src/domain/backup";
import { safePlacesView } from "../src/domain/safe-places";
import {
  defaultHousehold,
  householdSchema,
  inventorySchema,
  numeric,
  stateSchema,
  type Inventory,
  type State,
} from "../src/types/model";
import { guides, initialChecklists } from "../src/data/content";
const today = "2026-11-03";
const item: Inventory = {
  id: "rice",
  name: "Ryža",
  category: "jedlo",
  quantity: 1,
  unit: "kg",
  kcal: 6600,
  expiry: null,
  expiryType: "spotreba",
  purchased: null,
  note: "",
};
const state: State = {
  household: defaultHousehold,
  inventory: [item],
  shopping: [],
  checklists: initialChecklists,
  contacts: [],
  safePlaces: [],
};
test("1 osoba, 6600 kcal => 3 dni", () =>
  assert.equal(coverage(defaultHousehold, [item], today).foodDays, 3));
test("2 osoby, 8800 kcal => 2 dni", () =>
  assert.equal(
    coverage(
      { ...defaultHousehold, people: 2 },
      [{ ...item, kcal: 8800 }],
      today,
    ).foodDays,
    2,
  ));
test("2 osoby, 22,8 l vody => 3 dni", () =>
  assert.ok(
    Math.abs(
      coverage(
        { ...defaultHousehold, people: 2 },
        [{ ...item, category: "voda", quantity: 22.8, unit: "l", kcal: null }],
        today,
      ).waterDays - 3,
    ) < 1e-10,
  ));
test("mililitre sa prevádzajú, voda v jedle sa nepočíta", () => {
  const c = coverage(
    defaultHousehold,
    [
      {
        ...item,
        id: "water",
        category: "voda",
        quantity: 3800,
        unit: "ml",
        kcal: null,
      },
      { ...item, unit: "l", quantity: 100 },
    ],
    today,
  );
  assert.ok(Math.abs(c.liters - 3.8) < 1e-10);
  assert.ok(Math.abs(c.waterDays - 1) < 1e-10);
});
test("neznáme kcal sa neodhadujú, nulová energia nie je neznáma", () => {
  const c = coverage(
    defaultHousehold,
    [
      { ...item, kcal: null },
      { ...item, id: "zero", kcal: 0 },
    ],
    today,
  );
  assert.equal(c.energy, 0);
  assert.equal(c.unknown, 1);
});
test("exspirované položky zostávajú v evidencii, ale nie v krytí", () => {
  const items = [
    { ...item, expiry: "2026-11-02" },
    {
      ...item,
      id: "bb",
      expiry: "2026-11-02",
      expiryType: "trvanlivosť" as const,
    },
  ];
  const c = coverage(defaultHousehold, items, today);
  assert.equal(c.energy, 0);
  assert.equal(c.expired, 2);
  assert.equal(items.length, 2);
});
test("dnešný dátum ešte platí; hranica upozornenia je 30 dní", () => {
  assert.equal(
    coverage(defaultHousehold, [{ ...item, expiry: today }], today).energy,
    6600,
  );
  assert.equal(expiryStatus({ ...item, expiry: "2026-12-03" }, today), "soon");
  assert.equal(expiryStatus({ ...item, expiry: "2026-12-04" }, today), "ok");
});
test("záporné množstvo, NaN, nekonečno a neplatné kcal sa odmietnu", () => {
  for (const quantity of [-1, 0, NaN, Infinity])
    assert.equal(
      inventorySchema.safeParse({ ...item, quantity }).success,
      false,
    );
  assert.equal(inventorySchema.safeParse({ ...item, kcal: -1 }).success, false);
});
test("profil odmietne delenie nulou a neplatný cieľ", () => {
  for (const p of [
    { people: 0 },
    { people: 1.5 },
    { people: 11 },
    { kcal: 0 },
    { water: 0 },
    { water: NaN },
    { goal: 5 },
  ]) {
    assert.equal(
      householdSchema.safeParse({ ...defaultHousehold, ...p }).success,
      false,
    );
    assert.throws(() =>
      coverage(
        { ...defaultHousehold, ...p } as typeof defaultHousehold,
        [],
        today,
      ),
    );
  }
});
test("kalendárne dátumy sa kontrolujú, vrátane priestupného roka", () => {
  for (const expiry of ["2026-02-29", "2026-04-31", "2026-13-01", "03.11.2026"])
    assert.equal(inventorySchema.safeParse({ ...item, expiry }).success, false);
  assert.equal(
    inventorySchema.safeParse({ ...item, expiry: "2028-02-29" }).success,
    true,
  );
});
test("pitná voda vyžaduje l alebo ml", () =>
  assert.equal(
    inventorySchema.safeParse({ ...item, category: "voda", unit: "ks" })
      .success,
    false,
  ));
test("deficit nikdy nie je záporný, platí pre každý cieľ", () => {
  for (const goal of [3, 7, 14, 30, 90]) {
    const c = coverage(
      defaultHousehold,
      [
        { ...item, quantity: 1e6 },
        { ...item, id: "water", category: "voda", unit: "l", quantity: 1e6 },
      ],
      today,
      goal,
    );
    assert.equal(c.missingKcal, 0);
    assert.equal(c.missingWater, 0);
  }
});
test("kcal z nejedlých kategórií sa nezapočítajú", () =>
  assert.equal(
    coverage(defaultHousehold, [{ ...item, category: "energia" }], today)
      .energy,
    0,
  ));
test("návrh rozlišuje varenie, platí len deficit a negeneruje nulové položky", () => {
  const cold = shoppingProposal(defaultHousehold, [], 3, today),
    hot = shoppingProposal(
      { ...defaultHousehold, cooking: true },
      [],
      3,
      today,
    );
  assert.ok(cold.some((x) => x.name.includes("Konzervy")));
  assert.ok(!cold.some((x) => x.name.includes("Ryža")));
  assert.ok(hot.some((x) => x.name.includes("Ryža")));
  assert.ok(cold.every((x) => x.quantity > 0));
  assert.equal(cold.find((x) => x.name === "Pitná voda")?.quantity, 11.4);
  assert.deepEqual(
    shoppingProposal(
      defaultHousehold,
      [
        { ...item, quantity: 1e6 },
        { ...item, id: "w", category: "voda", unit: "l", quantity: 1e6 },
      ],
      3,
      today,
    ),
    [],
  );
});
test("JSON roundtrip zachová všetky entity a desatinné čísla", () => {
  const data = {
    ...state,
    contacts: [{ id: "c", name: "Blízky", details: "Textový kontakt" }],
    shopping: [
      { id: "s", name: "Voda", quantity: 2.5, unit: "l" as const, done: true },
    ],
  };
  assert.deepEqual(decodeBackup(encodeBackup(data)), data);
});
test("import odmietne neplatné schémy, verziu, polia, duplicity a poškodený JSON", () => {
  const backup = JSON.parse(encodeBackup(state));
  for (const text of [
    "{",
    JSON.stringify({ ...backup, version: 2 }),
    JSON.stringify({ ...backup, data: {} }),
    JSON.stringify({ ...backup, unexpected: true }),
    JSON.stringify({ ...backup, data: { ...state, inventory: [item, item] } }),
  ])
    assert.throws(() => decodeBackup(text));
  assert.throws(() => decodeBackup(" ".repeat(10 * 1024 * 1024 + 1)));
  assert.equal(
    stateSchema.safeParse({
      ...state,
      household: { ...defaultHousehold, people: 0 },
    }).success,
    false,
  );
});
test("predvolené kryty sú prázdne, import sa neprezentuje ako garancia", () => {
  assert.deepEqual(safePlacesView(state.safePlaces), {
    empty: true,
    places: [],
  });
  const view = safePlacesView([
    {
      id: "p",
      name: "Používateľský záznam",
      sourceUrl: "https://example.org",
      type: "kryt",
      verified: today,
      status: "neoverené",
      note: "",
    },
  ]);
  assert.ok(view.places[0].label.includes("negarantuje"));
  assert.equal(view.places[0].status, "neoverené");
});
test("offlinové návody majú obsah, zdroj a dátum; žiadne živé závislosti", () => {
  assert.equal(guides.length, 6);
  for (const g of guides) {
    assert.ok(g.steps.length >= 3);
    assert.match(g.source, /^https:\/\/(www\.ready\.gov|www\.minv\.sk)\//);
    assert.match(g.reviewed, /^\d{4}-\d{2}-\d{2}$/);
  }
});
test("formulárové čísla akceptujú slovenskú čiarku, odmietnu prázdny vstup", () => {
  assert.equal(numeric("3,8"), 3.8);
  assert.ok(Number.isNaN(numeric(" ")));
  assert.ok(Number.isNaN(numeric("abc")));
});
