import { clamp } from "./geometry";
import type { Scene3D } from "./scenes";
export type GraphicsFrame = {
  channel: "be-ready-graphics";
  type: "frame";
  scene: Scene3D;
  frame: number;
  yaw: number;
  zoom: number;
  appearance: "aurora" | "atlas";
};
export function graphicsFrame(
  scene: Scene3D,
  frame: number,
  yaw: number,
  zoom: number,
  appearance: "aurora" | "atlas",
): GraphicsFrame {
  return {
    channel: "be-ready-graphics",
    type: "frame",
    scene,
    frame: clamp(frame),
    yaw: clamp(yaw, -0.65, 1.8),
    zoom: clamp(zoom, 1, 1.8),
    appearance,
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
