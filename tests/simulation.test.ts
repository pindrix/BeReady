import { test } from "node:test";
import assert from "node:assert/strict";
import { animationTutorials } from "../src/data/tutorials";
import { explanations } from "../src/data/explanations";
import {
  buildScene,
  tutorialScene3D,
  type Scene3D,
} from "../src/simulation/scenes";
import {
  box,
  defaultCamera,
  project,
  type Face,
} from "../src/simulation/geometry";
function valid(faces: Face[]) {
  assert.ok(
    faces.length > 30 && faces.length <= 1800,
    `bounded face count: ${faces.length}`,
  );
  for (const f of faces) {
    assert.match(f.color, /^#[0-9A-Fa-f]{6}$/);
    assert.ok(
      f.points.every((p) => p.length === 3 && p.every(Number.isFinite)),
    );
  }
  const view = project(faces);
  assert.ok(view.length > 0);
  assert.ok(
    view.every(
      (f) => !/(NaN|Infinity)/.test(f.path) && Number.isFinite(f.depth),
    ),
  );
  assert.ok(
    view.every(
      (f, i) =>
        i === 0 ||
        view[i - 1].layer < f.layer ||
        (view[i - 1].layer === f.layer && view[i - 1].depth >= f.depth),
    ),
    "far faces painted before near faces",
  );
}
test("all 101 tutorial stages have finite local 3D worlds in both appearances and match source indices", () => {
  let count = 0;
  for (const tutorial of animationTutorials) {
    for (let step = 0; step < tutorial.steps.length; step++) {
      const scene = tutorialScene3D(tutorial, step);
      count++;
      assert.equal(scene.step, step);
      for (const theme of ["aurora", "atlas"] as const)
        for (const t of [0, 0.5, 1]) valid(buildScene(scene, t, theme));
    }
  }
  assert.equal(count, 101);
});
test("all 34 explanatory stages use the exact source objects and render without a network asset", () => {
  let count = 0;
  for (const [id, topic] of Object.entries(explanations))
    for (const [step, row] of topic.steps.entries()) {
      const scene: Scene3D = {
        id: "explanation-" + id,
        kind: "explanation",
        step,
        spec: row.scene,
      };
      valid(buildScene(scene, 0));
      valid(buildScene(scene, 1, "atlas"));
      count++;
    }
  assert.equal(count, 34);
});
test("camera orbit and zoom reproject actual XYZ geometry without changing world state", () => {
  const mesh = box([0.5, 0.4, -0.7], [1, 2, 0.6], "#AACCFF"),
    before = structuredClone(mesh);
  const view = project(mesh),
    orbit = project(mesh, { ...defaultCamera, yaw: -0.5 }),
    zoom = project(mesh, { ...defaultCamera, focal: 1100 });
  assert.notDeepEqual(view, orbit);
  assert.notDeepEqual(view, zoom);
  assert.deepEqual(mesh, before);
  assert.deepEqual(
    project(box([0, 0.9, 25], [1, 1, 1], "#AACCFF")),
    [],
    "geometry behind the camera is rejected",
  );
});
test("controlled motion is deterministic, bounded and changes the CPR training pose; AED stage stays hands-off", () => {
  const tutorial = animationTutorials.find((t) => t.id === "adult-cpr")!;
  const cpr = tutorialScene3D(tutorial, 2),
    aed = tutorialScene3D(tutorial, 4);
  assert.notDeepEqual(buildScene(cpr, 0), buildScene(cpr, 0.125));
  assert.deepEqual(buildScene(cpr, -2), buildScene(cpr, 0));
  assert.deepEqual(buildScene(cpr, 4), buildScene(cpr, 1));
  assert.deepEqual(buildScene(cpr, NaN), buildScene(cpr, 0));
  assert.deepEqual(buildScene(aed, 0), buildScene(aed, 0.5));
  assert.deepEqual(buildScene(cpr, 0.25), buildScene(cpr, 0.25));
});
