import { test } from "node:test";
import assert from "node:assert/strict";
import { missions } from "../src/data/missions";
import {
  gradeMissionQuiz,
  missionProgress,
  missionRecord,
} from "../src/domain/missions";
import {
  checklistSchema,
  defaultHousehold,
  stateSchema,
} from "../src/types/model";
import { decodeBackup, encodeBackup } from "../src/domain/backup";
test("sedem praktických krokov má jedinečné stabilné ID, obsah a platné kvízy", () => {
  assert.equal(missions.length, 7);
  assert.equal(new Set(missions.map((x) => x.id)).size, 7);
  for (const m of missions) {
    assert.ok(m.steps.length >= 3);
    assert.ok(m.title.length > 5);
    assert.equal(m.quiz.options.length, 3);
    assert.ok(m.quiz.correct >= 0 && m.quiz.correct < m.quiz.options.length);
    assert.equal(
      checklistSchema.safeParse(missionRecord(m, true)).success,
      true,
    );
  }
});
test("pokrok počíta len známe dokončené misie, nie bežné úlohy alebo záložky", () => {
  const state = [
    missionRecord(missions[0], true),
    missionRecord(missions[1], false),
    {
      id: "bookmark-blackout",
      name: "Záložka",
      topic: "ukrytie" as const,
      done: true,
    },
    {
      id: "mission-unknown",
      name: "Neznáma misia",
      topic: "ukrytie" as const,
      done: true,
    },
    {
      id: "seed-1",
      name: "Bežná úloha",
      topic: "evakuácia" as const,
      done: true,
    },
  ];
  const p = missionProgress(state);
  assert.equal(p.completed, 1);
  assert.equal(p.total, 7);
  assert.equal(p.nextId, missions[1].id);
  assert.ok(Math.abs(p.percent - 100 / 7) < 1e-9);
});
test("všetky dokončené kroky nezablokujú návrat; nesplnenie zmení ďalší krok", () => {
  const state = missions.map((m) => missionRecord(m, true));
  assert.equal(missionProgress(state).completed, 7);
  assert.equal(missionProgress(state).nextId, null);
  state[2] = missionRecord(missions[2], false);
  assert.equal(missionProgress(state).completed, 6);
  assert.equal(missionProgress(state).nextId, missions[2].id);
  assert.equal(missionProgress([]).nextId, missions[0].id);
});
test("správna aj nesprávna odpoveď vrátia vysvetlenie; neplatný index sa odmietne", () => {
  for (const m of missions) {
    assert.equal(gradeMissionQuiz(m, m.quiz.correct).correct, true);
    assert.equal(gradeMissionQuiz(m, (m.quiz.correct + 1) % 3).correct, false);
    assert.ok(gradeMissionQuiz(m, 0).explanation.length > 20);
  }
  for (const invalid of [-1, 3, NaN, 0.5])
    assert.throws(() => gradeMissionQuiz(missions[0], invalid));
});
test("stav misií prejde existujúcou JSON zálohou bez zmeny staršej schémy", () => {
  const state = stateSchema.parse({
    household: defaultHousehold,
    inventory: [],
    shopping: [],
    contacts: [],
    safePlaces: [],
    checklists: missions.map((m, i) => missionRecord(m, i < 3)),
  });
  const restored = decodeBackup(encodeBackup(state));
  assert.deepEqual(restored, state);
  assert.equal(missionProgress(restored.checklists).completed, 3);
});
