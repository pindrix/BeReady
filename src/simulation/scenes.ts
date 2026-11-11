import type { Tutorial, TutorialKind } from "../data/tutorials";
import type { DiagramStep } from "../data/instruction-scenes";
import { instructionalScenes } from "../data/instruction-scenes";
import type { GlyphName } from "../components/tutorial-scene";
import {
  box,
  clamp,
  ease,
  ellipsoid,
  mix,
  rod,
  type Face,
  type Vec3,
} from "./geometry";
import { colors, object, person, room, table, type Pose } from "./world";
export type Scene3D = {
  id: string;
  kind: TutorialKind | "explanation";
  step: number;
  spec?: DiagramStep;
};
export function tutorialScene3D(tutorial: Tutorial, step: number): Scene3D {
  const index = Math.floor(clamp(step, 0, tutorial.steps.length - 1));
  return {
    id: tutorial.id,
    kind: tutorial.kind,
    step: index,
    spec:
      tutorial.kind === "instructional"
        ? instructionalScenes[tutorial.guideId]?.[index]
        : undefined,
  };
}
const packItems: GlyphName[][] = [
  ["documents", "medicine"],
  ["bottle", "food"],
  ["torch", "radio"],
  ["shirt", "hygiene"],
  ["bag", "plan"],
];
const waterItems: GlyphName[][] = [
  ["bottle", "guidance"],
  ["jug", "documents"],
  ["storage", "bottle"],
  ["calendar", "bottle"],
  ["radio", "guidance"],
];
const powerItems: GlyphName[][] = [
  ["torch", "battery"],
  ["fridge", "clock"],
  ["generator", "house"],
  ["phone", "radio"],
];
const contactItems: GlyphName[][] = [
  ["contact", "documents"],
  ["map", "pin"],
  ["phone", "contact"],
  ["plan", "bag"],
];
function deskScene(
  items: GlyphName[],
  t: number,
  variant: number,
  theme: "aurora" | "atlas",
  packing = false,
): Face[] {
  const carrying = packing && variant < 4;
  const actor: Vec3 = carrying
    ? mix([-0.6, 0, 0.35], [0.2, 0, 0.6], ease(t))
    : [-0.5, 0, 0.03];
  const f = [
    ...room(theme),
    ...table([0.65, 0, 0.05]),
    ...person(
      actor,
      variant === 4 ? "stand" : carrying ? "carry" : "reach",
      t,
      carrying ? 1.9 : Math.PI / 2,
    ),
  ];
  if (carrying) {
    const hand = mix([-0.15, 1.04, 0.2], [0.65, 1.04, 0.45], ease(t));
    const p =
      t < 0.8 ? hand : mix(hand, [0.85, 1.1, 0.3], ease((t - 0.8) / 0.2));
    f.push(
      ...object(items[0], p, 0.52).map((face) => ({
        ...face,
        opacity: t > 0.85 ? clamp((1 - t) / 0.15) : 1,
      })),
      ...object(items[1], [0.35, 0.94, -0.12], 0.53),
    );
    f.push(...object("bag", [0.93, 0.94, 0.11], 0.75));
  } else {
    items.forEach((item, i) =>
      f.push(
        ...object(
          item,
          [0.16 + i * 0.52, 0.94, 0.1 + (i === 0 ? ease(t) * 0.1 : 0)],
          0.64,
          -0.12,
        ),
      ),
    );
    f.push(...object("bag", [1.5, 0, 0.75], 0.82, 0.1));
  }
  return f;
}
function medical(scene: Scene3D, t: number, theme: "aurora" | "atlas"): Face[] {
  const f = room(theme),
    step = scene.step;
  if (scene.kind === "burns") {
    f.push(
      ...box([0.7, 0.83, -0.12], [1.25, 0.12, 0.74], colors.metal),
      ...box([0.7, 0.4, -0.27], [1.15, 0.8, 0.45], colors.paper),
    );
    // Basin, faucet and forearm; water appears only in the cooling step.
    f.push(
      ...box([0.65, 0.9, -0.1], [0.7, 0.055, 0.42], colors.trousers),
      ...box([0.65, 0.94, -0.1], [0.55, 0.025, 0.3], colors.water),
    );
    f.push(
      ...rod([0.82, 0.94, -0.38], [0.82, 1.25, -0.38], 0.025, colors.metal),
      ...rod([0.82, 1.25, -0.38], [0.82, 1.25, -0.08], 0.025, colors.metal),
    );
    f.push(...person([-0.45, 0, 0.15], step === 3 ? "phone" : "reach", t, 1.1));
    if (step === 1) {
      // The illustrative stream is not a 20-minute timer.
      for (let i = 0; i < 3; i++)
        f.push(
          ...rod(
            [0.82 + i * 0.018, 1.24, -0.08],
            [0.8 + i * 0.018, 0.96, -0.08],
            0.014,
            colors.water,
          ),
        );
      f.push(
        ...rod([0.45, 1.03, 0.06], [0.85, 1.03, -0.04], 0.055, colors.skin),
      );
    }
    if (step === 0) f.push(...object("flame", [1.9, 0.95, -0.3], 0.38));
    if (step === 2)
      f.push(
        ...box([0.23, 1.04, 0.25], [0.36, 0.04, 0.19], colors.paper),
        ...object("shirt", [1.58, 0.94, -0.1], 0.45),
      );
    if (step === 3) f.push(...object("medicine", [0.85, 0.95, 0.12], 0.6));
    return f;
  }
  const bleeding = scene.kind === "bleeding";
  f.push(
    ...box(
      [0, 0.017, 0.15],
      [1.85, 0.025, 2.8],
      theme === "atlas" ? "#C5C4AA" : "#A0B8B8",
    ).map((face) => ({ ...face, layer: -1 })),
  );
  f.push(...person([0.25, 0, 0.2], "lying", 0, 0, colors.clothes));
  let pose: Pose = "examine";
  if ((step === 1 && !bleeding) || (step === 0 && bleeding)) pose = "phone";
  if (!bleeding && (step === 2 || step === 3)) pose = "cpr";
  if (bleeding && (step === 1 || step === 2)) pose = "pressure";
  if (!bleeding && step === 4) pose = "stand";
  const at: Vec3 = bleeding ? [-1.03, 0, 0.04] : [-0.45, 0, 0.05];
  f.push(...person(at, pose, t, Math.PI / 2));
  if (bleeding && step > 0) {
    f.push(
      ...box(
        [-0.38, 0.25, 0.04],
        [0.19, step === 2 ? 0.07 : 0.04, 0.16],
        colors.paper,
      ),
    );
    if (step === 3)
      f.push(...box([0.25, 0.34, 0.57], [0.59, 0.035, 1.05], "#A5B5CB"));
  }
  if (step === 4 && !bleeding) {
    // AED on the ground, rescuer visibly clear of the person. Text carries pad placement.
    f.push(
      ...object("medicine", [1.23, 0, 0.45], 0.85),
      ...rod([1.1, 0.1, 0.42], [0.6, 0.12, -0.15], 0.012, colors.trousers),
    );
  }
  f.push(...object("phone", [1.1, 0.02, -0.8], 0.5));
  return f;
}
function campfire(step: number, t: number, theme: "aurora" | "atlas"): Face[] {
  const f = room(theme, true),
    fireAt: Vec3 = [0.65, 0, 0.1];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    f.push(
      ...ellipsoid(
        [fireAt[0] + Math.cos(a) * 0.45, 0.08, fireAt[2] + Math.sin(a) * 0.4],
        [0.14, 0.09, 0.12],
        colors.metal,
        6,
        3,
      ),
    );
  }
  for (const side of [-1, 1])
    f.push(
      ...rod(
        [0.4, 0.08, -0.12 * side],
        [0.9, 0.08, 0.28 * side],
        0.07,
        colors.wood,
      ),
    );
  f.push(...object("jug", [-1.7, 0, 0.48], 0.8));
  const active = step >= 2 && step < 4;
  if (active)
    f.push(
      ...object(
        "flame",
        [0.65, 0.04, 0.1],
        0.65 + Math.sin(t * Math.PI * 4) * 0.045,
      ),
    );
  f.push(
    ...person(
      [step === 2 ? -0.52 : -1, 0, 0.36],
      step === 0
        ? "phone"
        : step === 2
          ? "kneel"
          : step === 4
            ? "reach"
            : "stand",
      t,
      1.35,
    ),
  );
  if (step === 0) f.push(...object("guidance", [0.1, 0.05, -0.8], 0.75));
  if (step === 1) f.push(...object("jug", [1.5, 0, 0.5], 0.75));
  if (step === 2)
    f.push(...rod([0.1, 0.58, 0.27], [0.54, 0.19, 0.13], 0.012, colors.wood));
  if (step === 3)
    f.push(
      ...person(
        [-1.9, 0, -0.3],
        "stand",
        0,
        0.8,
        colors.orange,
        colors.skin,
        0.68,
      ),
    );
  if (step === 4) {
    f.push(...object("jug", [-0.15, 0.74, 0.35], 0.7, 1.2));
    f.push(...rod([0.03, 0.87, 0.24], [0.55, 0.13, 0.1], 0.035, colors.water));
    f.push(...rod([0.21, 0.12, 0.53], [0.95, 0.1, -0.16], 0.025, colors.wood));
    // No automatic "cool/safe" transition: the caption requires complete cooling.
    f.push(...box([0.65, 0.025, 0.1], [0.6, 0.02, 0.5], "#586461"));
  }
  return f;
}
function civil(scene: Scene3D, t: number, theme: "aurora" | "atlas"): Face[] {
  const nuclear = scene.kind === "nuclear-explosion",
    step = scene.step;
  if (nuclear && step === 0) {
    const f = room(theme, true);
    f.push(
      ...box([0.4, 0.45, 0.1], [1.55, 0.9, 0.28], colors.metal),
      ...person([0.1, 0, 0.65], "cover", t, Math.PI),
    );
    // Distant light is static: no strobe, explosion clock or visible fallout boundary.
    f.push(...object("sun", [-1.65, 1.8, -1.25], 0.8));
    return f;
  }
  if (!nuclear && step === 0)
    return deskScene(["plan", "medicine", "bottle"], t, 0, theme);
  const f = room(theme);
  if (nuclear && step === 1) {
    f.push(...object("door", [1.65, 0, 0.5], 1.15));
    f.push(
      ...person(mix([1.65, 0, 1.5], [0.15, 0, 0.2], ease(t)), "walk", t, -0.7),
    );
  } else if (nuclear && step === 2) {
    f.push(
      ...box(
        [1.34, 1.35, -1.57],
        [1.4, 1.3, 0.1],
        theme === "atlas" ? "#F2E7D3" : "#D8E4DC",
      ),
    );
    for (let i = 0; i < 4; i++)
      f.push(
        ...box(
          [1.7, i * 0.22, 0.9 - i * 0.35],
          [0.9, 0.15, 0.36],
          colors.metal,
        ),
      );
    f.push(
      ...person([-0.85, 0, -0.2], "kneel", 0, 0.6),
      ...object("radio", [-0.15, 0, -0.7], 0.72),
    );
  } else if (nuclear && step === 3) {
    f.push(
      ...person([-0.7, 0, 0.2], "reach", t, 1.1),
      ...object("hygiene", [0.1, 0.85, 0.1], 0.7),
      ...table([0.65, 0, 0.05]),
    );
    f.push(
      ...object("shirt", [1.58, 0, 0.65], 0.65),
      ...object("bag", [1.9, 0, 0.7], 0.6),
    );
  } else if ((nuclear && step === 4) || (!nuclear && step === 4)) {
    f.push(
      ...person([-0.65, 0, 0.25], "stand", 0, 1),
      ...table([0.7, 0, 0.1]),
      ...object("radio", [0.6, 0.94, 0.1], 0.9),
      ...object("guidance", [1.4, 0.94, 0], 0.62),
    );
  } else if (nuclear && step === 5) {
    f.push(
      ...table([0.45, 0, 0.1]),
      ...person([-0.9, 0, 0.25], "reach", t, 1.1),
    );
    for (const [i, name] of (
      ["bottle", "food", "medicine"] as GlyphName[]
    ).entries())
      f.push(...object(name, [0.05 + i * 0.53, 0.94, 0.12], 0.65));
  } else if (!nuclear && step === 1) {
    f.push(
      ...box([0.9, 0.58, 0.3], [0.22, 1.16, 1.45], colors.metal),
      ...person([-0.65, 0, -0.15], "crouch", t, 0.5),
      ...object("bag", [-1.4, 0, 0.45], 0.7),
    );
  } else if (!nuclear && step === 2) {
    f.push(
      ...object("guidance", [-1.65, 0.05, -0.6], 0.9),
      ...object("door", [1.65, 0, 0.2], 1.1),
    );
    f.push(
      ...person(mix([-0.85, 0, 0.3], [0.85, 0, 0.5], ease(t)), "walk", t, 1.2),
      ...object("bag", [0.3, 0, -0.7], 0.8),
    );
  } else if (!nuclear && step === 3) {
    f.push(
      ...person(mix([-0.8, 0, 0.5], [-1.55, 0, 0.5], ease(t)), "walk", t, -1.6),
    );
    f.push(
      ...box([1.3, 0.12, 0.25], [0.45, 0.24, 0.3], colors.metal),
      ...box([0.65, 0.2, 0.2], [0.08, 0.4, 1.4], colors.orange),
    );
    f.push(...object("guidance", [0.6, 0.6, 0.35], 0.48));
  }
  return f;
}
/** Existing semantic stage mapping remains the single source of action/target identity. */
function diagram(scene: Scene3D, t: number, theme: "aurora" | "atlas"): Face[] {
  const spec = scene.spec;
  if (!spec) throw new Error("Operácia sa nepodarila");
  const outdoors =
    ["flood", "hiking", "heat"].includes(scene.id) && spec.mode !== "shelter";
  const f = room(theme, outdoors),
    move = ease(t);
  const isPerson = (g: GlyphName) => g === "person" || g === "crouch";
  if (spec.mode === "shelter") {
    const hazard = spec.detail;
    if (hazard && !isPerson(hazard))
      f.push(...object(hazard, [1.75, 0.1, 1.3], 0.75));
    f.push(...object("door", [1.4, 0, 0.7], 1.15));
    f.push(
      ...person(
        mix([0.9, 0, 0.9], [-0.6, 0, -0.15], move),
        spec.left === "crouch" ? "crouch" : "walk",
        t,
        -1,
      ),
    );
    f.push(
      ...object(
        spec.right === "house" ? "radio" : spec.right,
        [-1.5, 0.03, -0.7],
        0.65,
      ),
    );
  } else if (spec.mode === "avoid") {
    f.push(
      ...person(mix([-0.65, 0, 0.45], [-1.35, 0, 0.55], move), "walk", t, -1.5),
    );
    f.push(...object(spec.right, [1.1, 0, 0.15], 1));
    f.push(...box([0.35, 0.1, 0.45], [0.055, 0.2, 1.4], colors.orange));
    if (!isPerson(spec.left))
      f.push(...object(spec.left, [-1.35, 0.9, 0.7], 0.55));
    if (spec.detail && !isPerson(spec.detail))
      f.push(...object(spec.detail, [1.3, 0.05, -0.9], 0.6));
  } else {
    const items = [
      spec.left,
      spec.right,
      ...(spec.detail ? [spec.detail] : []),
    ];
    const large = (g: GlyphName) =>
      ["house", "door", "fridge", "generator", "storage"].includes(g);
    f.push(
      ...person(
        [-0.95, 0, 0.35],
        spec.mode === "move" ? "reach" : "stand",
        t,
        1.15,
      ),
    );
    f.push(...table([items.some(large) ? 0.1 : 0.65, 0, 0.05]));
    items.forEach((item, i) => {
      if (isPerson(item)) {
        if (i > 0)
          f.push(
            ...person(
              [1.5, 0, -0.15],
              "stand",
              0,
              -0.8,
              colors.orange,
              colors.skin,
              0.85,
            ),
          );
      } else {
        const p: Vec3 = large(item)
          ? [1.8, 0, -0.4]
          : [
              0.25 + i * 0.53,
              0.94,
              0.1 + (i === 0 && spec.mode === "move" ? move * 0.2 : 0),
            ];
        f.push(...object(item, p, large(item) ? 0.9 : 0.65, -0.1));
      }
    });
  }
  return f;
}
/** Pure, deterministic world state. Progress is illustrative, never real-world elapsed time. */
export function buildScene(
  scene: Scene3D,
  progress: number,
  theme: "aurora" | "atlas" = "aurora",
): Face[] {
  const t = clamp(progress);
  if (scene.kind === "instructional" || scene.kind === "explanation")
    return diagram(scene, t, theme);
  if (["adult-cpr", "bleeding", "burns"].includes(scene.kind))
    return medical(scene, t, theme);
  if (scene.kind === "campfire") return campfire(scene.step, t, theme);
  if (scene.kind === "armed-conflict" || scene.kind === "nuclear-explosion")
    return civil(scene, t, theme);
  const sequences =
    scene.kind === "bag"
      ? packItems
      : scene.kind === "water"
        ? waterItems
        : scene.kind === "power"
          ? powerItems
          : contactItems;
  const items = sequences[scene.step];
  if (!items) throw new Error("Operácia sa nepodarila");
  if (scene.kind === "power" && scene.step === 2) {
    // Forbidden indoor combustion: equipment stays outside, never shown operating indoors.
    return [
      ...room(theme, true),
      ...person([-1.25, 0, 0.45], "stand", 0, 1),
      ...object("house", [-0.85, 0, -0.8], 0.7),
      ...object("generator", [1.6, 0, 0.1], 0.8),
      ...box([0.3, 0.16, 0.3], [0.06, 0.32, 1.5], colors.orange),
    ];
  }
  if (scene.kind === "water" && scene.step === 2) {
    return [
      ...room(theme),
      ...object("storage", [0.7, 0, -0.5], 1.05),
      ...object("bottle", [0.67, 0.3, -0.17], 0.66),
      ...object("bottle", [0.67, 0.78, -0.17], 0.66),
      ...person([-0.85, 0, 0.2], "stand", 0, 1.1),
    ];
  }
  return deskScene(items, t, scene.step, theme, scene.kind === "bag");
}
