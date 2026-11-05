import { test } from "node:test";
import assert from "node:assert/strict";
import { scenarios, type Scenario } from "../src/data/scenarios";
import { academyGuides } from "../src/data/academy";
import {
  activeScenarioNode,
  chooseScenario,
  completedDrills,
  scenarioBreadcrumbs,
  scenarioCompletion,
  scenarioResult,
  validateScenarioGraph,
} from "../src/domain/scenarios";
import { checklistSchema } from "../src/types/model";
test("päť offline scenárov má platný dostupný acyklický graf a existujúce návody", () => {
  assert.equal(scenarios.length, 5);
  assert.equal(new Set(scenarios.map((x) => x.id)).size, 5);
  for (const scenario of scenarios)
    assert.deepEqual(
      validateScenarioGraph(
        scenario,
        academyGuides.map((x) => x.id),
      ),
      [],
    );
});
test("voľby skutočne menia výsledok, cesta zachováva zvolené odpovede", () => {
  const s = scenarios[0];
  const safe = chooseScenario(s, chooseScenario(s, [], "dark"), "torch");
  const hazard = chooseScenario(s, [], "danger");
  assert.equal(scenarioResult(s, safe)?.urgent, false);
  assert.equal(scenarioResult(s, hazard)?.urgent, true);
  assert.notEqual(
    activeScenarioNode(s, safe).nodeId,
    activeScenarioNode(s, hazard).nodeId,
  );
  assert.deepEqual(
    scenarioBreadcrumbs(s, safe).map((x) => x.id),
    ["dark", "torch"],
  );
  assert.equal(activeScenarioNode(s, safe.slice(0, -1)).nodeId, "light");
  assert.equal(activeScenarioNode(s, []).nodeId, s.start);
});
test("cudzia voľba, poškodená cesta a pokračovanie za výsledok sa odmietnu", () => {
  const s = scenarios[0];
  assert.throws(() => chooseScenario(s, [], "missing"));
  assert.throws(() =>
    activeScenarioNode(s, [{ nodeId: "light", choiceId: "torch" }]),
  );
  assert.throws(() =>
    chooseScenario(s, chooseScenario(s, [], "danger"), "torch"),
  );
  assert.equal(scenarioResult(s, []), null);
});
test("validátor odhalí cyklus, neznámy návod a nedostupné uzly", () => {
  const malformed: Scenario = {
    ...scenarios[0],
    nodes: {
      start: {
        kind: "question",
        title: "Test",
        body: "",
        choices: [
          { id: "loop", label: "", detail: "", next: "start" },
          { id: "end", label: "", detail: "", next: "end" },
        ],
      },
      end: {
        kind: "outcome",
        title: "End",
        body: "",
        actions: ["one", "two"],
        guideId: "missing",
        urgent: false,
      },
      orphan: {
        kind: "outcome",
        title: "Orphan",
        body: "",
        actions: [],
        guideId: "missing",
        urgent: false,
      },
    },
  };
  const errors = validateScenarioGraph(malformed, []);
  assert.ok(errors.some((x) => x.startsWith("Cyklus")));
  assert.ok(errors.some((x) => x.startsWith("Neznámy návod")));
  assert.ok(errors.some((x) => x.startsWith("Nedostupný krok")));
});
test("pokrok nácvikov je validovaný a ignoruje cudzie alebo nedokončené importované ID", () => {
  const done = scenarioCompletion(scenarios[0]);
  assert.equal(checklistSchema.safeParse(done).success, true);
  assert.equal(done.id, "drill-blackout");
  assert.deepEqual(
    completedDrills([
      done,
      { ...done, id: "drill-old" },
      { ...done, id: "bookmark-blackout" },
      { ...scenarioCompletion(scenarios[1]), done: false },
      done,
    ]),
    ["blackout"],
  );
});
