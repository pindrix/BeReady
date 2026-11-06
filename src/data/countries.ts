/** Bundled national emergency contacts. Language never selects a country. */
export type EmergencyCountry = {
  code: string;
  name: string;
  primary: string;
  medical: string;
  fire: string;
  police: string;
  source: string;
  primaryName?: string;
};
const euSource = "https://digital-strategy.ec.europa.eu/en/policies/112";
const eu = [
  ["AT", "Österreich"],
  ["BE", "Belgique / België"],
  ["BG", "България"],
  ["HR", "Hrvatska"],
  ["CY", "Κύπρος"],
  ["CZ", "Česko"],
  ["DK", "Danmark"],
  ["EE", "Eesti"],
  ["FI", "Suomi"],
  ["FR", "France"],
  ["DE", "Deutschland"],
  ["GR", "Ελλάδα"],
  ["HU", "Magyarország"],
  ["IE", "Ireland"],
  ["IT", "Italia"],
  ["LV", "Latvija"],
  ["LT", "Lietuva"],
  ["LU", "Luxembourg"],
  ["MT", "Malta"],
  ["NL", "Nederland"],
  ["PL", "Polska"],
  ["PT", "Portugal"],
  ["RO", "România"],
  ["SK", "Slovensko"],
  ["SI", "Slovenija"],
  ["ES", "España"],
  ["SE", "Sverige"],
];
export const emergencyCountries: EmergencyCountry[] = eu.map(
  ([code, name]) => ({
    code,
    name,
    primary: "112",
    medical: code === "SK" || code === "CZ" ? "155" : "112",
    fire: code === "SK" || code === "CZ" ? "150" : "112",
    police: code === "SK" || code === "CZ" ? "158" : "112",
    source: euSource,
  }),
);
for (const [code, name, number, source] of [
  [
    "GB",
    "United Kingdom",
    "999",
    "https://www.gov.uk/contact-emergency-services",
  ],
  ["US", "United States", "911", "https://www.911.gov/calling-911/"],
  [
    "CA",
    "Canada",
    "911",
    "https://www.canada.ca/en/health-canada/services/health-care-system/health-care-services/emergency-services.html",
  ],
  ["AU", "Australia", "000", "https://www.triplezero.gov.au/"],
  [
    "NZ",
    "New Zealand",
    "111",
    "https://www.govt.nz/browse/law-crime-and-justice/emergencies/",
  ],
  ["IN", "भारत / India", "112", "https://112.gov.in/"],
  [
    "CH",
    "Schweiz / Suisse / Svizzera",
    "112",
    "https://www.ch.ch/en/safety-and-justice/emergencies-and-danger/",
  ],
  [
    "NO",
    "Norge",
    "112",
    "https://www.politiet.no/en/english/contact-the-police/",
  ],
  ["IS", "Ísland", "112", "https://www.112.is/en"],
])
  emergencyCountries.push({
    code,
    name,
    primary: number,
    medical: code === "NO" ? "113" : code === "CH" ? "144" : number,
    fire: code === "NO" ? "110" : code === "CH" ? "118" : number,
    police: code === "CH" ? "117" : number,
    source,
    primaryName: code === "NO" ? "Polícia" : undefined,
  });
emergencyCountries.push({
  code: "ZZ",
  name: "Other / Iná krajina",
  primary: "—",
  medical: "—",
  fire: "—",
  police: "—",
  source: "",
});
export function countryByCode(code: unknown) {
  return emergencyCountries.find((c) => c.code === code);
}
export function numbersForCountry(code: unknown) {
  const c = countryByCode(code);
  if (!c || c.code === "ZZ") return [];
  return [
    {
      number: c.primary,
      name: c.primaryName ?? "Integrovaný záchranný systém",
    },
    { number: c.fire, name: "Hasiči" },
    { number: c.medical, name: "Záchranná zdravotná služba" },
    { number: c.police, name: "Polícia" },
  ].filter(
    (item, index, items) =>
      items.findIndex(
        (other) => other.name === item.name && other.number === item.number,
      ) === index,
  );
}
/** Only emergency-number source strings are passed here; personal data opts out. */
export function localizeEmergencyNumbers(text: string, code: unknown): string {
  const c = countryByCode(code);
  const map: Record<string, string> = {
    "112": c?.primary ?? "—",
    "155": c?.medical ?? "—",
    "150": c?.fire ?? "—",
    "158": c?.police ?? "—",
  };
  return text
    .replace(/\b(112|155|150|158)\b/g, (n) => map[n])
    .replace(
      /\b(\d{3})\s*(?:\/|alebo|or|ou|oder|lub|або|или|nebo|vagy|of|sau|ή|eller|atau|o|或|或者|या|বা|أو)\s*\1\b/gu,
      "$1",
    );
}
