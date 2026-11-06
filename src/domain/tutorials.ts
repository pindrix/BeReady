import type { Tutorial } from "../data/tutorials";

export type TutorialPlayback = {
  playheadMs: number;
  totalDurationMs: number;
  stepIndex: number;
  stepElapsedMs: number;
  stepDurationMs: number;
  stepProgress: number;
  progress: number;
  isComplete: boolean;
};

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new RangeError(`Invalid ${label}`);
  return value;
}

function timeline(tutorial: Tutorial): number[] {
  if (tutorial.steps.length === 0)
    throw new RangeError("A tutorial needs at least one step");
  const boundaries = [0];
  for (const step of tutorial.steps) {
    const duration = finite(step.durationMs, "tutorial duration");
    if (duration <= 0) throw new RangeError("Invalid tutorial duration");
    const previous = boundaries[boundaries.length - 1];
    const next = finite(previous + duration, "tutorial duration");
    if (next <= previous) throw new RangeError("Invalid tutorial duration");
    boundaries.push(next);
  }
  return boundaries;
}

function clampStep(tutorial: Tutorial, stepIndex: number): number {
  if (!Number.isInteger(stepIndex))
    throw new RangeError("Invalid tutorial step index");
  return Math.max(0, Math.min(tutorial.steps.length - 1, stepIndex));
}

export function tutorialDurationMs(tutorial: Tutorial): number {
  const boundaries = timeline(tutorial);
  return boundaries[boundaries.length - 1];
}

/** Intermediate boundaries belong to the next scene; the end remains in the last. */
export function tutorialPlaybackAt(
  tutorial: Tutorial,
  playheadMs: number,
): TutorialPlayback {
  finite(playheadMs, "tutorial playhead");
  const boundaries = timeline(tutorial);
  const totalDurationMs = boundaries[boundaries.length - 1];
  const clamped = Math.max(0, Math.min(totalDurationMs, playheadMs));
  let stepIndex = 0;
  while (
    stepIndex < tutorial.steps.length - 1 &&
    clamped >= boundaries[stepIndex + 1]
  )
    stepIndex += 1;
  const stepDurationMs = tutorial.steps[stepIndex].durationMs;
  const stepElapsedMs =
    clamped === totalDurationMs
      ? stepDurationMs
      : Math.max(0, Math.min(stepDurationMs, clamped - boundaries[stepIndex]));
  return {
    playheadMs: clamped,
    totalDurationMs,
    stepIndex,
    stepElapsedMs,
    stepDurationMs,
    stepProgress: stepElapsedMs / stepDurationMs,
    progress: clamped / totalDurationMs,
    isComplete: clamped === totalDurationMs,
  };
}

export function seekTutorial(
  tutorial: Tutorial,
  progress: number,
): TutorialPlayback {
  finite(progress, "tutorial progress");
  const clamped = Math.max(0, Math.min(1, progress));
  return tutorialPlaybackAt(tutorial, clamped * tutorialDurationMs(tutorial));
}

export function tutorialStepStartMs(
  tutorial: Tutorial,
  stepIndex: number,
): number {
  const boundaries = timeline(tutorial);
  return boundaries[clampStep(tutorial, stepIndex)];
}

export function adjacentTutorialStep(
  tutorial: Tutorial,
  stepIndex: number,
  direction: -1 | 1,
): number {
  timeline(tutorial);
  if (direction !== -1 && direction !== 1)
    throw new RangeError("Invalid tutorial step direction");
  return clampStep(tutorial, clampStep(tutorial, stepIndex) + direction);
}
