import type { GlyphName } from "../components/tutorial-scene";
import {
  add,
  box,
  ellipsoid,
  rod,
  shadow,
  transform,
  type Face,
  type Vec3,
} from "./geometry";
export const colors = {
  skin: "#D7A581",
  hair: "#3D3433",
  helper: "#348F8B",
  clothes: "#55768A",
  trousers: "#344C64",
  shoes: "#293740",
  paper: "#FFF5DD",
  wood: "#B68D64",
  metal: "#AABAB9",
  water: "#78BDCF",
  orange: "#E4A05F",
  red: "#C26960",
};
export type Pose =
  | "stand"
  | "walk"
  | "carry"
  | "reach"
  | "kneel"
  | "examine"
  | "pressure"
  | "cpr"
  | "lying"
  | "crouch"
  | "cover"
  | "phone";
export function person(
  position: Vec3,
  pose: Pose = "stand",
  t = 0,
  yaw = 0,
  shirt = colors.helper,
  skin = colors.skin,
  scale = 1,
): Face[] {
  const f: Face[] = [];
  const limb = (a: Vec3, b: Vec3, r: number, color: string) =>
    f.push(...rod(a, b, r, color));
  if (pose === "lying") {
    f.push(
      ...ellipsoid([0, 0.23, -0.78], [0.15, 0.15, 0.19], skin),
      ...ellipsoid([0, 0.18, -0.22], [0.24, 0.14, 0.34], shirt),
      ...box([0, 0.14, 0.17], [0.34, 0.24, 0.23], colors.trousers),
    );
    for (const side of [-1, 1]) {
      limb(
        [side * 0.12, 0.16, 0.23],
        [side * 0.14, 0.14, 0.72],
        0.09,
        colors.trousers,
      );
      limb(
        [side * 0.14, 0.14, 0.72],
        [side * 0.15, 0.13, 1.15],
        0.075,
        colors.trousers,
      );
      f.push(...box([side * 0.15, 0.14, 1.2], [0.17, 0.2, 0.24], colors.shoes));
      limb([side * 0.23, 0.2, -0.43], [side * 0.4, 0.16, -0.14], 0.065, shirt);
      limb([side * 0.4, 0.16, -0.14], [side * 0.64, 0.16, -0.15], 0.055, skin);
      f.push(
        ...ellipsoid(
          [side * 0.65, 0.16, -0.15],
          [0.07, 0.045, 0.065],
          skin,
          6,
          3,
        ),
      );
    }
    // A neutral, uninjured training figure; no gore or diagnostic skin colours.
    return [
      ...shadow(position, 0.55 * scale, 1.3 * scale),
      ...transform(f, position, yaw, scale),
    ];
  }
  const kneeling = [
    "kneel",
    "examine",
    "pressure",
    "cpr",
    "cover",
    "crouch",
  ].includes(pose);
  const reach = ["reach", "carry", "examine", "pressure", "cpr"].includes(pose);
  const compression =
    pose === "cpr" ? Math.sin(t * Math.PI * 4) ** 2 * 0.045 : 0;
  const hip = kneeling ? 0.62 : 0.92,
    shoulder = kneeling ? 1.13 : 1.43;
  const lean =
    pose === "cover" || pose === "crouch"
      ? 0.36
      : pose === "cpr" || pose === "pressure" || pose === "examine"
        ? 0.22
        : 0.02;
  const headY = kneeling ? 1.35 - compression : 1.7;
  f.push(
    ...ellipsoid(
      [0, hip + 0.26 - compression, lean],
      [0.23, 0.32, 0.145],
      shirt,
    ),
    ...box([0, hip, 0], [0.32, 0.19, 0.22], colors.trousers),
  );
  f.push(
    ...ellipsoid([0, headY, lean + 0.02], [0.15, 0.185, 0.145], skin),
    ...ellipsoid(
      [0, headY + 0.105, lean - 0.017],
      [0.154, 0.103, 0.145],
      colors.hair,
      8,
      3,
    ),
  );
  // Nose, ears and eyes keep the direction of attention legible in an orbiting view.
  f.push(...box([0, headY - 0.005, lean + 0.164], [0.045, 0.055, 0.04], skin));
  for (const side of [-1, 1]) {
    f.push(
      ...box(
        [side * 0.058, headY + 0.02, lean + 0.144],
        [0.022, 0.024, 0.013],
        colors.hair,
      ),
    );
    const stride =
      pose === "walk" || pose === "carry"
        ? Math.sin(t * Math.PI * 4 + (side < 0 ? Math.PI : 0)) * 0.24
        : 0;
    const knee: Vec3 = kneeling
      ? [side * 0.15, 0.18, 0.3]
      : [side * 0.12, 0.49, stride * 0.55];
    const ankle: Vec3 = kneeling
      ? [side * 0.16, 0.075, -0.13]
      : [side * 0.13, 0.09, stride];
    limb([side * 0.11, hip, 0], knee, 0.085, colors.trousers);
    limb(knee, ankle, 0.072, colors.trousers);
    f.push(
      ...box(add(ankle, [0, -0.015, 0.05]), [0.17, 0.12, 0.27], colors.shoes),
    );
    const shoulderAt: Vec3 = [side * 0.215, shoulder - compression, lean];
    let hand: Vec3 = [side * 0.27, shoulder - 0.49, -0.02 - stride * 0.6];
    let elbow: Vec3 = [side * 0.29, shoulder - 0.24, -0.03 - stride * 0.4];
    if (reach) {
      hand = [
        side * (pose === "cpr" || pose === "pressure" ? 0.027 : 0.14),
        pose === "cpr" || pose === "pressure"
          ? 0.36 - compression
          : kneeling
            ? 0.59
            : 1.04,
        pose === "cpr" || pose === "pressure" ? 0.69 : 0.48 + t * 0.05,
      ];
      elbow = [
        (shoulderAt[0] + hand[0]) / 2,
        (shoulderAt[1] + hand[1]) / 2,
        (shoulderAt[2] + hand[2]) / 2,
      ];
    }
    if (pose === "cover") {
      hand = [side * 0.08, headY + 0.12, lean + 0.05];
      elbow = [side * 0.33, 1.04, lean + 0.27];
    }
    if (pose === "phone" && side === 1) {
      hand = [0.18, headY - 0.07, lean + 0.12];
      elbow = [0.35, shoulder - 0.18, 0.19];
    }
    limb(shoulderAt, elbow, 0.067, shirt);
    limb(elbow, hand, 0.052, skin);
    f.push(...ellipsoid(hand, [0.058, 0.052, 0.066], skin, 6, 3));
    if (pose === "phone" && side === 1)
      f.push(
        ...box(
          add(hand, [0.015, 0.015, 0.035]),
          [0.075, 0.15, 0.025],
          colors.shoes,
        ),
      );
  }
  return [
    ...shadow(position, 0.45 * scale, 0.48 * scale),
    ...transform(f, position, yaw, scale),
  ];
}
export function room(theme: "aurora" | "atlas", outdoor = false): Face[] {
  const floor = theme === "atlas" ? "#D9CDB4" : "#B9CBC5";
  const wall = theme === "atlas" ? "#F2E7D3" : "#D8E4DC";
  const f = [
    ...box([0, -0.12, 0], [5.3, 0.22, 3.8], outdoor ? "#B5C3A4" : floor),
  ];
  if (!outdoor) {
    f.push(
      ...box([0, 1.1, -1.84], [5.3, 2.2, 0.12], wall),
      ...box([-2.59, 0.65, -0.6], [0.12, 1.3, 2.5], wall),
    );
    // Cutaway wall, a lit window, baseboard and timber slats.
    f.push(
      ...box([1.34, 1.34, -1.76], [1.27, 1.14, 0.08], "#759FA5"),
      ...box([1.34, 1.35, -1.7], [1.1, 0.98, 0.025], "#B6D6DA"),
    );
    for (const x of [0.78, 1.34, 1.9])
      f.push(...box([x, 1.35, -1.66], [0.045, 1.07, 0.04], colors.paper));
    f.push(
      ...box([1.34, 1.35, -1.66], [1.14, 0.045, 0.04], colors.paper),
      ...box([0, 0.08, -1.73], [5.16, 0.12, 0.04], colors.wood),
    );
    for (let i = 0; i < 6; i++)
      f.push(
        ...box(
          [-0.5, 0.002, -0.95 + i * 0.5],
          [4.08, 0.005, 0.015],
          theme === "atlas" ? "#C8BAA0" : "#A8BDB7",
        ),
      );
  } else {
    for (const [x, z] of [
      [-2.1, -1.1],
      [1.9, -1.25],
    ]) {
      f.push(
        ...rod([x, 0, z], [x, 1.2, z], 0.085, colors.wood),
        ...ellipsoid([x, 1.5, z], [0.5, 0.68, 0.48], "#6B8E70", 6, 3),
      );
    }
    f.push(...box([0, 0.006, 0.75], [4.2, 0.01, 0.7], "#D6C8A8"));
  }
  return f.map((face) => ({ ...face, layer: -2 }));
}
export function table(position: Vec3): Face[] {
  const f = box([0, 0.88, 0], [1.45, 0.1, 0.72], colors.wood);
  for (const x of [-0.58, 0.58])
    for (const z of [-0.23, 0.23])
      f.push(...box([x, 0.43, z], [0.08, 0.85, 0.08], colors.wood));
  return transform(f, position);
}
/** Every glyph has local 3D geometry; familiar objects replace floating pictures. */
export function object(
  name: GlyphName,
  position: Vec3,
  scale = 1,
  yaw = 0,
): Face[] {
  const f: Face[] = [],
    b = (p: Vec3, s: Vec3, c: string) => f.push(...box(p, s, c)),
    e = (p: Vec3, s: Vec3, c: string) => f.push(...ellipsoid(p, s, c, 8, 3));
  switch (name) {
    case "bottle":
    case "jug":
      f.push(
        ...rod(
          [0, 0.08, 0],
          [0, 0.62, 0],
          name === "jug" ? 0.22 : 0.13,
          colors.water,
          8,
        ),
      );
      f.push(...rod([0, 0.62, 0], [0, 0.76, 0], 0.07, colors.paper, 8));
      b([0, 0.78, 0], [0.17, 0.06, 0.17], colors.helper);
      b([0, 0.36, 0.135], [0.22, 0.19, 0.01], colors.paper);
      break;
    case "bag":
      e([0, 0.42, 0], [0.32, 0.42, 0.18], colors.helper);
      b([0, 0.25, 0.18], [0.39, 0.27, 0.09], "#8AB9A6");
      f.push(
        ...rod([-0.14, 0.74, 0], [-0.14, 0.87, 0], 0.025, colors.trousers),
        ...rod([-0.14, 0.87, 0], [0.14, 0.87, 0], 0.025, colors.trousers),
        ...rod([0.14, 0.87, 0], [0.14, 0.74, 0], 0.025, colors.trousers),
      );
      for (const x of [-0.22, 0.22])
        b([x, 0.43, -0.19], [0.045, 0.56, 0.04], colors.trousers);
      break;
    case "food":
      b([-0.16, 0.24, 0], [0.32, 0.48, 0.25], colors.orange);
      b([-0.16, 0.42, 0.14], [0.22, 0.12, 0.01], colors.paper);
      f.push(
        ...rod([0.22, 0.03, 0.03], [0.22, 0.39, 0.03], 0.14, "#A3BE9B", 8),
      );
      b([0.22, 0.22, 0.18], [0.2, 0.15, 0.01], colors.paper);
      break;
    case "medicine":
      b([0, 0.22, 0], [0.65, 0.44, 0.28], colors.paper);
      b([0, 0.24, 0.15], [0.09, 0.24, 0.02], colors.red);
      b([0, 0.24, 0.15], [0.25, 0.08, 0.025], colors.red);
      b([0, 0.47, 0], [0.24, 0.06, 0.1], colors.red);
      break;
    case "radio":
      b([0, 0.23, 0], [0.6, 0.44, 0.22], colors.trousers);
      b([-0.13, 0.24, 0.12], [0.21, 0.26, 0.015], colors.metal);
      b([0.15, 0.31, 0.12], [0.17, 0.1, 0.02], colors.water);
      for (const y of [0.15, 0.21, 0.27, 0.33])
        b([-0.13, y, 0.137], [0.17, 0.016, 0.01], colors.trousers);
      f.push(...rod([0.23, 0.45, 0], [0.34, 0.91, 0], 0.013, colors.metal));
      break;
    case "phone":
    case "contact":
      b([0, 0.39, 0], [0.4, 0.76, 0.07], colors.shoes);
      b([0, 0.41, 0.043], [0.33, 0.57, 0.015], colors.water);
      e([0, 0.15, 0.055], [0.025, 0.025, 0.01], colors.paper);
      if (name === "contact") {
        e([0, 0.48, 0.065], [0.055, 0.065, 0.01], colors.paper);
        b([0, 0.34, 0.06], [0.17, 0.09, 0.015], colors.paper);
      }
      break;
    case "documents":
    case "plan":
    case "guidance":
    case "calendar":
    case "map":
      b([0, 0.34, 0], [0.58, 0.66, 0.045], colors.paper);
      b([0, 0.61, 0.028], [0.58, 0.09, 0.018], colors.helper);
      if (name === "calendar")
        for (const x of [-0.16, 0, 0.16])
          for (const y of [0.2, 0.34, 0.48])
            b([x, y, 0.03], [0.09, 0.07, 0.01], colors.orange);
      else if (name === "map") {
        f.push(
          ...rod([-0.2, 0.13, 0.03], [0.16, 0.5, 0.03], 0.016, colors.helper),
        );
        b([0.16, 0.5, 0.038], [0.08, 0.08, 0.018], colors.red);
      } else
        for (const y of [0.2, 0.3, 0.4, 0.5])
          b([0, y, 0.029], [0.39, 0.019, 0.012], colors.metal);
      break;
    case "calculator":
      b([0, 0.33, 0], [0.43, 0.65, 0.08], colors.trousers);
      b([0, 0.54, 0.05], [0.33, 0.14, 0.01], colors.water);
      for (const x of [-0.12, 0, 0.12])
        for (const y of [0.13, 0.25, 0.37])
          b([x, y, 0.05], [0.07, 0.06, 0.012], colors.paper);
      break;
    case "battery":
      b([0, 0.31, 0], [0.44, 0.58, 0.22], colors.trousers);
      b([0, 0.43, 0.12], [0.44, 0.16, 0.015], colors.orange);
      b([0, 0.64, 0], [0.15, 0.08, 0.12], colors.metal);
      break;
    case "torch":
    case "candle":
      f.push(
        ...rod(
          [0, 0.02, 0],
          [0, 0.5, 0],
          0.1,
          name === "torch" ? colors.trousers : colors.paper,
        ),
      );
      if (name === "torch") {
        f.push(...rod([0, 0.5, 0], [0, 0.63, 0], 0.15, colors.orange));
        b([0, 0.66, 0], [0.24, 0.02, 0.24], colors.paper);
      } else e([0, 0.61, 0], [0.04, 0.09, 0.04], colors.orange);
      break;
    case "house":
    case "door":
      b([-0.5, 0.8, 0], [0.12, 1.6, 0.8], colors.metal);
      b([0.5, 0.8, 0], [0.12, 1.6, 0.8], colors.metal);
      b([0, 1.6, 0], [1.12, 0.12, 0.8], colors.metal);
      b([0, 0.01, 0], [1.1, 0.04, 0.95], colors.wood);
      if (name === "house") {
        b([0, 1.24, -0.4], [1, 0.6, 0.1], colors.paper);
        b([0, 0.29, -0.4], [1, 0.56, 0.1], colors.paper);
      }
      break;
    case "fridge":
    case "storage":
      b(
        [0, 0.65, 0],
        [0.73, 1.3, 0.55],
        name === "fridge" ? colors.paper : colors.wood,
      );
      b([0, 0.88, 0.286], [0.68, 0.04, 0.02], colors.metal);
      b([0.25, 0.7, 0.31], [0.04, 0.21, 0.045], colors.trousers);
      if (name === "storage")
        for (const y of [0.25, 0.6, 0.95])
          b([0, y, 0.3], [0.66, 0.03, 0.03], colors.trousers);
      break;
    case "generator":
      b([0, 0.3, 0], [0.85, 0.5, 0.5], colors.orange);
      b([0, 0.3, 0.27], [0.48, 0.28, 0.025], colors.trousers);
      for (const x of [-0.34, 0.34]) {
        e([x, 0.1, 0.22], [0.1, 0.1, 0.07], colors.shoes);
        e([x, 0.1, -0.22], [0.1, 0.1, 0.07], colors.shoes);
      }
      break;
    case "flame":
      for (const [x, z] of [
        [-0.15, 0],
        [0.16, 0.02],
        [0, 0.1],
      ])
        e([x, 0.3, z], [0.13, 0.34, 0.13], colors.orange);
      for (const x of [-0.24, 0.24])
        f.push(...rod([x, 0.06, -0.25], [-x, 0.06, 0.25], 0.06, colors.wood));
      break;
    case "waves":
      b([0, 0.08, 0], [1.5, 0.16, 0.9], colors.water);
      for (const z of [-0.23, 0.1, 0.32])
        b([0, 0.17, z], [1.4, 0.025, 0.03], "#C9E9E7");
      break;
    case "sun":
      e([0, 0.6, 0], [0.27, 0.27, 0.14], colors.orange);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        f.push(
          ...rod(
            [Math.cos(a) * 0.34, 0.6 + Math.sin(a) * 0.34, 0],
            [Math.cos(a) * 0.43, 0.6 + Math.sin(a) * 0.43, 0],
            0.023,
            colors.orange,
          ),
        );
      }
      break;
    case "storm":
    case "snow":
      for (const x of [-0.18, 0, 0.18])
        e([x, 0.65, 0], [0.2, 0.15, 0.14], colors.metal);
      for (const x of [-0.2, 0, 0.2])
        f.push(
          ...rod(
            [x, 0.39, 0],
            [x - 0.04, 0.15, 0],
            0.022,
            name === "snow" ? colors.paper : colors.water,
          ),
        );
      break;
    case "shirt":
      b([0, 0.35, 0], [0.45, 0.57, 0.13], colors.orange);
      b([-0.3, 0.54, 0], [0.2, 0.22, 0.13], colors.orange);
      b([0.3, 0.54, 0], [0.2, 0.22, 0.13], colors.orange);
      break;
    case "hygiene":
      b([-0.14, 0.24, 0], [0.25, 0.48, 0.19], colors.paper);
      b([-0.14, 0.5, 0], [0.22, 0.06, 0.13], colors.helper);
      b([0.21, 0.13, 0.05], [0.3, 0.26, 0.26], colors.water);
      break;
    case "lock":
      b([0, 0.22, 0], [0.45, 0.4, 0.19], colors.orange);
      f.push(
        ...rod([-0.14, 0.4, 0], [-0.14, 0.61, 0], 0.035, colors.metal),
        ...rod([-0.14, 0.61, 0], [0.14, 0.61, 0], 0.035, colors.metal),
        ...rod([0.14, 0.61, 0], [0.14, 0.4, 0], 0.035, colors.metal),
      );
      break;
    case "pet":
      e([0, 0.24, 0], [0.28, 0.2, 0.14], "#B9946F");
      e([0.22, 0.43, 0.03], [0.13, 0.15, 0.12], "#B9946F");
      for (const x of [-0.17, 0.17])
        for (const z of [-0.09, 0.09])
          f.push(...rod([x, 0.22, z], [x, 0.03, z], 0.04, colors.wood));
      b([0.17, 0.58, 0.03], [0.05, 0.11, 0.07], colors.wood);
      b([0.29, 0.58, 0.03], [0.05, 0.11, 0.07], colors.wood);
      break;
    case "chemical":
      b([0, 0.3, 0], [0.55, 0.6, 0.4], colors.orange);
      b([0, 0.36, 0.21], [0.3, 0.26, 0.01], colors.paper);
      b([0, 0.37, 0.22], [0.06, 0.13, 0.01], colors.trousers);
      break;
    case "pin":
      f.push(...rod([0, 0.03, 0], [0, 0.48, 0], 0.024, colors.red));
      e([0, 0.56, 0], [0.14, 0.16, 0.08], colors.red);
      break;
    case "clock":
      e([0, 0.4, 0], [0.32, 0.32, 0.055], colors.paper);
      f.push(
        ...rod([0, 0.4, 0.07], [0, 0.61, 0.07], 0.016, colors.trousers),
        ...rod([0, 0.4, 0.07], [0.17, 0.32, 0.07], 0.016, colors.trousers),
      );
      break;
    case "person":
    case "crouch":
      return person(
        position,
        name === "crouch" ? "crouch" : "stand",
        0,
        yaw,
        colors.clothes,
        colors.skin,
        scale * 0.65,
      );
    default: {
      const exhaustive: never = name;
      throw new Error("Operácia sa nepodarila", { cause: exhaustive });
    }
  }
  return [
    ...shadow(position, 0.42 * scale, 0.28 * scale),
    ...transform(f, position, yaw, scale),
  ];
}
