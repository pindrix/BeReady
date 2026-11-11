import { test } from "node:test";
import assert from "node:assert/strict";
import {
  graphicsEvent,
  graphicsFrame,
} from "../src/simulation/graphics-protocol";
import { buildScene, tutorialScene3D } from "../src/simulation/scenes";
import { animationTutorials } from "../src/data/tutorials";
import { transform, box, type Primitive } from "../src/simulation/geometry";
test("GPU protocol bounds camera and phase and ignores unrelated or excessive messages", () => {
  const f = graphicsFrame(
    { id: "go-bag", kind: "bag", step: 0 },
    Infinity,
    10,
    -1,
    "aurora",
  );
  assert.equal(f.frame, 0);
  assert.equal(f.yaw, 1.8);
  assert.equal(f.zoom, 1);
  for (const raw of [
    "bad",
    "{}",
    '{"type":"ready"}',
    JSON.stringify({ channel: "be-ready-graphics", type: "frame" }),
    "x".repeat(513),
  ])
    assert.equal(graphicsEvent(raw), null);
  assert.equal(
    graphicsEvent(
      JSON.stringify({ channel: "be-ready-graphics", type: "ready" }),
    ),
    "ready",
  );
});
test("all training steps preserve shared high-detail primitives through transforms", () => {
  const mesh = transform(
      box([0, 0, 0], [1, 2, 3], "#AABBCC"),
      [2, 0, 0],
      Math.PI / 2,
      2,
    ),
    parts = new Set(mesh.map((x) => x.primitive));
  assert.equal(parts.size, 1);
  const p = mesh[0].primitive!;
  assert.equal(p.kind, "box");
  assert.deepEqual(p.center, [2, 0, 0]);
  assert.deepEqual(p.size, [2, 4, 6]);
  for (const tutorial of animationTutorials)
    for (let i = 0; i < tutorial.steps.length; i++) {
      const faces = buildScene(tutorialScene3D(tutorial, i), 0.5),
        primitives = new Set<Primitive>();
      for (const face of faces)
        if (face.primitive) primitives.add(face.primitive);
      assert.ok(primitives.size > 8 && primitives.size < 180, tutorial.id);
    }
});
