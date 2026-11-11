import { SceneViewer } from "../../src/components/simulation-scene";
import { InstructionScene } from "../../src/components/instruction-scene";
import {
  explanations,
  type ExplanationTopic,
} from "../../src/data/explanations";
/** Browser-only review fixture: actual production 3D renderer with deterministic sample time. */
import { useState } from "react";
import { Animated } from "react-native";
import { AnimationScene } from "../../src/components/animation-scene";
import { Screen, T } from "../../src/components/ui";
import { animationTutorials } from "../../src/data/tutorials";
export default function SimulationFixture() {
  const params = new URLSearchParams(window.location.search),
    tutorial =
      animationTutorials.find((x) => x.id === params.get("id")) ??
      animationTutorials[4];
  const step = Math.min(
      tutorial.steps.length - 1,
      Math.max(0, Number(params.get("step") ?? 0)),
    ),
    phase = Math.min(1, Math.max(0, Number(params.get("phase") ?? 0.5)));
  const [progress] = useState(() => new Animated.Value(phase));
  const topic = params.get("topic");
  if (topic && topic in explanations) {
    const model = explanations[topic as ExplanationTopic],
      i = Math.min(model.steps.length - 1, step),
      row = model.steps[i];
    return (
      <Screen title={model.title}>
        <SceneViewer
          scene={{
            id: "explanation-" + topic,
            kind: "explanation",
            step: i,
            spec: row.scene,
          }}
          progress={progress}
          phase={phase}
          fallback={<InstructionScene spec={row.scene} progress={progress} />}
        />
        <T large>{row.title}</T>
        <T>{row.body}</T>
      </Screen>
    );
  }
  return (
    <Screen title={tutorial.title}>
      <AnimationScene
        tutorial={tutorial}
        step={step}
        progress={progress}
        phase={phase}
      />
      <T large>{tutorial.steps[step].title}</T>
      <T>{tutorial.steps[step].body}</T>
    </Screen>
  );
}
