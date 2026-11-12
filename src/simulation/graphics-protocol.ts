import { clamp } from "./geometry";
import type { Scene3D } from "./scenes";
/** Authoritative playback state; renderer-local interpolation never advances to another step. */
export type GraphicsMotion = {
  playing: boolean;
  durationMs: number;
  /** Change on a transport discontinuity such as restart or seek, not camera movement. */
  revision?: number;
};
export type GraphicsFrame = {
  channel: "be-ready-graphics";
  type: "frame";
  scene: Scene3D;
  frame: number;
  yaw: number;
  zoom: number;
  appearance: "aurora" | "atlas";
  motion?: GraphicsMotion;
};
export function graphicsFrame(
  scene: Scene3D,
  frame: number,
  yaw: number,
  zoom: number,
  appearance: "aurora" | "atlas",
  motion?: GraphicsMotion,
): GraphicsFrame {
  return {
    channel: "be-ready-graphics",
    type: "frame",
    scene,
    frame: clamp(frame),
    yaw: clamp(yaw, -0.65, 1.8),
    zoom: clamp(zoom, 1, 1.8),
    appearance,
    ...(motion ? { motion: normalizeGraphicsMotion(motion) } : {}),
  };
}
/** Invalid timing data is static, never a divide-by-zero or an inferred autoplay. */
export function normalizeGraphicsMotion(
  motion?: GraphicsMotion,
): GraphicsMotion {
  const durationMs =
    Number.isFinite(motion?.durationMs) && (motion?.durationMs ?? 0) > 0
      ? motion!.durationMs
      : 0;
  const revision = motion?.revision;
  return {
    playing: durationMs > 0 && motion?.playing === true,
    durationMs,
    ...(Number.isSafeInteger(revision) && (revision ?? -1) >= 0
      ? { revision }
      : {}),
  };
}
export function graphicsEvent(
  raw: string,
): "ready" | "rendered" | "error" | null {
  if (raw.length > 512) return null;
  try {
    const value = JSON.parse(raw);
    return value?.channel === "be-ready-graphics" &&
      (value.type === "ready" ||
        value.type === "rendered" ||
        value.type === "error")
      ? value.type
      : null;
  } catch {
    return null;
  }
}
