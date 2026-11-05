import { z } from "zod";
import { sk } from "./sk";
import sourceKeys from "./catalog.json";
import { dictionaries } from "./dictionaries";
import { isLocale, intlLocale, type LocaleCode } from "./locales";
import type { Sql } from "../db/repository";
export {
  languages,
  localeCodes,
  isLocale,
  isRTL,
  intlLocale,
  type LocaleCode,
} from "./locales";
// Stable SK enums remain domain data. LocalizedText translates captions at rendering time.
export const messages = sk;
let current: LocaleCode = "sk",
  database: Sql | undefined;
const listeners = new Set<() => void>();
z.config(z.locales.sk());
export function getLocale(): LocaleCode {
  return current;
}
export function subscribeLocale(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function commitLocale(locale: LocaleCode) {
  z.config(z.locales[locale === "zh" ? "zhCN" : locale]());
  if (current === locale) return;
  current = locale;
  for (const listener of listeners) listener();
}
export async function initializeLocale(db: Sql): Promise<LocaleCode> {
  database = db;
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS ready_preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);",
  );
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM ready_preferences WHERE key = ?",
    "locale",
  );
  const locale = isLocale(row?.value) ? row.value : "sk";
  commitLocale(locale);
  return locale;
}
export async function setLocale(
  locale: LocaleCode,
  db: Sql | undefined = database,
): Promise<void> {
  if (!isLocale(locale)) throw new Error("Nepodporovaný jazyk.");
  if (db) {
    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS ready_preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);",
    );
    await db.runAsync(
      "INSERT INTO ready_preferences (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      "locale",
      locale,
    );
  }
  commitLocale(locale);
}
const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const templatePatterns = sourceKeys
  .filter(
    (key) => /\{\d+\}/.test(key) && key.replace(/\{\d+\}/g, "").length >= 4,
  )
  .map((key) => {
    const ids: number[] = [];
    let source = "",
      last = 0;
    for (const match of key.matchAll(/\{(\d+)\}/g)) {
      source += escapeRegex(key.slice(last, match.index)) + "(.*?)";
      ids.push(Number(match[1]));
      last = match.index! + match[0].length;
    }
    source += escapeRegex(key.slice(last));
    return {
      key,
      ids,
      regex: new RegExp("^" + source + "$", "u"),
      specificity: key.replace(/\{\d+\}/g, "").length,
    };
  })
  .sort((a, b) => b.specificity - a.specificity);
export function translateText(
  text: string,
  locale: LocaleCode = current,
): string {
  if (locale === "sk" || !text) return text;
  const normalized = normalize(text),
    dict = dictionaries[locale];
  let translated = dict[normalized];
  if (!translated) {
    for (const template of templatePatterns) {
      const value = dict[template.key];
      if (!value) continue;
      const match = template.regex.exec(normalized);
      if (match) {
        const substitutions = new Map(
          template.ids.map((id, index) => [id, match[index + 1]]),
        );
        translated = value.replace(
          /\{(\d+)\}/g,
          (_token, id) => substitutions.get(Number(id)) ?? _token,
        );
        break;
      }
    }
  }
  if (!translated) {
    if (/[\r\n]/.test(text))
      return text
        .split(/(\r?\n+)/)
        .map((part) =>
          /[\r\n]/.test(part) ? part : translateText(part, locale),
        )
        .join("");
    return text;
  }
  const prefix = text.match(/^\s*/)?.[0] ?? "",
    suffix = text.match(/\s*$/)?.[0] ?? "";
  return prefix + translated + suffix;
}
export const t = translateText;
export function formatNumber(value: number, maximumFractionDigits = 1): string {
  return value.toLocaleString(intlLocale(current), { maximumFractionDigits });
}
export function translationCoverage(locale: LocaleCode) {
  const total = sourceKeys.length;
  return {
    translated:
      locale === "sk"
        ? total
        : sourceKeys.filter(
            (key) =>
              typeof dictionaries[locale][key] === "string" &&
              dictionaries[locale][key].length > 0,
          ).length,
    total,
  };
}
