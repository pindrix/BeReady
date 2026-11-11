import { useCallback, useState, type ReactNode } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTutorialPlayer } from "../hooks/use-tutorial-player";
import type { Tutorial } from "../data/tutorials";
import { explanations, type ExplanationTopic } from "../data/explanations";
import { AnimationScene } from "./animation-scene";
import { InstructionScene } from "./instruction-scene";
import { SceneViewer, SimulationPreview } from "./simulation-scene";
import { Button, Card, Row, T } from "./ui";
import { Badge, IconButton } from "./visual";
function useFocusedPlayer(tutorial: Tutorial) {
  const [active, setActive] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setActive(true);
      return () => setActive(false);
    }, []),
  );
  return useTutorialPlayer(tutorial, { active });
}
function Actions({ player }: { player: ReturnType<typeof useTutorialPlayer> }) {
  return (
    <View style={{ gap: 8 }}>
      <Row>
        <View style={{ flex: 1 }}>
          <Button
            title={player.playing ? "Pozastaviť" : "Prehrať"}
            disabled={!player.motionReady || player.reducedMotion}
            onPress={player.playing ? player.pause : player.play}
          />
        </View>
        <IconButton
          name="refresh-outline"
          label="Od začiatku"
          onPress={player.restart}
        />
      </Row>
      {player.reducedMotion ? <T muted>Statická ukážka</T> : null}
    </View>
  );
}
/** The reader owns the step; a changed step restarts its illustration paused. */
export function AnimatedStep({
  tutorial,
  index,
  children,
}: {
  tutorial: Tutorial;
  index: number;
  children: ReactNode;
}) {
  const single: Tutorial = {
    ...tutorial,
    id: "reader-" + tutorial.id + "-" + index,
    steps: [tutorial.steps[index]],
  };
  const player = useFocusedPlayer(single);
  return (
    <View style={{ gap: 12 }}>
      <AnimationScene
        tutorial={tutorial}
        step={index}
        progress={player.progress}
        phase={player.reducedMotion ? 1 : player.snapshot.stepProgress}
      />
      <View accessibilityLiveRegion="polite" style={{ gap: 12 }}>
        {children}
      </View>
      <Actions player={player} />
    </View>
  );
}
function ActiveExplanation({ topic }: { topic: ExplanationTopic }) {
  const config = explanations[topic];
  const model: Tutorial = {
    id: "explanation-" + topic,
    guideId: topic,
    kind: "instructional",
    title: config.title,
    summary: config.title,
    steps: config.steps.map((s) => ({
      title: s.title,
      body: s.body,
      durationMs: 7000,
    })),
  };
  const player = useFocusedPlayer(model),
    i = player.snapshot.stepIndex,
    step = config.steps[i];
  return (
    <View style={{ gap: 12 }}>
      <SceneViewer
        scene={{
          id: "explanation-" + topic,
          kind: "explanation",
          step: i,
          spec: step.scene,
        }}
        progress={player.progress}
        phase={player.reducedMotion ? 1 : player.snapshot.stepProgress}
        fallback={
          <InstructionScene spec={step.scene} progress={player.progress} />
        }
      />
      <View accessibilityLiveRegion="polite" style={{ gap: 7 }}>
        <Badge label={`Krok ${i + 1} z ${config.steps.length}`} />
        <T large>{step.title}</T>
        <T>{step.body}</T>
      </View>
      <Row>
        <IconButton
          name="play-skip-back"
          label="Predchádzajúci krok"
          disabled={i === 0}
          onPress={() => player.goToStep(i - 1)}
        />
        <IconButton
          prominent
          name={player.playing ? "pause" : "play"}
          label={player.playing ? "Pozastaviť" : "Prehrať"}
          disabled={!player.motionReady || player.reducedMotion}
          onPress={player.playing ? player.pause : player.play}
        />
        <IconButton
          name="play-skip-forward"
          label="Ďalší krok"
          disabled={i === config.steps.length - 1}
          onPress={() => player.goToStep(i + 1)}
        />
        <IconButton
          name="refresh-outline"
          label="Od začiatku"
          onPress={player.restart}
        />
      </Row>
      {player.reducedMotion ? <T muted>Statická ukážka</T> : null}
      <T muted>Animácia vysvetľuje princíp. Vaše údaje sa tým nemenia.</T>
    </View>
  );
}
/** Closed cards allocate no controller or animated timers; playback is always deliberate. */
export function ExplanationCard({ topic }: { topic: ExplanationTopic }) {
  const [open, setOpen] = useState(false),
    config = explanations[topic];
  return (
    <Card>
      <Row>
        <View style={{ flex: 1, gap: 4 }}>
          <T muted>Animácia</T>
          <T large>{config.title}</T>
        </View>
        <IconButton
          name={open ? "close-outline" : "play-circle-outline"}
          label={open ? "Zavrieť" : "Animácia"}
          onPress={() => setOpen(!open)}
        />
      </Row>
      {open ? (
        <ActiveExplanation topic={topic} />
      ) : (
        <SimulationPreview
          scene={{
            id: "explanation-" + topic,
            kind: "explanation",
            step: 0,
            spec: config.steps[0].scene,
          }}
        />
      )}
    </Card>
  );
}
