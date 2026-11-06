/** Extract translation SOURCE keys only. Never rewrites application or domain data. */
import ts from "typescript";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, relative } from "node:path";
const root = process.cwd(),
  src = join(root, "src"),
  found = new Map(),
  templates = new Set();
const normalize = (s) => s.replace(/\s+/g, " ").trim();
function readable(value) {
  const s = normalize(value);
  if (
    /^[Mm][\d\s,.-]+[MmLlQqCcVvHhZzAaSsTt\d\s,.+eE-]*$/.test(s) ||
    /^(rotate|translate|scale)\(/.test(s)
  )
    return false;
  if (
    /^[Mm][\d\s,.-]+[LlQqCcVvHhZzAaSsTt\d\s,.-]*$/.test(s) ||
    /^[a-z]+[A-Z][A-Za-z]+$/.test(s)
  )
    return false;
  if (!s || s.length < 2 || !/[\p{L}]/u.test(s)) return false;
  if (
    /^\/?[a-z0-9_-]+(?:\/[a-z0-9_-]+)*$/.test(s) ||
    s === "(tabs)" ||
    /\brgba?\(/.test(s)
  )
    return false;
  if (
    /^(https?:|tel:|file:|data:|#[0-9A-Fa-f]|\/?[\w.-]+\/)|^[a-z]+:[\/]/.test(s)
  )
    return false;
  if (
    /^(SELECT|CREATE|PRAGMA|INSERT|UPDATE|DELETE|DROP|BEGIN|ROLLBACK)\b/.test(s)
  )
    return false;
  if (/^(rgba?\(|\d{4}-\d{2}-\d{2})/.test(s)) return false;
  if (/^[a-z][a-z\d_.-]*$/.test(s)) return false;
  if (/^[\w.-]+\.(tsx?|m?js|json|webp|png|ttf)$/.test(s)) return false;
  if (
    /^(React Native|Expo Router|SQLite|READY|YouTube|SDK 58|public\.json|application\/json|text\/plain)$/.test(
      s,
    )
  )
    return false;
  if (
    /^[A-Z_\d]+$/.test(s) &&
    !["USD", "OFFLINE", "ONLINE", "DEMO"].includes(s)
  )
    return false;
  return s.length >= 3 || /[áäčďéíĺľňóôŕšťúýžÁČĎÉÍĽŇÓÔŠŤÚÝŽ]/.test(s);
}
function add(value, file, node, template = false) {
  const key = normalize(value);
  if (!readable(key)) return;
  const refs = found.get(key) ?? new Set();
  refs.add(
    relative(root, file) +
      ":" +
      (node.getSourceFile().getLineAndCharacterOfPosition(node.getStart())
        .line +
        1),
  );
  found.set(key, refs);
  if (template) templates.add(key);
}
async function visitDir(dir) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, ent.name);
    if (ent.isDirectory()) {
      await visitDir(path);
    } else if (/\.tsx?$/.test(ent.name) && ent.name !== "countries.ts") {
      const text = await readFile(path, "utf8");
      const tree = ts.createSourceFile(
        path,
        text,
        ts.ScriptTarget.Latest,
        true,
        ent.name.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      function visit(node) {
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
          return;
        if (ts.isJsxElement(node)) {
          const tag = node.openingElement.tagName.getText(tree);
          if (["Text", "T", "LocalizedText"].includes(tag)) {
            let pattern = "",
              index = 0;
            const flush = () => {
              if (
                index > 0 &&
                pattern.replace(/\{\d+\}/g, "").trim().length >= 4
              )
                add(pattern, path, node, true);
              pattern = "";
              index = 0;
            };
            for (const child of node.children) {
              if (ts.isJsxText(child))
                pattern += child.getFullText(tree).replace(/\s+/g, " ");
              else if (ts.isJsxExpression(child) && child.expression) {
                const expression = child.expression;
                if (
                  ts.isStringLiteral(expression) ||
                  ts.isNoSubstitutionTemplateLiteral(expression)
                )
                  pattern += expression.text;
                else if (
                  ts.isJsxElement(expression) ||
                  ts.isJsxSelfClosingElement(expression) ||
                  ts.isJsxFragment(expression)
                )
                  flush();
                else pattern += `{${index++}}`;
              } else flush();
            }
            flush();
          }
        }
        if (
          ts.isStringLiteral(node) ||
          ts.isNoSubstitutionTemplateLiteral(node)
        )
          add(node.text, path, node);
        else if (ts.isJsxText(node)) add(node.getText(tree), path, node);
        else if (ts.isTemplateExpression(node)) {
          let pattern = node.head.text;
          node.templateSpans.forEach((span, i) => {
            pattern += `{${i}}` + span.literal.text;
          });
          if (pattern.replace(/\{\d+\}/g, "").trim().length > 2)
            add(pattern, path, node, true);
        }
        ts.forEachChild(node, visit);
      }
      visit(tree);
    }
  }
}
await visitDir(src);
// Common enums remain stable data; their user-facing captions are translated on rendering.
const common = [
  "Domov",
  "Zásoby",
  "Plán",
  "Pomoc",
  "Nastavenia",
  "Jedlo",
  "Pitná voda",
  "Hygiena",
  "Lieky / prvá pomoc",
  "Energia a svetlo",
  "Ostatné",
  "evakuácia",
  "blackout",
  "povodeň",
  "ukrytie",
];
for (const value of common) {
  if (!found.has(value)) found.set(value, new Set(["src/i18n/sk.ts"]));
}
const keys = [...found.keys()].sort((a, b) => a.localeCompare(b, "sk"));
await mkdir(join(src, "i18n"), { recursive: true });
await writeFile(
  join(src, "i18n/catalog.json"),
  JSON.stringify(keys, null, 2) + "\n",
);
await writeFile(
  join(src, "i18n/catalog-meta.json"),
  JSON.stringify(
    {
      count: keys.length,
      templates: [...templates].sort(),
      references: Object.fromEntries(keys.map((k) => [k, [...found.get(k)]])),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Extracted ${keys.length} source keys, ${templates.size} safe template candidates.`,
);
