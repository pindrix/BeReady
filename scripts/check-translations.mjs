import { readFile, writeFile } from "node:fs/promises";
const catalog = JSON.parse(await readFile("src/i18n/catalog.json", "utf8"));
const codes = [
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
];
const placeholders = (s) => (s.match(/\{\d+\}/g) ?? []).sort().join("|");
let failed = false;
const reports = [];
for (const code of codes) {
  try {
    const dictionary = JSON.parse(
      await readFile(`src/i18n/locales/${code}.json`, "utf8"),
    );
    const missing = catalog.filter(
      (key) => typeof dictionary[key] !== "string" || !dictionary[key].trim(),
    );
    const extra = Object.keys(dictionary).filter(
      (key) => !catalog.includes(key),
    );
    const invalid = catalog.filter(
      (key) =>
        dictionary[key] && placeholders(key) !== placeholders(dictionary[key]),
    );
    const suspicious = catalog.filter(
      (key) =>
        key.length > 100 && dictionary[key] && dictionary[key].length < 12,
    );
    const report = {
      code,
      translated: catalog.length - missing.length,
      total: catalog.length,
      missing: missing.length,
      extra: extra.length,
      invalidPlaceholders: invalid.length,
      suspicious: suspicious.length,
    };
    reports.push(report);
    console.log(JSON.stringify(report));
    if (missing.length || extra.length || invalid.length || suspicious.length) {
      failed = true;
      console.log(
        JSON.stringify({
          code,
          missing: missing.slice(0, 3),
          extra: extra.slice(0, 3),
          invalid: invalid.slice(0, 3),
          suspicious: suspicious.slice(0, 3),
        }),
      );
    }
  } catch (error) {
    failed = true;
    console.log(code, error.message);
  }
}
if (process.argv.includes("--report"))
  await writeFile(
    "docs/translation-coverage.json",
    JSON.stringify(
      {
        notice:
          "Structural coverage only, not professional linguistic or medical review.",
        reports,
      },
      null,
      2,
    ) + "\n",
  );
process.exitCode = failed ? 1 : 0;
