import { test } from "node:test";
import assert from "node:assert/strict";
import { academyGuides } from "../src/data/academy";
import {
  animationTutorials,
  getTutorial,
  getTutorialForGuide,
  getTutorialsForGuide,
  type Tutorial,
} from "../src/data/tutorials";
import {
  adjacentTutorialStep,
  seekTutorial,
  tutorialDurationMs,
  tutorialPlaybackAt,
  tutorialStepStartMs,
} from "../src/domain/tutorials";

test("animované návody zachovávajú všetky kroky a prekladové texty pôvodných návodov", () => {
  assert.deepEqual(
    animationTutorials
      .slice(0, 4)
      .map((tutorial) => [tutorial.id, tutorial.kind, tutorial.steps.length]),
    [
      ["go-bag", "bag", 5],
      ["water-storage", "water", 5],
      ["blackout", "power", 4],
      ["communication", "communication", 4],
    ],
  );
  assert.equal(new Set(animationTutorials.map((item) => item.id)).size, 10);
  for (const tutorial of animationTutorials.slice(0, 4)) {
    const guide = academyGuides.find((item) => item.id === tutorial.guideId);
    assert.ok(guide);
    assert.equal(tutorial.title, guide.title);
    assert.equal(tutorial.summary, guide.summary);
    assert.deepEqual(
      tutorial.steps.map(({ title, body }) => ({ title, body })),
      guide.steps,
    );
    assert.ok(tutorial.steps.every((step) => step.durationMs === 8_000));
    assert.equal(getTutorial(tutorial.id), tutorial);
    assert.equal(getTutorialForGuide(guide.id), tutorial);
  }
  assert.equal(getTutorial("unknown"), undefined);
  assert.equal(getTutorialForGuide("unknown"), undefined);
  assert.deepEqual(getTutorialsForGuide("unknown"), []);
});

test("praktické ukážky majú vlastné zdroje a zdieľaný návod vracia všetky súvisiace ukážky", () => {
  assert.equal(animationTutorials.length, 10);
  assert.deepEqual(
    animationTutorials
      .slice(4, 8)
      .map((tutorial) => [tutorial.id, tutorial.kind, tutorial.steps.length]),
    [
      ["adult-cpr", "adult-cpr", 5],
      ["bleeding", "bleeding", 4],
      ["burns", "burns", 4],
      ["campfire", "campfire", 5],
    ],
  );
  for (const tutorial of animationTutorials) {
    assert.ok(academyGuides.some((guide) => guide.id === tutorial.guideId));
    assert.ok(tutorial.title && tutorial.summary);
    assert.ok(
      tutorial.steps.every(
        (step) => step.title && step.body && step.durationMs > 0,
      ),
    );
    assert.equal(getTutorial(tutorial.id), tutorial);
    assert.ok(getTutorialsForGuide(tutorial.guideId).includes(tutorial));
  }
  for (const tutorial of animationTutorials.slice(4, 8)) {
    assert.ok(tutorial.sourceName && tutorial.warning);
    assert.equal(new URL(tutorial.sourceUrl!).protocol, "https:");
    assert.equal(tutorial.sourceVerifiedOnline, false);
  }
  assert.deepEqual(
    getTutorialsForGuide("first-aid").map((tutorial) => tutorial.id),
    ["adult-cpr", "bleeding", "burns"],
  );
});

test("presné hranice prepnú scénu a koniec zostáva na poslednom kroku", () => {
  for (const tutorial of animationTutorials) {
    const duration = tutorialDurationMs(tutorial);
    assert.equal(
      duration,
      tutorial.steps.reduce((total, step) => total + step.durationMs, 0),
    );
    const start = tutorialPlaybackAt(tutorial, -10);
    assert.equal(start.playheadMs, 0);
    assert.equal(start.stepIndex, 0);
    assert.equal(start.progress, 0);
    assert.equal(start.stepProgress, 0);
    assert.equal(start.isComplete, false);
    for (let index = 1; index < tutorial.steps.length; index += 1) {
      const boundary = tutorialStepStartMs(tutorial, index);
      const before = tutorialPlaybackAt(tutorial, boundary - 1);
      const at = tutorialPlaybackAt(tutorial, boundary);
      assert.equal(before.stepIndex, index - 1);
      assert.equal(at.stepIndex, index);
      assert.equal(at.stepElapsedMs, 0);
      assert.equal(at.stepProgress, 0);
      assert.equal(at.isComplete, false);
    }
    const end = tutorialPlaybackAt(tutorial, duration + 10);
    assert.equal(end.playheadMs, duration);
    assert.equal(end.stepIndex, tutorial.steps.length - 1);
    assert.equal(
      end.stepElapsedMs,
      tutorial.steps[tutorial.steps.length - 1].durationMs,
    );
    assert.equal(end.stepProgress, 1);
    assert.equal(end.progress, 1);
    assert.equal(end.isComplete, true);
  }
});

