import { act, cleanup, renderHook } from "@testing-library/react-native";
import {
  AccessibilityInfo,
  Animated,
  AppState,
  type AppStateStatus,
} from "react-native";
import type { Tutorial } from "../src/data/tutorials";
import { useTutorialPlayer } from "../src/hooks/use-tutorial-player";

const tutorial: Tutorial = {
  id: "test-tutorial",
  guideId: "test-guide",
  kind: "bag",
  title: "Test tutorial",
  summary: "Test summary",
  steps: [0, 1, 2].map((index) => ({
    title: `Step ${index + 1}`,
    body: "Test instruction",
    durationMs: 8_000,
  })),
};

type TestAnimation = {
  config: Animated.TimingAnimationConfig;
  complete: (finished?: boolean) => void;
  stop: jest.Mock;
};

let animations: TestAnimation[];
let motionChanged: (reduced: boolean) => void;
let appStateChanged: (state: AppStateStatus) => void;
let removeMotion: jest.Mock;
let removeAppState: jest.Mock;
const originalAppState = AppState.currentState;

function frame(value: Animated.Value) {
  return (value as Animated.Value & { __getValue: () => number }).__getValue();
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-11-05T12:00:00Z"));
  AppState.currentState = "active";
  animations = [];
  removeMotion = jest.fn();
  removeAppState = jest.fn();
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
  jest
    .spyOn(AccessibilityInfo, "addEventListener")
    .mockImplementation((_event, listener) => {
      motionChanged = listener as (reduced: boolean) => void;
      return { remove: removeMotion };
    });
  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation((_event, listener) => {
      appStateChanged = listener;
      return { remove: removeAppState };
    });
  jest.spyOn(Animated, "timing").mockImplementation((value, config) => {
    let callback: ((result: { finished: boolean }) => void) | undefined;
    let stopped = false;
    const animation: TestAnimation = {
      config,
      complete: (finished = true) => {
        if (finished && !stopped) (value as Animated.Value).setValue(1);
        callback?.({ finished });
      },
      stop: jest.fn(() => {
        stopped = true;
        callback?.({ finished: false });
      }),
    };
    animations.push(animation);
    return {
      start: (onEnd) => {
        callback = onEnd;
      },
      stop: animation.stop,
      reset: jest.fn(),
    };
  });
});

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
  jest.useRealTimers();
  AppState.currentState = originalAppState;
});

test("starts paused and cannot play before the OS motion preference is known", async () => {
  let resolvePreference!: (reduced: boolean) => void;
  jest
    .mocked(AccessibilityInfo.isReduceMotionEnabled)
    .mockReturnValue(new Promise((resolve) => (resolvePreference = resolve)));
  const { result } = await renderHook(() => useTutorialPlayer(tutorial));
  expect(result.current.motionReady).toBe(false);
  expect(result.current.playing).toBe(false);
  expect(result.current.snapshot.playheadMs).toBe(0);
  await act(() => result.current.play());
  expect(animations).toHaveLength(0);

  await act(() => resolvePreference(false));
  expect(result.current.motionReady).toBe(true);
  expect(result.current.reducedMotion).toBe(false);
  expect(result.current.playing).toBe(false);
  expect(animations).toHaveLength(0);
});

test("an unknown initial app state allows explicit play, then backgrounding pauses it", async () => {
  AppState.currentState = null;
  const { result } = await renderHook(() => useTutorialPlayer(tutorial));
  expect(result.current.playing).toBe(false);
  await act(() => result.current.play());
  expect(result.current.playing).toBe(true);
  expect(animations).toHaveLength(1);
  await act(() => {
    jest.advanceTimersByTime(500);
    appStateChanged("background");
  });
  expect(result.current.playing).toBe(false);
  expect(result.current.snapshot.stepElapsedMs).toBe(500);
  await act(() => result.current.play());
  expect(animations).toHaveLength(1);
  await act(() => appStateChanged("active"));
  expect(result.current.playing).toBe(false);
});

test("a known inactive initial app state blocks play until the app becomes active", async () => {
  AppState.currentState = "inactive";
  const { result } = await renderHook(() => useTutorialPlayer(tutorial));
  await act(() => result.current.play());
  expect(result.current.playing).toBe(false);
  expect(animations).toHaveLength(0);
  await act(() => appStateChanged("active"));
  expect(result.current.playing).toBe(false);
  await act(() => result.current.play());
  expect(result.current.playing).toBe(true);
  expect(animations).toHaveLength(1);
});

