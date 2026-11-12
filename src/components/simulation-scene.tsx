import { Image } from "expo-image";
import { simulationPoster } from "../simulation/posters";
import { GpuScene } from "./gpu-scene";
import {
  graphicsFrame,
  type GraphicsMotion,
} from "../simulation/graphics-protocol";
import {
  Component,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Animated, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { buildScene, type Scene3D } from "../simulation/scenes";
import { clamp, defaultCamera, project } from "../simulation/geometry";
import { useTheme } from "../theme/theme";
import { LocalizedPressable as Pressable } from "./localized-native";
import { LocalizedText as Text } from "./localized-text";
import { IconButton } from "./visual";
function Geometry({
  scene,
  frame,
  yaw,
  zoom = 1,
}: {
  scene: Scene3D;
  frame: number;
  yaw: number;
  zoom?: number;
}) {
  const c = useTheme();
  const paths = useMemo(() => {
    const faces = project(buildScene(scene, frame, c.appearance), {
      ...defaultCamera,
      focal: 970 * zoom,
      target: ["adult-cpr", "bleeding"].includes(scene.kind)
        ? [0, 0.48, 0.1]
        : defaultCamera.target,
      pitch: ["adult-cpr", "bleeding"].includes(scene.kind)
        ? 0.6
        : defaultCamera.pitch,
      yaw,
    });
    // Consecutive equal materials share a path, preserving the painter's depth order.
    const batches: { path: string; color: string; opacity: number }[] = [];
    for (const face of faces) {
      const last = batches[batches.length - 1];
      if (last?.color === face.color && last.opacity === face.opacity)
        last.path += face.path;
      else
        batches.push({
          path: face.path,
          color: face.color,
          opacity: face.opacity,
        });
    }
    return batches;
  }, [scene, frame, yaw, zoom, c.appearance]);
  return (
    <Svg width="100%" height="100%" viewBox="0 0 600 360" accessible={false}>
      {paths.map((face, i) => (
        <Path
          key={i}
          d={face.path}
          fill={face.color}
          opacity={face.opacity}
          stroke={face.color}
          strokeWidth={0.32}
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
/** Static thumbnail: no Animated listener, clock, controller or automatic camera movement. */
export const SimulationPreview = memo(function SimulationPreview({
  scene,
}: {
  scene: Scene3D;
}) {
  const c = useTheme(),
    poster = simulationPoster(scene.id, c.appearance);
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        height: 135,
        backgroundColor: c.sceneBg,
        borderRadius: c.radius,
        overflow: "hidden",
      }}
    >
      {poster ? (
        <Image
          source={poster}
          contentFit="cover"
          style={{ width: "100%", height: "100%" }}
          accessible={false}
        />
      ) : (
        <Geometry scene={scene} frame={0.5} yaw={defaultCamera.yaw} />
      )}
    </View>
  );
});
function LiveSimulation({
  scene,
  progress,
  initialProgress,
  motion,
}: {
  scene: Scene3D;
  progress: Animated.Value;
  initialProgress: number;
  motion?: GraphicsMotion;
}) {
  const c = useTheme(),
    [frame, setFrame] = useState(() => clamp(initialProgress)),
    [yaw, setYaw] = useState(defaultCamera.yaw),
    [zoom, setZoom] = useState(
      ["adult-cpr", "bleeding"].includes(scene.kind) ? 1.4 : 1,
    );
  const seed = useRef(initialProgress);
  useEffect(() => {
    let lastTime = 0,
      lastValue = clamp(seed.current);
    const id = progress.addListener(({ value }) => {
      const next = clamp(value),
        now = Date.now();
      if (
        next === 0 ||
        next === 1 ||
        Math.abs(next - lastValue) > 0.12 ||
        now - lastTime >= 65
      ) {
        lastTime = now;
        lastValue = next;
        setFrame(next);
      }
    });
    return () => progress.removeListener(id);
    // The mount seed comes from the controller; subsequent frames belong to Animated.Value.
  }, [progress]);
  // GPU interpolation follows the controller snapshot, not bridge-throttled native samples.
  // This also makes pause/seek/reduced-motion exact even if a native listener update was skipped.
  const gpuFrame = motion ? clamp(initialProgress) : frame;
  const fallbackFrame = motion && !motion.playing ? gpuFrame : frame;
  const data = useMemo(
    () => graphicsFrame(scene, gpuFrame, yaw, zoom, c.appearance, motion),
    [scene, gpuFrame, yaw, zoom, c.appearance, motion],
  );

  return (
    <View
      testID={["simulation", scene.id, scene.step].join("-")}
      style={{ gap: 2 }}
    >
      <View
        testID="simulation-3d"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: "100%",
          aspectRatio: 1.25,
          backgroundColor: c.sceneBg,
          overflow: "hidden",
        }}
      >
        <GpuScene
          data={data}
          fallback={
            <Geometry
              scene={scene}
              frame={fallbackFrame}
              yaw={yaw}
              zoom={zoom}
            />
          }
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
          paddingVertical: 6,
          backgroundColor: c.sceneBg,
        }}
      >
        <IconButton
          name="remove-outline"
          label="Oddialiť"
          disabled={zoom <= 1}
          onPress={() => setZoom((x) => clamp(x - 0.2, 1, 1.8))}
        />
        <IconButton
          name="chevron-back-outline"
          label="Otočiť pohľad doľava"
          onPress={() => setYaw((x) => clamp(x - 0.25, -0.65, 1.8))}
        />
        <IconButton
          name="refresh-outline"
          label="Obnoviť pohľad"
          onPress={() => {
            setYaw(defaultCamera.yaw);
            setZoom(["adult-cpr", "bleeding"].includes(scene.kind) ? 1.4 : 1);
          }}
        />
        <IconButton
          name="chevron-forward-outline"
          label="Otočiť pohľad doprava"
          onPress={() => setYaw((x) => clamp(x + 0.25, -0.65, 1.8))}
        />
        <IconButton
          name="add-outline"
          label="Priblížiť"
          disabled={zoom >= 1.8}
          onPress={() => setZoom((x) => clamp(x + 0.2, 1, 1.8))}
        />
      </View>
    </View>
  );
}
/** A single failed drawing must leave the original instructional diagram available. */
class SimulationBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
/** Shared 3D / diagram viewer. Instructional captions and playback remain owned by its parent. */
export const SceneViewer = memo(function SceneViewer({
  scene,
  progress,
  phase = 0,
  motion,
  fallback,
}: {
  scene: Scene3D;
  progress: Animated.Value;
  phase?: number;
  motion?: GraphicsMotion;
  fallback: ReactNode;
}) {
  const c = useTheme(),
    [mode, setMode] = useState<"3D" | "2D">("3D");
  return (
    <View
      style={{
        gap: 6,
        borderRadius: c.radius,
        overflow: "hidden",
        backgroundColor: c.sceneBg,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          padding: 7,
          gap: 6,
          backgroundColor: c.card,
        }}
      >
        {(["3D", "2D"] as const).map((value) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={value}
            translateLabel={false}
            accessibilityState={{ checked: mode === value }}
            aria-checked={mode === value}
            onPress={() => setMode(value)}
            style={{
              minHeight: 44,
              minWidth: 56,
              paddingHorizontal: 14,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              backgroundColor: mode === value ? c.primary : c.card,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Text
              translate={false}
              style={{
                fontWeight: "800",
                color: mode === value ? c.onPrimary : c.text,
              }}
            >
              {value}
            </Text>
          </Pressable>
        ))}
      </View>
      {mode === "3D" ? (
        <SimulationBoundary fallback={fallback} onFailure={() => setMode("2D")}>
          <LiveSimulation
            key={scene.id}
            scene={scene}
            progress={progress}
            initialProgress={phase}
            motion={motion}
          />
        </SimulationBoundary>
      ) : (
        fallback
      )}
    </View>
  );
});
