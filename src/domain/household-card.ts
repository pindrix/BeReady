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

export function householdCardText(
  card: HouseholdCard,
  translate: (value: string) => string = (value) => value,
): string {
  const lines = [
    translate("READY / RODINNÁ NÚDZOVÁ KARTA"),
    card.personal ? card.household : translate(card.household),
    "",
    translate("TIESŇOVÉ LINKY NA SLOVENSKU"),
    ...emergencyNumbers.map(
      ({ number, name }) => `${number} — ${translate(name)}`,
    ),
    "",
    translate("MIESTO STRETNUTIA"),
    card.personal ? card.meeting : translate(card.meeting),
  ];
  if (card.personal) {
    lines.push("", translate("BLÍZKE OSOBY"));
    if (!card.contacts.length)
      lines.push(translate("Kontakty ešte nie sú vyplnené."));
    else
      card.contacts.forEach(({ name, details }) =>
        lines.push(`${name}: ${details}`),
      );
    if (card.omittedContacts)
      lines.push(
        translate(
          `Na karte nie je uvedených ďalších ${card.omittedContacts} kontaktov. Všetky sú v aplikácii.`,
        ),
      );
  }
  lines.push(
    "",
    translate(
      "Pri núdzovom volaní povedzte, čo sa stalo, kde ste a kto potrebuje pomoc. Riaďte sa operátorom.",
    ),
    translate(
      "READY nie je oficiálna výstražná služba. Riaďte sa pokynmi záchranných zložiek a úradov.",
    ),
  );
  return lines.join("\n");
}
