import { act, render, screen, fireEvent } from "@testing-library/react-native";
import { Animated, Text } from "react-native";
import {
  SceneViewer,
  SimulationPreview,
} from "../src/components/simulation-scene";
import { tutorialScene3D, type Scene3D } from "../src/simulation/scenes";
import { animationTutorials } from "../src/data/tutorials";
import { explanations } from "../src/data/explanations";
const scene = tutorialScene3D(
  animationTutorials.find((t) => t.id === "adult-cpr")!,
  2,
);
afterEach(() => jest.restoreAllMocks());
function drawing(node: unknown): string {
  if (Array.isArray(node)) return node.map(drawing).join("|");
  if (!node || typeof node !== "object") return "";
  const item = node as { props?: { d?: string }; children?: unknown };
  return (item.props?.d ?? "") + drawing(item.children);
}
const image = (result: { toJSON: () => unknown }) => drawing(result.toJSON());
test("camera controls reproject the scene, reset the view, and never call playback or change captions", async () => {
  const progress = new Animated.Value(0),
    timing = jest.spyOn(Animated, "timing");
  const result = await render(
    <SceneViewer
      scene={scene}
      progress={progress}
      fallback={<Text>diagram</Text>}
    />,
  );
  const initial = image(result);
  await fireEvent.press(
    screen.getByRole("button", { name: "Otočiť pohľad doprava" }),
  );
  expect(image(result)).not.toBe(initial);
  await fireEvent.press(screen.getByRole("button", { name: "Obnoviť pohľad" }));
  expect(image(result)).toBe(initial);
  await fireEvent.press(screen.getByRole("button", { name: "Priblížiť" }));
  expect(image(result)).not.toBe(initial);
  expect(timing).not.toHaveBeenCalled();
});
test("the existing controller drives 3D; selecting 2D releases the listener and returning uses the supplied paused phase", async () => {
  const progress = new Animated.Value(0),
    remove = jest.spyOn(progress, "removeListener");
  const result = await render(
    <SceneViewer
      scene={scene}
      progress={progress}
      fallback={<Text>diagram</Text>}
    />,
  );
  const initial = image(result);
  await act(async () => progress.setValue(0.125));
  expect(image(result)).not.toBe(initial);
  await fireEvent.press(screen.getByRole("radio", { name: "2D" }));
  expect(screen.getByText("diagram")).toBeTruthy();
  expect(remove).toHaveBeenCalledTimes(1);
  await result.rerender(
    <SceneViewer
      scene={scene}
      phase={0.125}
      progress={progress}
      fallback={<Text>diagram</Text>}
    />,
  );
  await fireEvent.press(screen.getByRole("radio", { name: "3D" }));
  expect(image(result)).not.toBe(initial);
  await result.unmount();
  expect(remove).toHaveBeenCalledTimes(2);
});
test("collapsed 3D previews allocate no progress listener or animation", async () => {
  const listen = jest.spyOn(Animated.Value.prototype, "addListener"),
    timing = jest.spyOn(Animated, "timing");
  const preview: Scene3D = {
    id: "explanation-coverage",
    kind: "explanation",
    step: 0,
    spec: explanations.coverage.steps[0].scene,
  };
  await render(<SimulationPreview scene={preview} />);
  expect(listen).not.toHaveBeenCalled();
  expect(timing).not.toHaveBeenCalled();
});
test("a failed 3D drawing automatically exposes the original 2D fallback with its mode selected", async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  await render(
    <SceneViewer
      scene={{ id: "invalid", kind: "explanation", step: 0 }}
      progress={new Animated.Value(0)}
      fallback={<Text>diagram</Text>}
    />,
  );
  expect(screen.getByText("diagram")).toBeTruthy();
  expect(
    screen.getByRole("radio", { name: "2D" }).props.accessibilityState.checked,
  ).toBe(true);
});
