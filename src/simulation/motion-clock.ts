import { clamp } from "./geometry";
import {
  normalizeGraphicsMotion,
  type GraphicsFrame,
} from "./graphics-protocol";

/**
 * Playback owned by the native controller, sampled smoothly on the renderer's clock.
 * This class owns no timer. The renderer requests RAF only while needsFrame() is true.
 * All times are renderer-local monotonic milliseconds (performance.now), never Date.now.
 */
export class MotionClock {
  private sceneKey = "";
  private revision: number | undefined;
  private anchoredPhase = 0;
  private anchoredAt = 0;
  private durationMs = 0;
  private running = false;
  private visible = true;
  private lastTime = 0;

  private time(nowMs: number) {
    if (Number.isFinite(nowMs)) this.lastTime = Math.max(this.lastTime, nowMs);
    return this.lastTime;
  }

  /** Current pose within this step. Reaching its end never changes scene or caption. */
  sample(nowMs: number): number {
    const now = this.time(nowMs);
    if (!this.running || !this.visible || this.durationMs <= 0)
      return this.anchoredPhase;
    const elapsed = Math.max(0, now - this.anchoredAt);
    // Compare before dividing so a valid tiny duration cannot overflow back to phase zero.
    if (elapsed >= (1 - this.anchoredPhase) * this.durationMs) return 1;
    return clamp(this.anchoredPhase + elapsed / this.durationMs);
  }

  /**
   * Apply a controller sample. Pause, revision, scene and rate changes are immediate.
   * Minor late samples during continuous playback cannot pull the model backwards.
   * A backward seek while continuing playback must carry a changed revision.
   */
  accept(packet: GraphicsFrame, nowMs: number): number {
    const now = this.time(nowMs);
    const predicted = this.sample(now);
    const motion = normalizeGraphicsMotion(packet.motion);
    const key = JSON.stringify([
      packet.scene.id,
      packet.scene.kind,
      packet.scene.step,
    ]);
    const requested = clamp(packet.frame);
    const wantsToRun = this.visible && motion.playing;
    const continuous =
      key === this.sceneKey &&
      motion.revision === this.revision &&
      this.durationMs === motion.durationMs &&
      this.running &&
      wantsToRun;
    this.anchoredPhase = continuous
      ? Math.max(predicted, requested)
      : requested;
    this.anchoredAt = now;
    this.durationMs = motion.durationMs;
    this.sceneKey = key;
    this.revision = motion.revision;
    this.running = wantsToRun;
    return this.anchoredPhase;
  }

  /** No RAF while paused, hidden, unsupported, or holding the final pose. */
  needsFrame(nowMs: number): boolean {
    return this.visible && this.running && this.sample(nowMs) < 1;
  }

  /**
   * Background freezes immediately; foreground waits for a fresh controller packet.
   * This prevents elapsed hidden time or a stale Playing packet from restarting motion.
   */
  setVisible(visible: boolean, nowMs: number): number {
    const now = this.time(nowMs);
    const phase = this.sample(now);
    if (this.visible !== visible) {
      this.anchoredPhase = phase;
      this.anchoredAt = now;
      this.running = false;
      this.visible = visible;
    }
    return phase;
  }

  /** Explicit teardown or context loss. Future packets may start a new session. */
  stop(nowMs: number): number {
    const now = this.time(nowMs);
    this.anchoredPhase = this.sample(now);
    this.anchoredAt = now;
    this.running = false;
    return this.anchoredPhase;
  }
}
