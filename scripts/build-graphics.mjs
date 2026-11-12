/** Produces one self-contained, offline WebGL runtime; no CDN or runtime module loader. */
import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
const result = await build({
  entryPoints: ["src/simulation/gpu-runtime.ts"],
  bundle: true,
  platform: "browser",
  format: "iife",
  target: "es2020",
  minify: true,
  write: false,
  legalComments: "inline",
});
await writeFile(
  "src/simulation/graphics-runtime.json",
  JSON.stringify({
    model: (await readFile("assets/models/responder.glb")).toString("base64"),
    license: (
      await Promise.all(
        [
          "node_modules/three/LICENSE",
          "node_modules/react-native-webview/LICENSE",
        ].map((path) => readFile(path, "utf8")),
      )
    ).join("\n\n"),
    script: result.outputFiles[0].text,
  }) + "\n",
);
console.log(
  "Offline graphics runtime:",
  result.outputFiles[0].contents.length,
  "bytes",
);
