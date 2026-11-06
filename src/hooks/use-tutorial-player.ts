import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Easing } from "react-native";
import type { Tutorial } from "../data/tutorials";
import {
  seekTutorial,
  tutorialPlaybackAt,
  tutorialStepStartMs,
  type TutorialPlayback,
} from "../domain/tutorials";

export type TutorialPlayerOptions = { active?: boolean };

/** The scene runs on the native driver; React only receives a timeline update 10 times/s. */
export function useTutorialPlayer(
  tutorial: Tutorial,
  { active = true }: TutorialPlayerOptions = {},
) {
  const [progress] = useState(() => new Animated.Value(0));
  const [snapshot, setSnapshot] = useState(() =>
    tutorialPlaybackAt(tutorial, 0),
  );
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const tutorialRef = useRef(tutorial);
  const activeRef = useRef(active);
  const mountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);
  const motionRef = useRef({ ready: false, reduced: false });
  const playingRef = useRef(false);
  const positionRef = useRef(0);
  const startedAtRef = useRef(0);
  const segmentEndRef = useRef(0);
  const generationRef = useRef(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  tutorialRef.current = tutorial;
  activeRef.current = active;

  const controller = useMemo(() => {
    function publish(next: TutorialPlayback) {
      if (mountedRef.current) setSnapshot(next);
    }

    function clearTimer() {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      timerRef.current = null;
    }

    function position() {
      return (
        positionRef.current +
        (playingRef.current
          ? Math.max(0, Date.now() - startedAtRef.current)
          : 0)
      );
    }

    function haltAt(next: TutorialPlayback) {
      // Invalidate before stopping: stop() may synchronously invoke its callback.
      generationRef.current += 1;
      playingRef.current = false;
      positionRef.current = next.playheadMs;
      clearTimer();
      const animation = animationRef.current;
      animationRef.current = null;
      animation?.stop();
      progress.setValue(motionRef.current.reduced ? 1 : next.stepProgress);
      if (mountedRef.current) setPlaying(false);
      publish(next);
    }

    function pause() {
      haltAt(tutorialPlaybackAt(tutorialRef.current, position()));
    }

    function startSegment(playheadMs: number) {
      const currentTutorial = tutorialRef.current;
      const next = tutorialPlaybackAt(currentTutorial, playheadMs);
      if (next.isComplete) {
        haltAt(next);
        return;
      }
      const generation = ++generationRef.current;
      const end =
        tutorialStepStartMs(currentTutorial, next.stepIndex) +
        next.stepDurationMs;
      positionRef.current = next.playheadMs;
      startedAtRef.current = Date.now();
      segmentEndRef.current = end;
      playingRef.current = true;
      if (mountedRef.current) setPlaying(true);
      publish(next);
      progress.setValue(next.stepProgress);
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: next.stepDurationMs - next.stepElapsedMs,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      });
      animationRef.current = animation;
      animation.start(({ finished }) => {
        if (
          generation !== generationRef.current ||
          !playingRef.current ||
          !mountedRef.current
        )
          return;
        animationRef.current = null;
        if (finished) startSegment(end);
        else pause();
      });
    }

    function play() {
      if (
        !mountedRef.current ||
        playingRef.current ||
        !activeRef.current ||
        // The initial native state can be unknown until the bridge responds.
        // An explicit Play on the focused route is allowed in that case;
        // a known inactive/background state still prevents playback.
        (appStateRef.current !== null && appStateRef.current !== "active") ||
        !motionRef.current.ready ||
        motionRef.current.reduced
      )
        return;
      const current = tutorialPlaybackAt(
        tutorialRef.current,
        positionRef.current,
      );
      startSegment(current.isComplete ? 0 : current.playheadMs);
      if (playingRef.current && timerRef.current === null) {
        timerRef.current = setInterval(() => {
          // Keep the outgoing scene until its animation completion changes steps.
          const playhead = Math.min(position(), segmentEndRef.current - 0.001);
          publish(tutorialPlaybackAt(tutorialRef.current, playhead));
        }, 100);
      }
    }

    function restart() {
      haltAt(tutorialPlaybackAt(tutorialRef.current, 0));
    }

    function goToStep(index: number) {
      const current = tutorialRef.current;
      haltAt(tutorialPlaybackAt(current, tutorialStepStartMs(current, index)));
    }

    function seek(normalizedProgress: number) {
      haltAt(seekTutorial(tutorialRef.current, normalizedProgress));
    }

    function setMotionPreference(reduced: boolean) {
      const previouslyReduced = motionRef.current.reduced;
      motionRef.current = { ready: true, reduced };
      if (reduced) pause();
      else if (previouslyReduced)
        progress.setValue(
          tutorialPlaybackAt(tutorialRef.current, positionRef.current)
            .stepProgress,
        );
      if (mountedRef.current) {
        setReducedMotion(reduced);
        setMotionReady(true);
      }
    }

    function dispose() {
      generationRef.current += 1;
      playingRef.current = false;
      clearTimer();
      const animation = animationRef.current;
      animationRef.current = null;
      animation?.stop();
    }

    return {
      play,
      pause,
      restart,
      goToStep,
      seek,
      setMotionPreference,
      dispose,
    };
  }, [progress]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controller.dispose();
    };
  }, [controller]);

  useEffect(() => {
    controller.restart();
  }, [tutorial.id, controller]);

  useEffect(() => {
    if (!active) controller.pause();
  }, [active, controller]);

  useEffect(() => {
    let subscribed = true;
    let preferenceRevision = 0;
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (reduced) => {
        preferenceRevision += 1;
        controller.setMotionPreference(reduced);
      },
    );
    void AccessibilityInfo.isReduceMotionEnabled().then(
      (reduced) => {
        if (subscribed && preferenceRevision === 0)
          controller.setMotionPreference(reduced);
      },
      () => {
        // If the OS preference cannot be read, static scenes remain available.
        if (subscribed && preferenceRevision === 0)
          controller.setMotionPreference(true);
      },
    );
    return () => {
      subscribed = false;
      subscription.remove();
    };
  }, [controller]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      appStateRef.current = state;
      if (state !== "active") controller.pause();
    });
    return () => subscription.remove();
  }, [controller]);

  return {
    playing,
    progress,
    snapshot,
    reducedMotion,
    motionReady,
    play: controller.play,
    pause: controller.pause,
    restart: controller.restart,
    goToStep: controller.goToStep,
    seek: controller.seek,
  };
}
