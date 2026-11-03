import type { Contact, Household } from "../types/model";
import { emergencyNumbers } from "../data/content";

export const CARD_CONTACT_LIMIT = 6;
export type HouseholdCard = {
  title: string;
  household: string;
  meeting: string;
  contacts: { name: string; details: string }[];
  omittedContacts: number;
  personal: boolean;
};

/** Personal fields never enter the view or share payload unless explicitly selected. */
export function householdCard(
  profile: Household | null,
  contacts: Contact[],
  includePersonal = false,
): HouseholdCard {
  const listed = includePersonal ? contacts.slice(0, CARD_CONTACT_LIMIT) : [];
  return {
    title: "Rodinná núdzová karta",
    household: includePersonal
      ? profile?.name.trim() || "Moja domácnosť"
      : "PRE VAŠU DOMÁCNOSŤ",
    meeting: includePersonal
      ? profile?.meeting.trim() || "Miesto stretnutia ešte nie je vyplnené."
      : "Osobné údaje sú skryté.",
    contacts: listed.map(({ name, details }) => ({ name, details })),
    omittedContacts: includePersonal
      ? Math.max(0, contacts.length - CARD_CONTACT_LIMIT)
      : 0,
    personal: includePersonal,
  };
}

export function householdCardText(card: HouseholdCard): string {
  const lines = [
    "READY / RODINNÁ NÚDZOVÁ KARTA",
    card.household,
    "",
    "TIESŇOVÉ LINKY NA SLOVENSKU",
    ...emergencyNumbers.map(({ number, name }) => `${number} — ${name}`),
    "",
    "MIESTO STRETNUTIA",
    card.meeting,
  ];
  if (card.personal) {
    lines.push("", "BLÍZKE OSOBY");
    if (!card.contacts.length) lines.push("Kontakty ešte nie sú vyplnené.");
    else
      card.contacts.forEach(({ name, details }) =>
        lines.push(`${name}: ${details}`),
      );
    if (card.omittedContacts)
      lines.push(
        `Na karte nie je uvedených ďalších ${card.omittedContacts} kontaktov. Všetky sú v aplikácii.`,
      );
  }
  lines.push(
    "",
    "Pri núdzovom volaní povedzte, čo sa stalo, kde ste a kto potrebuje pomoc. Riaďte sa operátorom.",
    "READY nie je oficiálna výstražná služba. Riaďte sa pokynmi záchranných zložiek a úradov.",
  );
  return lines.join("\n");
}
