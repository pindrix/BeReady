import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Line3, Vector3 } from "three";
import { buildScene } from "../src/simulation/scenes";
import { actorDescriptorsOnly } from "../src/simulation/world";
import { loadHumanAsset } from "../src/simulation/human-renderer";

async function withHumanPool(
  check: (pool: Awaited<ReturnType<typeof loadHumanAsset>>) => void,
) {
  // Decode the real GLB geometry/skeleton; image pixels are irrelevant to contact coordinates.
  const previousSelf = globalThis.self;
  const previousBitmap = globalThis.createImageBitmap;
  Object.assign(globalThis, {
    self: globalThis,
    createImageBitmap: async () => ({ width: 1024, height: 1024, close() {} }),
  });
  let pool: Awaited<ReturnType<typeof loadHumanAsset>> | undefined;
  try {
    pool = await loadHumanAsset(
      readFileSync(
        new URL("../assets/models/responder.glb", import.meta.url),
      ).toString("base64"),
    );
    check(pool);
  } finally {
    pool?.dispose();
    Object.assign(globalThis, {
      self: previousSelf,
      createImageBitmap: previousBitmap,
    });
  }
}

test("bleeding rig places both palms on the dressing instead of stopping above its reach", async () => {
  await withHumanPool((pool) => {
    for (const step of [1, 2]) {
      const faces = actorDescriptorsOnly(() =>
        buildScene({ id: "bleeding", kind: "bleeding", step }, 0.5),
      );
      const helper = faces.find(
        (face) => face.actor?.pose === "pressure",
      )?.actor;
      assert.ok(helper?.hands);
      pool.update([helper]);
      pool.group.updateMatrixWorld(true);
      for (const side of ["L", "R"] as const) {
        const bone = pool.group.getObjectByName("wrist." + side);
        assert.ok(bone);
        const actual = bone.getWorldPosition(new Vector3());
        const target = new Vector3(
          ...helper.hands[side === "L" ? "left" : "right"],
        );
        assert.ok(
          actual.distanceTo(target) < 0.004,
          `${side} hand cannot reach dressing`,
        );
        assert.ok(Math.abs(actual.x + 0.1) < 0.004);
        assert.ok(Math.abs(actual.z - 0.08) < 0.004);
        // Lower wrist is just above the dressing top; its fleshy palm rests against it.
        if (side === "L") assert.ok(actual.y >= 0.25 && actual.y <= 0.26);
      }
    }
  });
});

test("burns cooling places the real right wrist and supporting fingers in the authored water stream", async () => {
  await withHumanPool((pool) => {
    const faces = actorDescriptorsOnly(() =>
      buildScene({ id: "burns", kind: "burns", step: 1 }, 0.5),
    );
    const actor = faces.find((face) => face.actor)?.actor;
    const stream = faces.find((face) => {
      const p = face.primitive;
      return (
        p?.kind === "rod" && p.a[1] > 1.2 && p.b[1] < 1 && p.a[1] - p.b[1] > 0.2
      );
    })?.primitive;
    assert.ok(actor);
    assert.ok(stream?.kind === "rod");
    pool.update([actor]);
    pool.group.updateMatrixWorld(true);
    const line = new Line3(new Vector3(...stream.a), new Vector3(...stream.b));
    for (const name of ["wrist.R", "finger3-1.L"]) {
      const bone = pool.group.getObjectByName(name);
      assert.ok(bone);
      const actual = bone.getWorldPosition(new Vector3());
      const closest = line.closestPointToPoint(actual, true, new Vector3());
      assert.ok(
        actual.distanceTo(closest) < 0.02,
        `${name} misses cooling water`,
      );
      assert.ok(actual.y > stream.b[1] + 0.03 && actual.y < stream.a[1] - 0.03);
    }
  });
});
