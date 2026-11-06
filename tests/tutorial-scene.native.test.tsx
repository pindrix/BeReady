import { act, render, screen } from "@testing-library/react-native";
import { Animated } from "react-native";
import {
  TutorialScene,
  type TutorialSceneKind,
} from "../src/components/tutorial-scene";

const scenes: [TutorialSceneKind, number][] = [
  ["bag", 5],
  ["water", 5],
  ["power", 4],
  ["communication", 4],
];

test.each(scenes)(
  "%s renders every instructional stage and its completed frame",
  async (kind, count) => {
    const progress = new Animated.Value(0);
    const result = await render(
      <TutorialScene kind={kind} step={0} progress={progress} />,
    );
    const stages = new Set<string>();
    for (let step = 0; step < count; step++) {
      await act(async () => progress.setValue(0));
      await result.rerender(
        <TutorialScene kind={kind} step={step} progress={progress} />,
      );
      stages.add(JSON.stringify(result.toJSON()));
      await act(async () => progress.setValue(1));
      expect(result.toJSON()).toBeTruthy();
    }
    // A different drawing, rather than a shared pulsing illustration, for each task.
    expect(stages.size).toBe(count);
  },
);

test("the player can explain an animation without exposing decorative SVG parts", async () => {
  await render(
    <TutorialScene kind="bag" step={0} progress={new Animated.Value(0)} />,
  );
  expect(screen.queryByTestId("tutorial-scene")).toBeNull();
  const art = screen.getByTestId("tutorial-scene", {
    includeHiddenElements: true,
  });
  expect(art.props.accessibilityElementsHidden).toBe(true);
  expect(art.props.importantForAccessibility).toBe("no-hide-descendants");
});
