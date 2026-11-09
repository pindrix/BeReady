import type { Checklist } from "../types/model";
export const disclaimer =
  "BE READY nie je oficiálna výstražná služba. V kríze sa riaď pokynmi záchranných zložiek a úradov.";
export const nutritionNote =
  "Kalórie nie sú zárukou vyváženej výživy. Ide o orientačný výpočet, nie zdravotné odporúčanie. Neznáme energetické hodnoty sa nezapočítavajú; odhad môže byť podhodnotený.";
export const catalog = [
  "Ryža",
  "Cestoviny",
  "Šošovica",
  "Fazuľa",
  "Rybie konzervy",
  "Mäsové konzervy",
  "Ovsené vločky",
  "Olej",
];
const seed: Record<Checklist["topic"], string[]> = {
  evakuácia: [
    "72-hodinový batoh",
    "Doklady a ich kópie",
    "Osobné lieky a lekárnička",
    "Kontakty na papieri",
    "Rádio a náhradné batérie",
    "Svetlo / baterka",
    "Pitná voda",
    "Jedlo pripravené na konzumáciu",
    "Potreby domácich zvierat",
    "Dohodnuté miesto stretnutia",
  ],
  blackout: [
    "Nabiť telefón a powerbanku",
    "Pripraviť baterku a rádio",
    "Obmedziť otváranie chladničky",
    "Pripraviť pitnú vodu",
    "Generátor používať iba vonku, ďaleko od otvorov budovy",
  ],
  povodeň: [
    "Sledovať oficiálne výstrahy",
    "Pripraviť doklady a lieky",
    "Naplánovať cestu do vyššej polohy",
    "Nevstupovať do povodňovej vody",
  ],
  ukrytie: [
    "Vybrať vnútornú miestnosť podľa pokynov úradov",
    "Pripraviť rádio, vodu a telefón",
    "Poznať spôsob vypnutia vetrania",
    "Dohodnúť kontakt s blízkymi",
  ],
};
export const initialChecklists: Checklist[] = Object.entries(seed).flatMap(
  ([topic, names]) =>
    names.map((name, i) => ({
      id: `seed-${topic}-${i}`,
      topic: topic as Checklist["topic"],
      name,
      done: false,
    })),
);
export type Guide = {
  id: string;
  title: string;
  steps: string[];
  source: string;
  reviewed: string;
};
// Date is an editorial review of bundled general advice, not verification of a live official website.
export const guides: Guide[] = [
  {
    id: "blackout",
    title: "Výpadok elektriny",
    steps: [
      "Použite baterku. S otvoreným ohňom hrozí požiar; sviečky radšej nahraďte bezpečným svetlom.",
      "Chladničku a mrazničku otvárajte čo najmenej. Bezpečnosť potravín posudzujte podľa teploty a pokynov úradov.",
      "Generátor, gril ani spaľovacie zariadenie nikdy nepoužívajte v byte, garáži či uzavretom priestore. Hrozí otrava oxidom uhoľnatým.",
      "Šetrite batériu telefónu a sledujte oficiálne informácie.",
    ],
    source: "https://www.ready.gov/power-outages",
    reviewed: "2026-11-03",
  },
  {
    id: "flood",
    title: "Povodeň",
    steps: [
      "Sledujte výstrahy a pokyny obce. Pri nariadenej evakuácii odíďte určenou trasou.",
      "Nevstupujte ani nevchádzajte autom do zaplavenej cesty. Hĺbka, prúd a poškodenie podkladu nemusia byť viditeľné.",
      "Presuňte sa na bezpečné vyššie miesto. Nedotýkajte sa elektrických zariadení vo vode.",
      "Povodňovú vodu nepovažujte za pitnú. Riaďte sa informáciami o bezpečnosti miestnej vody.",
    ],
    source: "https://www.ready.gov/floods",
    reviewed: "2026-11-03",
  },
  {
    id: "fire",
    title: "Požiar",
    steps: [
      "Ak môžete bezpečne uniknúť, okamžite opustite budovu. Nezdržujte sa zbieraním vecí a nepoužívajte výťah.",
      "Pri dyme sa držte nízko. Zatvorte za sebou dvere, ak to nebráni úniku.",
      "Z bezpečného miesta volajte 112 alebo 150. Do budovy sa nevracajte.",
      "Ak je únik zablokovaný, uzavrite dvere medzi sebou a požiarom a oznámte operátorovi svoju presnú polohu.",
    ],
    source: "https://www.ready.gov/home-fires",
    reviewed: "2026-11-03",
  },
  {
    id: "alert",
    title: "Siréna / výstraha",
    steps: [
      "Zistite oficiálny dôvod výstrahy z rozhlasu, rádia alebo oznamov obce. Nespoliehajte sa na neoverené správy.",
      "Ak ide o bezprostredné ohrozenie, vyhľadajte bezpečné miesto podľa charakteru udalosti a pokynov úradov.",
      "Sledujte pokyny na ukrytie alebo evakuáciu. Táto aplikácia neprijíma živé výstrahy ani nerozpoznáva signály sirén.",
    ],
    source: "https://www.minv.sk/?civilna-ochrana-obyvatelstva",
    reviewed: "2026-11-03",
  },
  {
    id: "chemical",
    title: "Únik nebezpečnej látky",
    steps: [
      "Nepribližujte sa k miestu úniku a nedotýkajte sa neznámej látky.",
      "Ak úrady nariadia ukrytie, vstúpte do vhodnej budovy, zatvorte okná a dvere a vypnite vetranie podľa pokynov.",
      "Voľba miestnosti a smer bezpečného presunu závisia od látky a situácie. Riaďte sa záchrannými zložkami.",
      "Pri ohrození volajte 112. Neužívajte preventívne lieky ani jód bez pokynu príslušných orgánov.",
    ],
    source: "https://www.ready.gov/hazardous-materials-incidents",
    reviewed: "2026-11-03",
  },
  {
    id: "evacuation",
    title: "Evakuácia",
    steps: [
      "Postupujte podľa pokynov úradov, určenej trasy a cieľa. Dajte blízkym vedieť, kam idete, ak to situácia dovolí.",
      "Vezmite doklady, lieky, vodu, telefón a pripravený batoh. Pomôžte deťom a ľuďom, ktorí potrebujú pomoc.",
      "Pripravte bezpečný presun domácich zvierat. Nezdržujte odchod úkonmi, ktoré by vás ohrozili.",
      "Vráťte sa až po povolení zodpovedných orgánov.",
    ],
    source: "https://www.ready.gov/evacuation",
    reviewed: "2026-11-03",
  },
];
export const emergencyNumbers = [
  { number: "112", name: "Integrovaný záchranný systém" },
  { number: "150", name: "Hasiči" },
  { number: "155", name: "Záchranná zdravotná služba" },
  { number: "158", name: "Polícia" },
];
