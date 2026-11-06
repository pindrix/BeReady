import { before } from "node:test";
import { setCountryCode } from "../src/state/region";
before(async () => {
  await setCountryCode("SK");
});
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  translateText,
  getLocale,
  setLocale,
  languages,
  localeCodes,
  isRTL,
  formatNumber,
} from "../src/i18n";
import { numeric } from "../src/types/model";
test("21 podporovaných jazykov má vlastný názov a jednoznačný kód; arabčina používa RTL", () => {
  assert.equal(localeCodes.length, 21);
  assert.equal(languages.length, 21);
  assert.equal(new Set(languages.map((x) => x.code)).size, 21);
  assert.equal(isRTL("ar"), true);
  assert.equal(isRTL("sk"), false);
});
test("neznámy text sa zachová, samotné preklady nemenia osobné údaje v databáze", async () => {
  const original = getLocale();
  try {
    await setLocale("sk");
    assert.equal(
      translateText("Rodinný súkromný názov"),
      "Rodinný súkromný názov",
    );
    assert.equal(translateText("hello-unknown"), "hello-unknown");
    await setLocale("en");
    assert.equal(formatNumber(1234.5), "1,234.5");
  } finally {
    await setLocale(original);
  }
});
test("číselný vstup podporuje arabské, perzské, hindské a bengálske číslice", () => {
  assert.equal(numeric("٣٫٨"), 3.8);
  assert.equal(numeric("۳٫۸"), 3.8);
  assert.equal(numeric("३,८"), 3.8);
  assert.equal(numeric("৩.৮"), 3.8);
  assert.ok(Number.isNaN(numeric("")));
});
