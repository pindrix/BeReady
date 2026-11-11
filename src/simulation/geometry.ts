/** Small CPU 3D renderer: XYZ meshes, camera projection, diffuse lighting and depth sorting.
 * SVG is the final drawing surface; there are no network textures or native GL requirements.
 */
export type Vec3 = readonly [number, number, number];
export type Primitive = (
  | { kind: "box" | "sphere"; center: Vec3; size: Vec3; yaw: number }
  | { kind: "rod"; a: Vec3; b: Vec3; radius: number }
) & { part?: "head" | "head-lying" | "hand" | "torso" | "hair" | "flame" };
export type Face = {
  points: Vec3[];
  primitive?: Primitive;
  color: string;
  opacity?: number;
  unlit?: boolean;
  layer?: number;
};
export type ProjectedFace = {
  path: string;
  color: string;
  opacity: number;
  depth: number;
  layer: number;
};
export const add = (a: Vec3, b: Vec3): Vec3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];
export const sub = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
export const mul = (a: Vec3, n: number): Vec3 => [a[0] * n, a[1] * n, a[2] * n];
export const dot = (a: Vec3, b: Vec3) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const unit = (a: Vec3) => mul(a, 1 / (Math.hypot(...a) || 1));
export const mix = (a: Vec3, b: Vec3, t: number): Vec3 =>
  add(mul(a, 1 - t), mul(b, t));
export const clamp = (v: number, lo = 0, hi = 1) =>
  Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo));
