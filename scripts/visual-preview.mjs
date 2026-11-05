/**
 * Development-only visual review of the real Home/Academy/Missions components.
 * Native services are replaced by explicit fixtures. Not a production web build.
 * Requires local esbuild + Playwright + Chromium; never installs tools or contacts external services.
 * Usage: node scripts/visual-preview.mjs [--capture]
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";
import { mkdir, readFile, copyFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
const require = createRequire(import.meta.url),
  root = join(dirname(fileURLToPath(import.meta.url)), ".."),
  output = join(root, ".expo", "visual-review");
const { build } = require("esbuild");
const mock = (name) => join(root, "tests/visual/mocks", name);
const aliases = [
  [/^react-native$/, require.resolve("react-native-web")],
  [/state\/store$/, mock("state.tsx")],
  [/state\/license$/, mock("license.ts")],
  [/^expo-router$/, mock("router.ts")],
  [/^react-native-safe-area-context$/, mock("safe-area.tsx")],
  [/^@expo\/vector-icons(?:\/Ionicons)?$/, mock("icons.tsx")],
  [/^expo-image$/, mock("image.tsx")],
  [/^expo-linear-gradient$/, mock("gradient.tsx")],
  [/^react-native-svg$/, mock("svg.tsx")],
];
await mkdir(output, { recursive: true });
await build({
  entryPoints: [join(root, "tests/visual/entry.tsx")],
  outfile: join(output, "app.js"),
  bundle: true,
  platform: "browser",
  jsx: "automatic",
  mainFields: ["browser", "module", "main"],
  resolveExtensions: [
    ".web.tsx",
    ".web.ts",
    ".web.js",
    ".tsx",
    ".ts",
    ".js",
    ".json",
  ],
  define: {
    "process.env.NODE_ENV": '"development"',
    __DEV__: "true",
    global: "globalThis",
  },
  loader: { ".webp": "file", ".png": "file", ".ttf": "file" },
  plugins: [
    {
      name: "native-fixtures",
      setup(plugin) {
        for (const [filter, path] of aliases)
          plugin.onResolve({ filter }, () => ({ path }));
      },
    },
  ],
});
await copyFile(
  join(
    root,
    "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf",
  ),
  join(output, "Ionicons.ttf"),
);
await writeFile(
  join(output, "index.html"),
  `<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>READY — visual fixture</title><style>@font-face{font-family:Ionicons;src:url('/Ionicons.ttf')}html,body{margin:0;padding:0;background:#F6F7F2}#root{display:flex;flex-direction:column;min-height:100vh;}@media(prefers-color-scheme:dark){html,body{background:#101D20}}</style></head><body><div id="root"></div><script src="/app.js"></script></body></html>`,
);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".png": "image/png",
};
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, "http://127.0.0.1").pathname;
    const basename = path === "/" ? "index.html" : path.slice(1);
    if (basename.includes("..") || basename.includes("/")) {
      res.writeHead(404).end();
      return;
    }
    const content = await readFile(join(output, basename));
    res.writeHead(200, {
      "Content-Type": types[extname(basename)] ?? "application/octet-stream",
    });
    res.end(content);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(8090, "127.0.0.1", resolve));
process.stdout.write(
  "Fixture review server on loopback port 8090. No native-runtime validation.\n",
);
if (process.argv.includes("--capture")) {
  const { chromium } = require("playwright");
  const browser = await chromium.launch({
    executablePath:
      process.env.READY_CHROMIUM_PATH ??
      (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    const reports = [];
    for (const colorScheme of ["light", "dark"])
      for (const width of [390, 320])
        for (const screen of ["home", "academy", "missions"]) {
          const page = await browser.newPage({
            viewport: { width, height: 1000 },
            deviceScaleFactor: 1,
            colorScheme,
          });
          const errors = [];
          await page.route("**/*", (route) =>
            new URL(route.request().url()).hostname === "127.0.0.1"
              ? route.continue()
              : route.abort(),
          );
          page.on("pageerror", (e) => errors.push(e.message));
          await page.goto(`http://127.0.0.1:8090/?screen=${screen}`, {
            waitUntil: "networkidle",
          });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(100);
          const dimensions = await page.evaluate(() => {
            const visibleOverflow = Array.from(
              document.querySelectorAll("body *"),
            )
              .filter((element) => {
                const r = element.getBoundingClientRect();
                if (r.width === 0) return false;
                let left = r.left,
                  right = r.right,
                  parent = element.parentElement;
                while (parent) {
                  const css = getComputedStyle(parent);
                  if (
                    ["hidden", "clip", "auto", "scroll"].includes(css.overflowX)
                  ) {
                    const clip = parent.getBoundingClientRect();
                    left = Math.max(left, clip.left);
                    right = Math.min(right, clip.right);
                  }
                  parent = parent.parentElement;
                }
                return right > window.innerWidth + 1 || left < -1;
              })
              .slice(0, 12)
              .map((element) => ({
                tag: element.tagName,
                text: element.textContent?.slice(0, 65),
                left: element.getBoundingClientRect().left,
                right: element.getBoundingClientRect().right,
              }));
            return {
              viewport: window.innerWidth,
              documentWidth: document.documentElement.scrollWidth,
              height: document.documentElement.scrollHeight,
              bodyText: document.body.textContent?.length ?? 0,
              visibleOverflow,
            };
          });
          const filename =
            width === 390 && colorScheme === "light"
              ? `${screen}.png`
              : `${screen}-${width}-${colorScheme}.png`;
          await mkdir(join(root, "docs/screenshots"), { recursive: true });
          await page.screenshot({
            path: join(root, "docs/screenshots", filename),
            fullPage: true,
          });
          reports.push({ screen, colorScheme, width, errors, ...dimensions });
          await page.close();
        }
    await writeFile(
      join(root, "docs/screenshots/review.json"),
      JSON.stringify(
        {
          notice:
            "React Native Web rendering with development fixtures. Not native device screenshots or end-to-end validation.",
          reports,
        },
        null,
        2,
      ),
    );
    if (
      reports.some(
        (report) =>
          report.errors.length > 0 ||
          report.documentWidth > report.viewport ||
          report.visibleOverflow.length > 0 ||
          report.bodyText < 200,
      )
    )
      process.exitCode = 1;
    process.stdout.write(
      JSON.stringify(
        reports.map(({ visibleOverflow, ...x }) => ({
          ...x,
          overflowCount: visibleOverflow.length,
        })),
        null,
        2,
      ) + "\n",
    );
  } finally {
    await browser.close();
    server.close();
  }
} else process.on("SIGINT", () => server.close(() => process.exit(0)));
