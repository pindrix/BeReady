import { test } from "node:test";
import assert from "node:assert/strict";
import {
  academyGuides,
  guideBookmark,
  savedGuideIds,
  searchAcademy,
  videoTopics,
  youtubeSearchUrl,
} from "../src/data/academy";
import { checklistSchema } from "../src/types/model";
test("akadémia obsahuje rozsiahle offline postupy s jedinečnými ID a zdrojmi", () => {
  assert.ok(academyGuides.length >= 18);
  assert.equal(
    new Set(academyGuides.map((x) => x.id)).size,
    academyGuides.length,
  );
  for (const guide of academyGuides) {
    assert.ok(guide.steps.length >= 3);
    assert.ok(guide.steps.every((step) => step.title && step.body.length > 40));
    assert.match(guide.source, /^https:\/\//);
    assert.match(guide.reviewed, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(guide.takeaway && guide.summary && guide.sourceName);
  }
});
test("vyhľadávanie a kategórie vracajú len skutočné offline témy", () => {
  assert.ok(searchAcademy("VODA").some((x) => x.id === "water-storage"));
  assert.equal(searchAcademy("témaktoráneexistuje").length, 0);
  assert.ok(
    searchAcademy("", "Prvá pomoc").every((x) => x.category === "Prvá pomoc"),
  );
  assert.deepEqual(searchAcademy("", "Uložené", []), []);
  assert.deepEqual(
    searchAcademy("", "Uložené", ["go-bag"]).map((x) => x.id),
    ["go-bag"],
  );
});
test("záložky používajú validovaný perzistentný záznam a rešpektujú zrušenie", () => {
  const guide = academyGuides.find((x) => x.id === "go-bag")!;
  const saved = guideBookmark(guide, true),
    unsaved = guideBookmark(guide, false);
  assert.deepEqual(checklistSchema.parse(saved), saved);
  assert.deepEqual(savedGuideIds([saved]), ["go-bag"]);
  assert.deepEqual(savedGuideIds([unsaved]), []);
  assert.equal(saved.id, unsaved.id);
});
test("záložky z importu počítajú len návody aktuálnej knižnice", () => {
  const guide = academyGuides.find((item) => item.id === "go-bag")!;
  const current = guideBookmark(guide, true);
  const unknown = {
    ...current,
    id: "bookmark-removed-guide",
    name: "Starý návod",
  };
  const unrelated = { ...current, id: "mission-water", name: "Úloha" };
  const saved = savedGuideIds([unknown, unrelated, current, current]);
  assert.deepEqual(saved, ["go-bag"]);
  assert.equal(searchAcademy("", "Uložené", saved).length, saved.length);
  assert.deepEqual(savedGuideIds([unknown]), []);
});
test("video odkazy sú explicitné HTTPS vyhľadávanie, bez vymyslených video ID", () => {
  assert.ok(videoTopics.length >= 8);
  for (const video of videoTopics) {
    const url = new URL(youtubeSearchUrl(video.query));
    assert.equal(url.hostname, "www.youtube.com");
    assert.equal(url.pathname, "/results");
    assert.equal(url.searchParams.get("search_query"), video.query);
    assert.ok(video.organization && video.language);
    assert.equal("videoId" in video, false);
  }
  assert.throws(() => youtubeSearchUrl(" "));
  assert.equal(
    new URL(youtubeSearchUrl("červený kríž & pomoc")).searchParams.get(
      "search_query",
    ),
    "červený kríž & pomoc",
  );
});