export const ease = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};
export function rotate(p: Vec3, angle: number): Vec3 {
  return [
    p[0] * Math.cos(angle) + p[2] * Math.sin(angle),
    p[1],
    -p[0] * Math.sin(angle) + p[2] * Math.cos(angle),
  ];
}
export function transform(
  faces: Face[],
  position: Vec3,
  angle = 0,
  scale = 1,
): Face[] {
  const transformed = new Map<Primitive, Primitive>();
  const point = (p: Vec3) => add(rotate(mul(p, scale), angle), position);
  return faces.map((f) => {
    let primitive = f.primitive;
    if (primitive) {
      let copy = transformed.get(primitive);
      if (!copy) {
        copy =
          primitive.kind === "rod"
            ? {
                kind: "rod",
                a: point(primitive.a),
                b: point(primitive.b),
                radius: primitive.radius * scale,
              }
            : {
                ...primitive,
                center: point(primitive.center),
                size: mul(primitive.size, scale),
                yaw: primitive.yaw + angle,
              };
        transformed.set(primitive, copy);
      }
      primitive = copy;
    }
    return { ...f, points: f.points.map(point), primitive };
  });
}
export function box(center: Vec3, size: Vec3, color: string): Face[] {
  const primitive: Primitive = { kind: "box", center, size, yaw: 0 };
  const v: Vec3[] = [];
  for (const y of [-1, 1])
    for (const z of [-1, 1])
      for (const x of [-1, 1])
        v.push([
          center[0] + (x * size[0]) / 2,
          center[1] + (y * size[1]) / 2,
          center[2] + (z * size[2]) / 2,
        ]);
  return [
    [0, 2, 3, 1],
    [4, 5, 7, 6],
    [0, 1, 5, 4],
    [2, 6, 7, 3],
    [0, 4, 6, 2],
    [1, 3, 7, 5],
  ].map((ids) => ({
    primitive,
    points: ids
      .slice()
      .reverse()
      .map((i) => v[i]),
    color,
  }));
}
export function ellipsoid(
  center: Vec3,
  size: Vec3,
  color: string,
  segments = 8,
  rings = 4,
  part?: Primitive["part"],
): Face[] {
  const primitive: Primitive = { kind: "sphere", center, size, yaw: 0, part };
  const faces: Face[] = [];
  const at = (i: number, j: number): Vec3 => {
    const latitude = -Math.PI / 2 + (Math.PI * i) / rings,
      longitude = (2 * Math.PI * j) / segments;
    return [
      center[0] + Math.cos(latitude) * Math.cos(longitude) * size[0],
      center[1] + Math.sin(latitude) * size[1],
      center[2] + Math.cos(latitude) * Math.sin(longitude) * size[2],
    ];
  };
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < segments; j++)
      faces.push({
        primitive,
        points: [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)],
        color,
      });
  return faces;
}
export function rod(
  a: Vec3,
  b: Vec3,
  radius: number,
  color: string,
  segments = 6,
): Face[] {
  const axis = unit(sub(b, a));
  const u = unit(cross(axis, Math.abs(axis[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0])),
    v = cross(axis, u);
  const ring = (p: Vec3, j: number) =>
    add(
      p,
      add(
        mul(u, Math.cos((j * Math.PI * 2) / segments) * radius),
        mul(v, Math.sin((j * Math.PI * 2) / segments) * radius),
      ),
    );
  const faces: Face[] = [];
  for (let j = 0; j < segments; j++)
    faces.push({
      points: [ring(a, j), ring(a, j + 1), ring(b, j + 1), ring(b, j)],
      color,
    });
  faces.push(
    {
      points: Array.from({ length: segments }, (_, j) => ring(a, segments - j)),
      color,
    },
    { points: Array.from({ length: segments }, (_, j) => ring(b, j)), color },
  );
  const primitive: Primitive = { kind: "rod", a, b, radius };
  return faces.map((face) => ({ ...face, primitive }));
}
export function shadow(center: Vec3, x: number, z: number): Face[] {
  return [1, 0.8, 0.55].map((scale, i) => ({
    points: Array.from({ length: 16 }, (_, j): Vec3 => [
      center[0] + Math.cos((j * Math.PI) / 8) * x * scale,
      0.008 + i * 0.002,
      center[2] + Math.sin((j * Math.PI) / 8) * z * scale,
    ]),
    color: "#233840",
    opacity: 0.05 + i * 0.025,
    unlit: true,
  }));
}
export type Camera = {
  yaw: number;
  pitch: number;
  distance: number;
  target: Vec3;
  focal: number;
};
export const defaultCamera: Camera = {
  yaw: 0.62,
  pitch: 0.43,
  distance: 11,
  target: [0, 0.9, 0],
  focal: 740,
};
function shade(hex: string, light: number) {
  const value = Number.parseInt(hex.slice(1), 16);
  return (
    "#" +
    [16, 8, 0]
      .map((n) =>
        Math.round(clamp(((value >> n) & 255) * light, 0, 255))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export function project(
  faces: Face[],
  camera: Camera = defaultCamera,
): ProjectedFace[] {
  const eye: Vec3 = add(camera.target, [
    Math.sin(camera.yaw) * Math.cos(camera.pitch) * camera.distance,
    Math.sin(camera.pitch) * camera.distance,
    Math.cos(camera.yaw) * Math.cos(camera.pitch) * camera.distance,
  ]);
  const forward = unit(sub(camera.target, eye)),
    right = unit(cross(forward, [0, 1, 0])),
    up = cross(right, forward);
  const light = unit([-0.6, 1, 0.7]);
  const result: ProjectedFace[] = [];
  for (const f of faces) {
    if (f.points.length < 3) continue;
    let faceNormal = cross(
      sub(f.points[1], f.points[0]),
      sub(f.points[2], f.points[0]),
    );
    if (Math.hypot(...faceNormal) < 1e-8 && f.points.length > 3)
      faceNormal = cross(
        sub(f.points[2], f.points[0]),
        sub(f.points[3], f.points[0]),
      );
    const normal = unit(faceNormal);
    // Closed objects use back-face culling; the room is an intentional open cutaway.
    if (
      (f.layer ?? 0) === 0 &&
      !f.unlit &&
      dot(normal, sub(eye, f.points[0])) <= 0
    )
      continue;
    const intensity = f.unlit
      ? 1
      : 0.76 +
        0.25 * Math.max(0, dot(normal, light)) +
        0.04 * Math.max(0, -normal[1]);
    let depth = 0,
      visible = true;
    const points = f.points.map((p) => {
      const relative = sub(p, eye),
        d = dot(relative, forward);
      if (d < 0.15) visible = false;
      depth += d;
      return [
        300 + (dot(relative, right) * camera.focal) / d,
        178 - (dot(relative, up) * camera.focal) / d,
      ];
    });
    if (!visible) continue;
    result.push({
      path:
        points
          .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`)
          .join("") + "Z",
      color: shade(f.color, intensity),
      opacity: f.opacity ?? 1,
      depth: depth / points.length,
      layer: f.layer ?? 0,
    });
  }
  return result.sort((a, b) => a.layer - b.layer || b.depth - a.depth);
}
