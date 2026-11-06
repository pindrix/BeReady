import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emergencyCountries,
  numbersForCountry,
  localizeEmergencyNumbers,
} from "../src/data/countries";

test("country registry uses explicit selection and preserves leading zeroes", () => {
  assert.equal(
    new Set(emergencyCountries.map((c) => c.code)).size,
    emergencyCountries.length,
  );
  assert.deepEqual(numbersForCountry(null), []);
  assert.deepEqual(numbersForCountry("XX"), []);
  assert.deepEqual(numbersForCountry("ZZ"), []);
  assert.equal(numbersForCountry("AU")[0].number, "000");
  for (const c of emergencyCountries.filter((c) => c.code !== "ZZ")) {
    assert.ok(numbersForCountry(c.code).length >= 3);
    assert.match(c.source, /^https:\/\//);
    for (const item of numbersForCountry(c.code))
      assert.match(item.number, /^\d{3}$/);
  }
});
test("emergency roles follow country independently of language", () => {
  assert.equal(
    localizeEmergencyNumbers("Volajte 112/155.", "US"),
    "Volajte 911.",
  );
  assert.equal(
    localizeEmergencyNumbers("112 150 155 158", "SK"),
    "112 150 155 158",
  );
  assert.equal(
    localizeEmergencyNumbers("112 150 155 158", "NO"),
    "112 110 113 112",
  );
  assert.equal(
    localizeEmergencyNumbers("112 150 155 158", "CH"),
    "112 118 144 117",
  );
  assert.equal(localizeEmergencyNumbers("Call 112 or 155", "AU"), "Call 000");
  assert.equal(localizeEmergencyNumbers("112", null), "—");
});
