import { academyGuides } from "./academy";
import { practicalTutorials } from "./practical-tutorials";

export type TutorialKind =
  | "bag"
  | "water"
  | "power"
  | "communication"
  | "adult-cpr"
  | "bleeding"
  | "burns"
  | "campfire"
  | "armed-conflict"
  | "nuclear-explosion";
export type Tutorial = {
  id: string;
  guideId: string;
  title: string;
  summary: string;
  kind: TutorialKind;
  steps: { title: string; body: string; durationMs: number }[];
  sourceUrl?: string;
  sourceName?: string;
  sourceVerifiedOnline?: boolean;
  warning?: string;
};

const tutorialSources: { guideId: string; kind: TutorialKind }[] = [
  { guideId: "go-bag", kind: "bag" },
  { guideId: "water-storage", kind: "water" },
  { guideId: "blackout", kind: "power" },
  { guideId: "communication", kind: "communication" },
];

// Playback duration is illustrative; it is never a real-world task timer.
const stepDurationMs = 8_000;

const guideTutorials: Tutorial[] = tutorialSources.map(({ guideId, kind }) => {
  const guide = academyGuides.find((candidate) => candidate.id === guideId);
  if (!guide) throw new Error(`Missing tutorial guide: ${guideId}`);
  return {
    id: guideId,
    guideId,
    kind,
    title: guide.title,
    summary: guide.summary,
    steps: guide.steps.map((step) => ({ ...step, durationMs: stepDurationMs })),
  };
});

export const animationTutorials: Tutorial[] = [
  ...guideTutorials,
  ...practicalTutorials,
  ...(["armed-conflict", "nuclear-explosion"] as const).map((id) => {
    const guide = academyGuides.find((g) => g.id === id)!;
    return {
      id,
      guideId: id,
      kind: id,
      title: guide.title,
      summary: guide.summary,
      warning: guide.takeaway,
      sourceUrl: guide.source,
      sourceName: guide.sourceName,
      sourceVerifiedOnline: false,
      steps: guide.steps.map((step) => ({ ...step, durationMs: 10000 })),
    };
  }),
];

export function getTutorial(id: string): Tutorial | undefined {
  return animationTutorials.find((tutorial) => tutorial.id === id);
}

export function getTutorialForGuide(guideId: string): Tutorial | undefined {
  return animationTutorials.find((tutorial) => tutorial.guideId === guideId);
}

export function getTutorialsForGuide(guideId: string): Tutorial[] {
  return animationTutorials.filter((tutorial) => tutorial.guideId === guideId);
}
