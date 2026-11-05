import {
  scenarios,
  type Scenario,
  type ScenarioChoice,
  type ScenarioOutcome,
} from "../data/scenarios";
import { checklistSchema, type Checklist } from "../types/model";
export type ScenarioPath = { nodeId: string; choiceId: string }[];
export const DRILL_PREFIX = "drill-";
export function findScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
export function activeScenarioNode(scenario: Scenario, path: ScenarioPath) {
  let nodeId = scenario.start;
  for (const entry of path) {
    if (entry.nodeId !== nodeId) throw new Error("Neplatná cesta nácviku.");
    const node = scenario.nodes[nodeId];
    if (!node || node.kind !== "question")
      throw new Error("Po výsledku už nemožno vybrať ďalšiu odpoveď.");
    const choice = node.choices.find((c) => c.id === entry.choiceId);
    if (!choice) throw new Error("Odpoveď nepatrí k tejto otázke.");
    nodeId = choice.next;
  }
  const node = scenario.nodes[nodeId];
  if (!node) throw new Error("Krok nácviku neexistuje.");
  return { nodeId, node };
}
export function chooseScenario(
  scenario: Scenario,
  path: ScenarioPath,
  choiceId: string,
): ScenarioPath {
  const { nodeId, node } = activeScenarioNode(scenario, path);
  if (node.kind !== "question" || !node.choices.some((c) => c.id === choiceId))
    throw new Error("Vyberte jednu zo zobrazených možností.");
  return [...path, { nodeId, choiceId }];
}
export function scenarioBreadcrumbs(
  scenario: Scenario,
  path: ScenarioPath,
): ScenarioChoice[] {
  activeScenarioNode(scenario, path);
  return path.map((x) => {
    const node = scenario.nodes[x.nodeId];
    if (node.kind !== "question") throw new Error("Neplatná cesta.");
    return node.choices.find((c) => c.id === x.choiceId)!;
  });
}
export function completedDrills(items: Checklist[]): string[] {
  return scenarios
    .filter((s) => items.some((x) => x.id === DRILL_PREFIX + s.id && x.done))
    .map((x) => x.id);
}
export function scenarioCompletion(scenario: Scenario): Checklist {
  return checklistSchema.parse({
    id: DRILL_PREFIX + scenario.id,
    name: `Nácvik: ${scenario.title}`,
    topic: "ukrytie",
    done: true,
  });
}
/** Validate every branch, cycles, guide references and unreachable content before shipping offline data. */
export function validateScenarioGraph(
  scenario: Scenario,
  guideIds: readonly string[],
): string[] {
  const errors: string[] = [],
    visited = new Set<string>(),
    active = new Set<string>();
  function visit(id: string) {
    if (active.has(id)) {
      errors.push(`Cyklus: ${id}`);
      return;
    }
    if (visited.has(id)) return;
    const node = scenario.nodes[id];
    if (!node) {
      errors.push(`Chýbajúci krok: ${id}`);
      return;
    }
    active.add(id);
    visited.add(id);
    if (node.kind === "question") {
      if (node.choices.length < 2 || node.choices.length > 3)
        errors.push(`Počet odpovedí: ${id}`);
      if (new Set(node.choices.map((x) => x.id)).size !== node.choices.length)
        errors.push(`Duplicitná odpoveď: ${id}`);
      node.choices.forEach((c) => visit(c.next));
    } else {
      if (!guideIds.includes(node.guideId))
        errors.push(`Neznámy návod: ${node.guideId}`);
      if (node.actions.length < 2) errors.push(`Prázdny výsledok: ${id}`);
    }
    active.delete(id);
  }
  visit(scenario.start);
  for (const id of Object.keys(scenario.nodes))
    if (!visited.has(id)) errors.push(`Nedostupný krok: ${id}`);
  return errors;
}
export function scenarioResult(
  scenario: Scenario,
  path: ScenarioPath,
): ScenarioOutcome | null {
  const { node } = activeScenarioNode(scenario, path);
  return node.kind === "outcome" ? node : null;
}
