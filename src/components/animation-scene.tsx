import { memo } from "react";
import { Animated } from "react-native";
import { CivilScene } from "./civil-scene";
import { TutorialScene } from "./tutorial-scene";
import { PracticalScene } from "./practical-scene";
import { InstructionScene } from "./instruction-scene";
import { instructionalScenes } from "../data/instruction-scenes";
import type { Tutorial, TutorialKind } from "../data/tutorials";
import type { AcademyArtKind } from "../data/academy";
export const animationKindArt: Record<
  TutorialKind,
  { art: AcademyArtKind; color: string }
> = {
  bag: { art: "bag", color: "#DDE8C6" },
  water: { art: "water", color: "#D6ECF2" },
  power: { art: "power", color: "#F9E5BE" },
  communication: { art: "radio", color: "#E4DDF4" },
  "adult-cpr": { art: "medical", color: "#F6E0D8" },
  bleeding: { art: "medical", color: "#ECDCE4" },
  burns: { art: "medical", color: "#DAECF0" },
  campfire: { art: "outdoor", color: "#F4DFBF" },
  instructional: { art: "home", color: "#DDE8F6" },
  "armed-conflict": { art: "bag", color: "#C4D6F4" },
  "nuclear-explosion": { art: "home", color: "#D9CDF3" },
};
export const AnimationScene = memo(function AnimationScene({
  tutorial,
  step,
  progress,
}: {
  tutorial: Tutorial;
  step: number;
  progress: Animated.Value;
}) {
  if (tutorial.kind === "instructional")
    return (
      <InstructionScene
        spec={instructionalScenes[tutorial.guideId][step]}
        progress={progress}
      />
    );
  if (
    tutorial.kind === "bag" ||
    tutorial.kind === "water" ||
    tutorial.kind === "power" ||
    tutorial.kind === "communication"
  )
    return (
      <TutorialScene kind={tutorial.kind} step={step} progress={progress} />
    );
  if (
    tutorial.kind === "armed-conflict" ||
    tutorial.kind === "nuclear-explosion"
  )
    return <CivilScene kind={tutorial.kind} step={step} progress={progress} />;
  return (
    <PracticalScene kind={tutorial.kind} step={step} progress={progress} />
  );
});
