import { test } from "node:test";
import assert from "node:assert/strict";
import { academyGuides } from "../src/data/academy";
import { civilProtectionGuides } from "../src/data/civil-protection";
test("both civilian preparedness guides are reachable and include real source links", () => {
  for (const guide of civilProtectionGuides) {
    assert.equal(
      academyGuides.find((g) => g.id === guide.id),
      guide,
    );
    assert.match(guide.source, /^https:\/\//);
    assert.ok(guide.steps.length >= 5);
  }
});
test("nuclear guidance distinguishes immediate blast, fallout and conditional shelter duration", () => {
  const guide = civilProtectionGuides.find(
    (g) => g.id === "nuclear-explosion",
  )!;
  const text = guide.steps.map((s) => s.body).join(" ");
  assert.match(text, /Nepozerajte do záblesku/);
  assert.match(text, /Po prechode tlakovej vlny/);
  assert.match(text, /24 hodín.*požiar.*zrútenie.*úrady/);
  assert.match(text, /Varenie.*neodstráni/);
  assert.match(text, /nepoužívajte kondicionér/);
  assert.match(guide.takeaway, /iba na pokyn zdravotných úradov/);
});
