import { missions, type Mission } from "../data/missions";
import { checklistSchema, type Checklist } from "../types/model";

export const MISSION_PREFIX = "mission-";
export function missionRecord(mission: Mission, done: boolean): Checklist {
  return checklistSchema.parse({
    id: `${MISSION_PREFIX}${mission.id}`,
    name: mission.title,
    topic: "ukrytie",
    done,
  });
}
export function missionProgress(checklists: Checklist[]) {
  const completedIds = new Set(
    checklists
      .filter((x) => x.done && x.id.startsWith(MISSION_PREFIX))
      .map((x) => x.id.slice(MISSION_PREFIX.length)),
  );
  const completed = missions.filter((mission) =>
    completedIds.has(mission.id),
  ).length;
  return {
    completed,
    total: missions.length,
    percent: (completed / missions.length) * 100,
    nextId:
      missions.find((mission) => !completedIds.has(mission.id))?.id ?? null,
    items: missions.map((mission) => ({
      mission,
      done: completedIds.has(mission.id),
    })),
  };
}
export function gradeMissionQuiz(mission: Mission, answer: number) {
  if (
    !Number.isInteger(answer) ||
    answer < 0 ||
    answer >= mission.quiz.options.length
  )
    throw new Error("Vyberte jednu z dostupných odpovedí.");
  return {
    correct: answer === mission.quiz.correct,
    explanation: mission.quiz.explanation,
  };
}
