import { sk } from "./sk";
// Keep stable domain enums separate from translated labels. Future locales implement this dictionary shape.
export const messages = sk;
export function formatNumber(value: number, maximumFractionDigits = 1): string {
  return value.toLocaleString(messages.locale, { maximumFractionDigits });
}
