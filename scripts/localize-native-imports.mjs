/** One-time migration helper. Production data values remain unchanged. */
import ts from "typescript";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
const src = join(process.cwd(), "src");
const replacement = {
  Text: ["localized-text", "LocalizedText"],
  Pressable: ["localized-native", "LocalizedPressable"],
  TextInput: ["localized-native", "LocalizedTextInput"],
  Alert: ["localized-native", "LocalizedAlert"],
};
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      await visit(file);
      continue;
    }
    if (!file.endsWith(".tsx") || /localized-(text|native)\.tsx$/.test(file))
      continue;
    let code = await readFile(file, "utf8");
    const ast = ts.createSourceFile(
        file,
        code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      ),
      edits = [],
      imports = [];
    for (const node of ast.statements) {
      if (
        !ts.isImportDeclaration(node) ||
        node.moduleSpecifier.text !== "react-native" ||
        !node.importClause?.namedBindings ||
        !ts.isNamedImports(node.importClause.namedBindings)
      )
        continue;
      const specs = node.importClause.namedBindings.elements,
        replace = specs.filter(
          (s) => !s.propertyName && replacement[s.name.text],
        );
      if (!replace.length) continue;
      const keep = specs.filter((s) => !replace.includes(s));
      edits.push({
        start: node.getStart(ast),
        end: node.getEnd(),
        text: keep.length
          ? `import { ${keep.map((s) => s.getText(ast)).join(", ")} } from 'react-native';`
          : "",
      });
      for (const spec of replace) {
        const [module, symbol] = replacement[spec.name.text],
          path = relative(
            dirname(file),
            join(src, "components", module),
          ).replaceAll("\\", "/");
        imports.push(
          `import { ${symbol} as ${spec.name.text} } from '${path.startsWith(".") ? path : "./" + path}';`,
        );
      }
    }
    if (edits.length) {
      for (const e of edits.sort((a, b) => b.start - a.start))
        code = code.slice(0, e.start) + e.text + code.slice(e.end);
      code = imports.join("\n") + "\n" + code;
      await writeFile(file, code);
    }
  }
}
await visit(src);
