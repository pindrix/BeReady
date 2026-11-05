export const localeCodes = [
  "sk",
  "en",
  "zh",
  "hi",
  "es",
  "ar",
  "fr",
  "bn",
  "pt",
  "ru",
  "id",
  "de",
  "it",
  "pl",
  "uk",
  "cs",
  "hu",
  "nl",
  "ro",
  "el",
  "sv",
] as const;
export type LocaleCode = (typeof localeCodes)[number];
export const languages: {
  code: LocaleCode;
  nativeName: string;
  name: string;
  intl: string;
  rtl?: boolean;
}[] = [
  { code: "sk", nativeName: "Slovenčina", name: "Slovenčina", intl: "sk-SK" },
  { code: "en", nativeName: "English", name: "Angličtina", intl: "en-US" },
  { code: "zh", nativeName: "简体中文", name: "Čínština", intl: "zh-CN" },
  { code: "hi", nativeName: "हिन्दी", name: "Hindčina", intl: "hi-IN" },
  { code: "es", nativeName: "Español", name: "Španielčina", intl: "es-ES" },
  {
    code: "ar",
    nativeName: "العربية",
    name: "Arabčina",
    intl: "ar",
    rtl: true,
  },
  { code: "fr", nativeName: "Français", name: "Francúzština", intl: "fr-FR" },
  { code: "bn", nativeName: "বাংলা", name: "Bengálčina", intl: "bn-BD" },
  { code: "pt", nativeName: "Português", name: "Portugalčina", intl: "pt-PT" },
  { code: "ru", nativeName: "Русский", name: "Ruština", intl: "ru-RU" },
  {
    code: "id",
    nativeName: "Bahasa Indonesia",
    name: "Indonézština",
    intl: "id-ID",
  },
  { code: "de", nativeName: "Deutsch", name: "Nemčina", intl: "de-DE" },
  { code: "it", nativeName: "Italiano", name: "Taliančina", intl: "it-IT" },
  { code: "pl", nativeName: "Polski", name: "Poľština", intl: "pl-PL" },
  { code: "uk", nativeName: "Українська", name: "Ukrajinčina", intl: "uk-UA" },
  { code: "cs", nativeName: "Čeština", name: "Čeština", intl: "cs-CZ" },
  { code: "hu", nativeName: "Magyar", name: "Maďarčina", intl: "hu-HU" },
  { code: "nl", nativeName: "Nederlands", name: "Holandčina", intl: "nl-NL" },
  { code: "ro", nativeName: "Română", name: "Rumunčina", intl: "ro-RO" },
  { code: "el", nativeName: "Ελληνικά", name: "Gréčtina", intl: "el-GR" },
  { code: "sv", nativeName: "Svenska", name: "Švédčina", intl: "sv-SE" },
];
export function isLocale(value: unknown): value is LocaleCode {
  return (
    typeof value === "string" &&
    (localeCodes as readonly string[]).includes(value)
  );
}
export function isRTL(locale: LocaleCode): boolean {
  return locale === "ar";
}
export function intlLocale(locale: LocaleCode): string {
  return languages.find((x) => x.code === locale)!.intl;
}