test("pause keeps the exact frame and resume animates only the remaining step", async () => {
  const { result } = await renderHook(() => useTutorialPlayer(tutorial));
  await act(() => result.current.play());
  expect(result.current.playing).toBe(true);
  expect(animations[0].config).toMatchObject({
    duration: 8_000,
    useNativeDriver: true,
    isInteraction: false,
  });
  await act(() => jest.advanceTimersByTime(2_250));
  expect(result.current.snapshot.stepElapsedMs).toBe(2_200);
  await act(() => result.current.pause());
  expect(result.current.playing).toBe(false);
  expect(result.current.snapshot.stepElapsedMs).toBe(2_250);
  expect(frame(result.current.progress)).toBe(2_250 / 8_000);
  await act(() => jest.advanceTimersByTime(4_000));
  expect(result.current.snapshot.stepElapsedMs).toBe(2_250);

  await act(() => result.current.play());
  expect(animations[1].config.duration).toBe(5_750);
  await act(() => {
    jest.advanceTimersByTime(5_750);
    animations[1].complete();
  });
  expect(result.current.snapshot.stepIndex).toBe(1);
  expect(result.current.snapshot.stepElapsedMs).toBe(0);
  expect(frame(result.current.progress)).toBe(0);
  expect(animations[2].config.duration).toBe(8_000);
});

test("finishes once, stops, and an explicit replay starts at the beginning", async () => {
  const intervals = jest.spyOn(global, "setInterval");
  const cleared = jest.spyOn(global, "clearInterval");
  const { result } = await renderHook(() => useTutorialPlayer(tutorial));
  await act(() => result.current.play());
  const playbackTimer = intervals.mock.results[0].value;
  for (let index = 0; index < tutorial.steps.length; index += 1) {
    await act(() => {
      jest.advanceTimersByTime(8_000);
      animations[index].complete();
    });
  }
  expect(result.current.playing).toBe(false);
  expect(result.current.snapshot).toMatchObject({
    stepIndex: 2,
    stepProgress: 1,
    playheadMs: 24_000,
    isComplete: true,
  });
  expect(frame(result.current.progress)).toBe(1);
  await act(() => jest.advanceTimersByTime(120_000));
  expect(animations).toHaveLength(3);
  expect(cleared).toHaveBeenCalledWith(playbackTimer);

  await act(() => result.current.play());
  expect(result.current.playing).toBe(true);
  expect(result.current.snapshot.playheadMs).toBe(0);
  expect(animations).toHaveLength(4);
});

test("step navigation and seeking pause, clamp boundaries, and reject invalid values", async () => {
  const { result } = await renderHook(() => useTutorialPlayer(tutorial));
  await act(() => result.current.play());
  const outgoing = animations[0];
  await act(() => {
    jest.advanceTimersByTime(1_000);
    result.current.goToStep(99);
  });
  expect(result.current.playing).toBe(false);
  expect(result.current.snapshot).toMatchObject({
    stepIndex: 2,
    stepElapsedMs: 0,
  });
  expect(frame(result.current.progress)).toBe(0);
  await act(() => outgoing.complete());
  expect(result.current.snapshot.stepIndex).toBe(2);
  expect(animations).toHaveLength(1);

  await act(() => result.current.seek(0.5));
  expect(result.current.snapshot).toMatchObject({
    stepIndex: 1,
    stepElapsedMs: 4_000,
    stepProgress: 0.5,
  });
  expect(frame(result.current.progress)).toBe(0.5);
  await act(() => result.current.seek(-2));
  expect(result.current.snapshot.playheadMs).toBe(0);
  await act(() => result.current.seek(2));
  expect(result.current.snapshot.isComplete).toBe(true);
  expect(frame(result.current.progress)).toBe(1);
  expect(() => result.current.seek(Number.NaN)).toThrow(RangeError);
  expect(() => result.current.goToStep(0.5)).toThrow(RangeError);
  expect(result.current.snapshot.isComplete).toBe(true);
  await act(() => result.current.goToStep(-10));
  expect(result.current.snapshot.playheadMs).toBe(0);
});

test("a stale completion after seek cannot advance a newly started animation", async () => {
  const { result } = await renderHook(() => useTutorialPlayer(tutorial));
  await act(() => result.current.play());
  const outgoing = animations[0];
  await act(() => result.current.seek(0.5));
  await act(() => result.current.play());
  expect(animations[1].config.duration).toBe(4_000);
  await act(() => outgoing.complete());
  expect(result.current.playing).toBe(true);
  expect(result.current.snapshot.stepIndex).toBe(1);
  expect(result.current.snapshot.stepElapsedMs).toBe(4_000);
  expect(animations).toHaveLength(2);
});

