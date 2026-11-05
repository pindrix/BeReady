/** Run while visual:preview serves 127.0.0.1:8090. Fixture screenshots, not a native or billing test. */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
const codes = [
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
];
const browser = await chromium.launch({
  executablePath:
    process.env.READY_CHROMIUM_PATH ??
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  headless: true,
  args: ["--no-sandbox"],
});
const reports = [];
await mkdir("docs/screenshots/v1.2", { recursive: true });
try {
  for (const [name, locale] of [
    ...codes.map((code) => ["home", code]),
    ["kit", "sk"],
    ["scenarios", "sk"],
    ["plus", "sk"],
    ["kit", "ar"],
    ["plus", "de"],
  ]) {
    const page = await browser.newPage({
        viewport: { width: 390, height: 1000 },
        colorScheme: "light",
      }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/*", (route) =>
      new URL(route.request().url()).hostname === "127.0.0.1"
        ? route.continue()
        : route.abort(),
    );
    await page.goto(`http://127.0.0.1:8090/?screen=${name}&locale=${locale}`, {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    const measurements = await page.evaluate(() => {
      const visibleOverflow = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        let left = r.left,
          right = r.right,
          parent = el.parentElement;
        while (parent) {
          const css = getComputedStyle(parent);
          if (["hidden", "clip", "auto", "scroll"].includes(css.overflowX)) {
            const clip = parent.getBoundingClientRect();
            left = Math.max(left, clip.left);
            right = Math.min(right, clip.right);
          }
          parent = parent.parentElement;
        }
        if (right > innerWidth + 1 || left < -1)
          visibleOverflow.push({
            text: el.textContent?.slice(0, 80),
            left,
            right,
          });
      }
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyText: document.body.textContent?.length ?? 0,
        visibleOverflow: visibleOverflow.slice(0, 8),
      };
    });
    reports.push({ screen: name, locale, errors, ...measurements });
    if (["ar", "zh", "hi", "en", "de", "sk"].includes(locale))
      await page.screenshot({
        path: `docs/screenshots/v1.2/${name}-${locale}.png`,
        fullPage: true,
      });
    await page.close();
  }
  await writeFile(
    "docs/screenshots/v1.2/locales-review.json",
    JSON.stringify(
      {
        notice:
          "Real components with development fixtures. Not native-device, payment or professional linguistic validation.",
        reports,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify(
      reports.map(({ visibleOverflow, ...report }) => ({
        ...report,
        overflowCount: visibleOverflow.length,
      })),
      null,
      2,
    ),
  );
  if (
    reports.some(
      (r) =>
        r.errors.length ||
        r.visibleOverflow.length ||
        r.documentWidth > r.viewport ||
        r.bodyText < 200,
    )
  )
    process.exitCode = 1;
} finally {
  await browser.close();
}
