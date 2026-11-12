/** Build a standalone, debug-signed preview APK without changing the production application id. */
import { spawn } from "node:child_process";
import {
  access,
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = process.argv[2] && resolve(process.argv[2]);
if (!destination || !destination.endsWith(".apk")) {
  throw new Error(
    "Usage: node scripts/build-android-preview.mjs /absolute/path/BE-READY-preview.apk",
  );
}
if (process.platform === "win32") {
  throw new Error(
    "Run this local build in WSL/Linux or macOS with the Android SDK installed.",
  );
}
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (!sdk) throw new Error("Set ANDROID_HOME to the installed Android SDK.");
await access(join(project, "node_modules", "expo", "bin", "cli"));
const working = await mkdtemp(join(tmpdir(), "beready-preview-"));
const excluded = new Set([
  ".git",
  "node_modules",
  ".expo",
  "dist",
  "android",
  "ios",
  "artifacts",
  ".gradle",
]);
await cp(project, working, {
  recursive: true,
  filter: (source) => {
    const relative = source.slice(project.length).replace(/^[/\\]/, "");
    const first = relative.split(/[/\\]/)[0];
    return !excluded.has(first) && !first.startsWith(".env");
  },
});
await symlink(
  join(project, "node_modules"),
  join(working, "node_modules"),
  "dir",
);
const configPath = join(working, "app.json");
const config = JSON.parse(await readFile(configPath, "utf8"));
config.expo.android = { ...config.expo.android, package: "sk.beready.preview" };
const [major, minor, patch] = config.expo.version.split(".").map(Number);
config.expo.android.versionCode = major * 10000 + minor * 100 + patch;
await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
const environment = {
  ...process.env,
  ANDROID_HOME: sdk,
  ANDROID_SDK_ROOT: sdk,
  EXPO_OFFLINE: "1",
  CI: "1",
};
const run = (command, args, cwd) =>
  new Promise((accept, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: environment,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? accept()
        : reject(
            new Error(
              `Build command failed (${code}); temporary project: ${working}`,
            ),
          ),
    );
  });
await run(
  process.execPath,
  [
    join(project, "node_modules", "expo", "bin", "cli"),
    "prebuild",
    "--platform",
    "android",
    "--no-install",
  ],
  working,
);
await writeFile(
  join(working, "android", "local.properties"),
  `sdk.dir=${sdk.replaceAll("\\", "/")}\n`,
);
await run(
  join(working, "android", "gradlew"),
  [
    ":app:assembleRelease",
    "-PreactNativeArchitectures=arm64-v8a",
    "-Pandroid.enableMinifyInReleaseBuilds=false",
    "--no-daemon",
    "--max-workers=2",
  ],
  join(working, "android"),
);
const apk = join(
  working,
  "android",
  "app",
  "build",
  "outputs",
  "apk",
  "release",
  "app-release.apk",
);
await access(apk);
await mkdir(dirname(destination), { recursive: true });
await copyFile(apk, destination);
const checksum = createHash("sha256");
for await (const block of createReadStream(destination)) checksum.update(block);
console.log(
  JSON.stringify(
    {
      apk: destination,
      applicationId: "sk.beready.preview",
      architecture: "arm64-v8a",
      signing: "preview/debug key; not a Play release",
      sha256: checksum.digest("hex"),
    },
    null,
    2,
  ),
);
