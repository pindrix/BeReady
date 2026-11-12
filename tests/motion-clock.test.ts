import { test } from "node:test";
import assert from "node:assert/strict";
import {
  graphicsFrame,
  normalizeGraphicsMotion,
} from "../src/simulation/graphics-protocol";
import { MotionClock } from "../src/simulation/motion-clock";
const scene = { id: "go-bag", kind: "bag" as const, step: 0 };
function packet(
  phase: number,
  playing = true,
  revision = 1,
  step = 0,
  durationMs = 1000,
) {
  return graphicsFrame({ ...scene, step }, phase, 0.62, 1, "aurora", {
    playing,
    durationMs,
    revision,
  });
}
function near(actual: number, expected: number) {
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${actual} should be ${expected}`,
  );
}
test("renderer-local clock fills 60fps poses between sparse native samples, and never advances the scene", () => {
  const clock = new MotionClock();
  clock.accept(packet(0), 100);
  const values = Array.from({ length: 31 }, (_, i) =>
    clock.sample(100 + (i * 1000) / 60),
  );
  assert.equal(new Set(values).size, 31);
  near(values.at(-1)!, 0.5);
  assert.equal(clock.needsFrame(600), true);
  near(clock.sample(1100), 1);
  assert.equal(clock.needsFrame(1100), false);
  near(clock.sample(5000), 1);
  clock.accept(packet(0.99), 5010);
  near(clock.sample(5010), 1);
  assert.equal(clock.needsFrame(5010), false);
  clock.accept(packet(0, true, 2, 1), 5020);
  near(clock.sample(5120), 0.1);
});
test("pause and seeks snap exactly; delayed samples during normal playback cannot jitter backwards", () => {
  const clock = new MotionClock();
  clock.accept(packet(0), 0);
  near(clock.sample(300), 0.3);
  clock.accept(packet(0.24), 300);
  near(clock.sample(350), 0.35);
  clock.accept(packet(0.27, false), 350);
  near(clock.sample(900), 0.27);
  assert.equal(clock.needsFrame(900), false);
  clock.accept(packet(0.06, false, 2), 950);
  near(clock.sample(1100), 0.06);
  clock.accept(packet(0.06, true, 3), 1100);
  near(clock.sample(1200), 0.16);
  // Explicit transport revision supports a backward seek without a pause in between.
  clock.accept(packet(0.02, true, 4), 1200);
  near(clock.sample(1300), 0.12);
});
test("a scene or authored duration change reanchors, and no timing is inferred for static or reduced-motion frames", () => {
  const clock = new MotionClock();
  clock.accept(packet(0.2), 0);
  near(clock.sample(300), 0.5);
  clock.accept(packet(0, true, 1, 1), 300);
  near(clock.sample(400), 0.1);
  clock.accept(packet(0.1, true, 1, 1, 2000), 400);
  near(clock.sample(600), 0.2);
  clock.accept(graphicsFrame(scene, 0.6, 0.62, 1, "aurora"), 700);
  near(clock.sample(10000), 0.6);
  assert.equal(clock.needsFrame(10000), false);
  clock.accept(packet(1, false), 10000);
  near(clock.sample(20000), 1);
  assert.equal(clock.needsFrame(20000), false);
});
test("background freezes and foreground never resumes stale play or catches up hidden time", () => {
  const clock = new MotionClock();
  clock.accept(packet(0), 0);
  near(clock.setVisible(false, 200), 0.2);
  near(clock.sample(9000), 0.2);
  assert.equal(clock.needsFrame(9000), false);
  // A message already in flight may update its pose, but cannot run in background.
  clock.accept(packet(0.25), 9010);
  near(clock.sample(10000), 0.25);
  near(clock.setVisible(true, 10000), 0.25);
  assert.equal(clock.needsFrame(11000), false);
  clock.accept(packet(0.25, true, 2), 11000);
  near(clock.sample(11100), 0.35);
  clock.stop(11100);
  assert.equal(clock.needsFrame(12000), false);
  near(clock.sample(12000), 0.35);
});
test("invalid rates cannot autoplay and a backwards or invalid timer cannot poison the clock", () => {
  for (const durationMs of [0, -1, NaN, Infinity]) {
    const motion = normalizeGraphicsMotion({
      playing: true,
      durationMs,
      revision: Infinity,
    });
    assert.equal(motion.playing, false);
    assert.equal(motion.durationMs, 0);
    assert.equal(motion.revision, undefined);
    const clock = new MotionClock();
    clock.accept(packet(0.4, true, 1, 0, durationMs), 0);
    near(clock.sample(100000), 0.4);
    assert.equal(clock.needsFrame(100000), false);
  }
  const tiny = new MotionClock();
  tiny.accept(packet(0.5, true, 1, 0, Number.MIN_VALUE), 0);
  near(tiny.sample(1), 1);
  assert.equal(tiny.needsFrame(1), false);
  const clock = new MotionClock();
  clock.accept(packet(0.1), 100);
  near(clock.sample(200), 0.2);
  near(clock.sample(150), 0.2);
  near(clock.sample(NaN), 0.2);
  near(clock.sample(Infinity), 0.2);
  near(clock.sample(300), 0.3);
});
