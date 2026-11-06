import { test } from "node:test";
import assert from "node:assert/strict";
import { practicalTutorials } from "../src/data/practical-tutorials";
import { academyGuides } from "../src/data/academy";

const get = (id: string) => {
  const tutorial = practicalTutorials.find((item) => item.id === id);
  assert.ok(tutorial);
  return tutorial;
};
const narrative = (id: string) => {
  const item = get(id);
  return [
    item.title,
    item.summary,
    item.warning,
    ...item.steps.flatMap((step) => [step.title, step.body]),
  ].join(" ");
};

test("praktické tréningy majú skutočné zdroje a otvorene neoverené živé stránky", () => {
  assert.equal(
    new Set(practicalTutorials.map((item) => item.id)).size,
    practicalTutorials.length,
  );
  for (const item of practicalTutorials) {
    assert.ok(academyGuides.some((guide) => guide.id === item.guideId));
    const url = new URL(item.sourceUrl!);
    assert.equal(url.protocol, "https:");
    assert.ok(["www.nhs.uk", "www.nps.gov"].includes(url.hostname));
    assert.equal(item.sourceVerifiedOnline, false);
    assert.ok(item.warning && item.warning.length > 40);
  }
});

test("CPR nerozširuje dospelý postup na deti a nepredstiera klinický metronóm", () => {
  const text = narrative("adult-cpr");
  assert.match(text, /Len pre dospelého/);
  assert.match(text, /Tento postup nie je návodom pre deti alebo dojčatá/);
  assert.match(text, /Ak dýcha normálne, hrudník nestláčajte/);
  assert.match(text, /100–120\/min/);
  assert.match(text, /5–6 cm/);
  assert.match(text, /hrudník úplne uvoľnite/);
  assert.match(text, /nie je metronóm/);
  assert.match(text, /Počas analýzy a výboja sa človeka nikto nedotýka/);
});

test("krvácanie zahŕňa pomoc a nezamieňa priamy tlak s vyťahovaním predmetu", () => {
  const text = narrative("bleeding");
  assert.match(text, /112\/155/);
  assert.match(text, /Zapichnutý predmet nevyťahujte a netlačte naň/);
  assert.match(text, /pevnom tlaku/);
  assert.match(text, /pôvodné nestrhávajte/);
  assert.match(text, /Neučí použitie škrtidla/);
});

test("prezentácia popálenia netrvá 20 minút a text preto musí uviesť skutočný čas aj rozsah", () => {
  const tutorial = get("burns"),
    text = narrative("burns");
  assert.ok(
    tutorial.steps.reduce((sum, step) => sum + step.durationMs, 0) <
      20 * 60 * 1000,
  );
  assert.match(text, /tečúcou vodou 20 minút/);
  assert.match(text, /Nepoužívajte ľad/);
  assert.match(text, /nič prilepené ku koži nestrhávajte/);
  assert.match(text, /Elektrické a chemické poranenia táto ukážka nerieši/);
  assert.match(text, /Zvyšok tela udržujte v teple/);
});

test("táborový oheň je podmienený povolením a končí úplným vychladnutím", () => {
  const text = narrative("campfire");
  assert.match(text, /Iba vonku na povolenom určenom ohnisku/);
  assert.match(
    text,
    /Pri suchu, silnom vetre alebo neistote oheň nezakladajte/,
  );
  assert.match(text, /Nikdy nie v stane, budove, garáži ani na rašeline/);
  assert.match(text, /nepoužívajte benzín, lieh ani iné urýchľovače/);
  assert.match(text, /Od ohňa neodchádzajte/);
  assert.match(text, /Odíďte až po úplnom vychladnutí/);
});