test("reduced motion shows static representative frames and never automatically resumes", async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  const { result } = await renderHook(() => useTutorialPlayer(tutorial));
  expect(result.current.motionReady).toBe(true);
  expect(result.current.reducedMotion).toBe(true);
  expect(frame(result.current.progress)).toBe(1);
  await act(() => {
    result.current.goToStep(1);
    result.current.play();
  });
  expect(result.current.snapshot.stepIndex).toBe(1);
  expect(frame(result.current.progress)).toBe(1);
  expect(animations).toHaveLength(0);

  await act(() => motionChanged(false));
  expect(frame(result.current.progress)).toBe(0);
  expect(result.current.playing).toBe(false);
  await act(() => result.current.play());
  await act(() => {
    jest.advanceTimersByTime(2_000);
    motionChanged(true);
  });
  expect(result.current.playing).toBe(false);
  expect(result.current.snapshot.stepElapsedMs).toBe(2_000);
  expect(frame(result.current.progress)).toBe(1);
  await act(() => motionChanged(false));
  expect(result.current.playing).toBe(false);
  expect(frame(result.current.progress)).toBe(0.25);
});

test("an OS change wins over a late initial accessibility query", async () => {
  let resolvePreference!: (reduced: boolean) => void;
  jest
    .mocked(AccessibilityInfo.isReduceMotionEnabled)
    .mockReturnValue(new Promise((resolve) => (resolvePreference = resolve)));
  const { result } = await renderHook(() => useTutorialPlayer(tutorial));
  await act(() => motionChanged(true));
  await act(() => resolvePreference(false));
  expect(result.current.reducedMotion).toBe(true);
  expect(frame(result.current.progress)).toBe(1);
  await act(() => result.current.play());
  expect(result.current.playing).toBe(false);
});

test("an unavailable accessibility preference falls back to static viewing", async () => {
  jest
    .mocked(AccessibilityInfo.isReduceMotionEnabled)
    .mockRejectedValue(new Error("OS preference unavailable"));
  const { result } = await renderHook(() => useTutorialPlayer(tutorial));
  expect(result.current.motionReady).toBe(true);
  expect(result.current.reducedMotion).toBe(true);
  expect(frame(result.current.progress)).toBe(1);
});

test("backgrounding or deactivating the route pauses and requires an explicit resume", async () => {
  const { result, rerender } = await renderHook(
    ({ active }: { active: boolean }) =>
      useTutorialPlayer(tutorial, { active }),
    { initialProps: { active: true } },
  );
  await act(() => result.current.play());
  await act(() => {
    jest.advanceTimersByTime(500);
    appStateChanged("background");
  });
  expect(result.current.playing).toBe(false);
  expect(result.current.snapshot.stepElapsedMs).toBe(500);
  await act(() => result.current.play());
  expect(animations).toHaveLength(1);
  await act(() => appStateChanged("active"));
  expect(result.current.playing).toBe(false);
  await act(() => result.current.play());
  await act(() => jest.advanceTimersByTime(500));
  await rerender({ active: false });
  expect(result.current.playing).toBe(false);
  expect(result.current.snapshot.stepElapsedMs).toBe(1_000);
  await act(() => result.current.play());
  expect(animations).toHaveLength(2);
  await rerender({ active: true });
  expect(result.current.playing).toBe(false);
  await act(() => result.current.play());
  expect(animations[2].config.duration).toBe(7_000);
});

test("restart and changing tutorial cancel old work, while unmount removes all resources", async () => {
  const intervals = jest.spyOn(global, "setInterval");
  const cleared = jest.spyOn(global, "clearInterval");
  const { result, rerender, unmount } = await renderHook(
    ({ current }: { current: Tutorial }) => useTutorialPlayer(current),
    { initialProps: { current: tutorial } },
  );
  await act(() => result.current.play());
  const outgoing = animations[0];
  await act(() => {
    jest.advanceTimersByTime(2_000);
    result.current.restart();
  });
  expect(result.current.snapshot.playheadMs).toBe(0);
  expect(result.current.playing).toBe(false);
  await act(() => result.current.play());
  await rerender({ current: { ...tutorial, id: "another-tutorial" } });
  expect(result.current.snapshot.playheadMs).toBe(0);
  expect(result.current.playing).toBe(false);
  await act(() => outgoing.complete());
  expect(result.current.snapshot.playheadMs).toBe(0);
  expect(animations).toHaveLength(2);
  await act(() => result.current.play());
  const finalAnimation = animations[2];
  const finalTimer = intervals.mock.results.at(-1)!.value;
  await unmount();
  expect(finalAnimation.stop).toHaveBeenCalledTimes(1);
  expect(removeMotion).toHaveBeenCalledTimes(1);
  expect(removeAppState).toHaveBeenCalledTimes(1);
  expect(cleared).toHaveBeenCalledWith(finalTimer);
  await act(() => finalAnimation.complete());
  expect(animations).toHaveLength(3);
});
