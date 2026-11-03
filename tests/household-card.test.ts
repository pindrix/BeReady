import { test } from "node:test";
import assert from "node:assert/strict";
import {
  householdCard,
  householdCardText,
  CARD_CONTACT_LIMIT,
} from "../src/domain/household-card";
import { defaultHousehold } from "../src/types/model";
const profile = {
  ...defaultHousehold,
  name: "Súkromná rodina",
  meeting: "Tajné miesto stretnutia",
};
const contacts = [
  { id: "c", name: "Súkromný kontakt", details: "+421 999 123 456" },
];
test("núdzová karta predvolene nezahrnie žiadne osobné údaje ani do textu", () => {
  const card = householdCard(profile, contacts);
  const text = householdCardText(card);
  assert.equal(card.personal, false);
  for (const secret of [
    profile.name,
    profile.meeting,
    contacts[0].name,
    contacts[0].details,
  ])
    assert.ok(!text.includes(secret));
  for (const number of ["112", "150", "155", "158"])
    assert.ok(text.includes(number));
});
test("výslovný výber zahrnie presne názov, dohodu a uložené kontakty", () => {
  const text = householdCardText(householdCard(profile, contacts, true));
  for (const detail of [
    profile.name,
    profile.meeting,
    contacts[0].name,
    contacts[0].details,
  ])
    assert.ok(text.includes(detail));
});
test("prázdna domácnosť má pravdivé prázdne stavy", () => {
  const text = householdCardText(householdCard(null, [], true));
  assert.ok(text.includes("Miesto stretnutia ešte nie je vyplnené."));
  assert.ok(text.includes("Kontakty ešte nie sú vyplnené."));
  assert.ok(!text.includes("undefined"));
});
test("veľký adresár sa vedome skráti a karta informuje o vynechaných kontaktoch", () => {
  const list = Array.from({ length: 10 }, (_, i) => ({
    id: String(i),
    name: `Kontakt ${i}`,
    details: `údaj ${i}`,
  }));
  const card = householdCard(profile, list, true);
  assert.equal(card.contacts.length, CARD_CONTACT_LIMIT);
  assert.equal(card.omittedContacts, 4);
  assert.ok(householdCardText(card).includes("ďalších 4 kontaktov"));
  assert.ok(!householdCardText(card).includes("Kontakt 9"));
});