test("posun a susedné kroky sa ohraničia bez preskočenia na nesprávnu scénu", () => {
  const tutorial = getTutorial("water-storage")!;
  assert.equal(seekTutorial(tutorial, -3).stepIndex, 0);
  assert.equal(seekTutorial(tutorial, 3).stepIndex, 4);
  assert.equal(seekTutorial(tutorial, 0.5).stepIndex, 2);
  assert.equal(seekTutorial(tutorial, 0.5).stepProgress, 0.5);
  assert.equal(seekTutorial(tutorial, 0.5).progress, 0.5);
  assert.equal(tutorialStepStartMs(tutorial, -10), 0);
  assert.equal(tutorialStepStartMs(tutorial, 100), 32_000);
  assert.equal(adjacentTutorialStep(tutorial, 0, -1), 0);
  assert.equal(adjacentTutorialStep(tutorial, 4, 1), 4);
  assert.equal(adjacentTutorialStep(tutorial, 2, -1), 1);
  assert.equal(adjacentTutorialStep(tutorial, 2, 1), 3);
  for (let position = -500; position <= 40_500; position += 250) {
    const playback = tutorialPlaybackAt(tutorial, position);
    const clamped = Math.max(0, Math.min(40_000, position));
    assert.equal(playback.stepIndex, Math.min(4, Math.floor(clamped / 8_000)));
    assert.ok(playback.progress >= 0 && playback.progress <= 1);
    assert.ok(playback.stepProgress >= 0 && playback.stepProgress <= 1);
  }
});

test("prehrávač používa skutočné trvania jednotlivých krokov", () => {
  const tutorial: Tutorial = {
    ...animationTutorials[0],
    steps: [
      { ...animationTutorials[0].steps[0], durationMs: 1_000 },
      { ...animationTutorials[0].steps[1], durationMs: 3_000 },
    ],
  };
  assert.equal(tutorialDurationMs(tutorial), 4_000);
  assert.equal(tutorialStepStartMs(tutorial, 1), 1_000);
  assert.equal(tutorialPlaybackAt(tutorial, 1_000).stepIndex, 1);
  assert.equal(tutorialPlaybackAt(tutorial, 2_500).stepProgress, 0.5);
  assert.equal(seekTutorial(tutorial, 0.25).stepIndex, 1);
  assert.equal(seekTutorial(tutorial, 0.25).stepProgress, 0);
});

test("neplatné čísla a prázdny alebo poškodený časový model sa odmietnu", () => {
  const tutorial = animationTutorials[0];
  for (const invalid of [NaN, Infinity, -Infinity]) {
    assert.throws(() => tutorialPlaybackAt(tutorial, invalid), RangeError);
    assert.throws(() => seekTutorial(tutorial, invalid), RangeError);
    assert.throws(() => tutorialStepStartMs(tutorial, invalid), RangeError);
    assert.throws(() => adjacentTutorialStep(tutorial, invalid, 1), RangeError);
  }
  assert.throws(() => tutorialStepStartMs(tutorial, 0.5), RangeError);
  assert.throws(() => adjacentTutorialStep(tutorial, 0.5, 1), RangeError);
  assert.throws(() => adjacentTutorialStep(tutorial, 1, 0 as 1), RangeError);
  for (const durationMs of [0, -1, NaN, Infinity, -Infinity]) {
    const invalid = {
      ...tutorial,
      steps: [{ ...tutorial.steps[0], durationMs }],
    };
    assert.throws(() => tutorialDurationMs(invalid), RangeError);
    assert.throws(() => tutorialPlaybackAt(invalid, 0), RangeError);
  }
  const empty = { ...tutorial, steps: [] };
  assert.throws(() => tutorialDurationMs(empty), RangeError);
  assert.throws(() => tutorialStepStartMs(empty, 0), RangeError);
  assert.throws(() => adjacentTutorialStep(empty, 0, 1), RangeError);
  const overflow = {
    ...tutorial,
    steps: tutorial.steps.map((step) => ({
      ...step,
      durationMs: Number.MAX_VALUE,
    })),
  };
  assert.throws(() => tutorialDurationMs(overflow), RangeError);
  const unrepresentable = {
    ...tutorial,
    steps: [
      { ...tutorial.steps[0], durationMs: Number.MAX_VALUE },
      { ...tutorial.steps[1], durationMs: 1 },
    ],
  };
  assert.throws(() => tutorialDurationMs(unrepresentable), RangeError);
});

test("civil protection animations preserve all source steps and do not turn 24h sheltering into a timer", () => {
  for (const [id, count] of [
    ["armed-conflict", 5],
    ["nuclear-explosion", 6],
  ] as const) {
    const tutorial = getTutorial(id)!,
      guide = academyGuides.find((g) => g.id === id)!;
    assert.equal(tutorial.steps.length, count);
    assert.deepEqual(
      tutorial.steps.map(({ title, body }) => ({ title, body })),
      guide.steps,
    );
    assert.equal(tutorial.warning, guide.takeaway);
    assert.equal(tutorial.sourceVerifiedOnline, false);
    assert.equal(tutorialDurationMs(tutorial), count * 10000);
    assert.ok(getTutorialsForGuide(id).includes(tutorial));
  }
});
