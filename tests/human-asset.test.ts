import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const file = readFileSync(
    new URL("../assets/models/responder.glb", import.meta.url),
  ),
  length = file.readUInt32LE(12),
  gltf = JSON.parse(file.subarray(20, 20 + length).toString()),
  binary = file.subarray(28 + length);
test("detailed civilian character is a complete local rigged GLB with covered clothing and no remote assets", () => {
  assert.equal(file.toString("ascii", 0, 4), "glTF");
  assert.equal(file.readUInt32LE(8), file.length);
  assert.equal(gltf.skins[0].joints.length, 163);
  assert.ok(gltf.meshes.some((m: { name: string }) => m.name === "Clothing"));
  assert.ok(
    gltf.images.length >= 4 &&
      gltf.images.every(
        (image: { bufferView: number; uri?: string }) =>
          Number.isInteger(image.bufferView) && !image.uri,
      ),
  );
  assert.ok(gltf.buffers.every((buffer: { uri?: string }) => !buffer.uri));
  const license = JSON.parse(
    readFileSync(
      new URL("../assets/models/responder-license.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(license.license, "CC0-1.0");
});
test("all embedded skin weights are normalized and every joint index references the authored skeleton", () => {
  const read = (id: number) => {
    const accessor = gltf.accessors[id],
      view = gltf.bufferViews[accessor.bufferView],
      offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0),
      size =
        accessor.componentType === 5126
          ? 4
          : accessor.componentType === 5123
            ? 2
            : 1;
    return {
      accessor,
      get: (i: number) =>
        size === 4
          ? binary.readFloatLE(offset + i * size)
          : size === 2
            ? binary.readUInt16LE(offset + i * size)
            : binary.readUInt8(offset + i * size),
    };
  };
  for (const mesh of gltf.meshes)
    for (const primitive of mesh.primitives) {
      const joints = read(primitive.attributes.JOINTS_0),
        weights = read(primitive.attributes.WEIGHTS_0);
      for (let v = 0; v < weights.accessor.count; v++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          const w = weights.get(v * 4 + k);
          assert.ok(Number.isFinite(w) && w >= 0);
          sum += w;
          assert.ok(joints.get(v * 4 + k) < 163);
        }
        assert.ok(Math.abs(sum - 1) < 0.002);
      }
    }
});

test("GPU actor descriptors avoid fallback mesh allocations and always restore the normal renderer", async () => {
  const { actorDescriptorsOnly, person } =
    await import("../src/simulation/world");
  const normal = person([0, 0, 0]);
  const compact = actorDescriptorsOnly(() => person([0, 0, 0]));
  assert.equal(compact.length, 1);
  assert.ok(compact[0].actor);
  assert.equal(compact[0].points.length, 0);
  assert.ok(normal.length > 100);
  assert.throws(() =>
    actorDescriptorsOnly(() => {
      throw new Error("expected");
    }),
  );
  assert.equal(person([0, 0, 0]).length, normal.length);
});
