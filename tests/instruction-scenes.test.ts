import { test } from "node:test";
import assert from "node:assert/strict";
import { academyGuides } from "../src/data/academy";
import {
  animationTutorials,
  getTutorial,
  getTutorialForGuide,
} from "../src/data/tutorials";
import { instructionalScenes } from "../src/data/instruction-scenes";
import { explanations } from "../src/data/explanations";
test("every academy guide has a complete animation with the same step text and order", () => {
  assert.equal(academyGuides.length, 20);
  assert.equal(animationTutorials.length, 24);
  assert.equal(
    animationTutorials.reduce((n, t) => n + t.steps.length, 0),
    101,
  );
  for (const guide of academyGuides) {
    const tutorial = getTutorial(guide.id);
    assert.ok(tutorial, guide.id);
    assert.equal(getTutorialForGuide(guide.id), tutorial);
    assert.deepEqual(
      tutorial.steps.map(({ title, body }) => ({ title, body })),
      guide.steps,
    );
  }
});
test("instruction diagrams cover every remaining guide without a shared fallback stage", () => {
  assert.equal(Object.keys(instructionalScenes).length, 14);
  for (const [id, steps] of Object.entries(instructionalScenes)) {
    const guide = academyGuides.find((g) => g.id === id)!;
    assert.ok(guide, id);
    assert.equal(steps.length, guide.steps.length, id);
    assert.equal(
      new Set(steps.map((s) => JSON.stringify(s))).size,
      steps.length,
      id,
    );
  }
});
test("product explanations retain their limits about backups, payments and shelter data", () => {
  assert.match(explanations.backup.steps[2].body, /nie je šifrovaná/);
  assert.equal(
    explanations.license.steps[1].title,
    "Platby ešte nie sú pripojené",
  );
  assert.match(
    explanations.shelters.steps[0].body,
    /neobsahuje vstavaný adresár ani mapu/,
  );
  assert.match(explanations.shopping.steps[2].body, /nezapočítava do zásob/);
  for (const config of Object.values(explanations))
    assert.ok(
      config.steps.length >= 2 &&
        config.steps.every((s) => s.title && s.body && s.scene),
    );
});
