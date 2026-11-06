import { act, render, screen } from "@testing-library/react-native";
import { Animated } from "react-native";
import { CivilScene, type CivilSceneKind } from "../src/components/civil-scene";
const scenes: [CivilSceneKind, number][] = [
  ["armed-conflict", 5],
  ["nuclear-explosion", 6],
];
test.each(scenes)(
  "%s has a distinct local drawing for every source step",
  async (kind, count) => {
    const progress = new Animated.Value(0);
    const result = await render(
      <CivilScene kind={kind} step={0} progress={progress} />,
    );
    const drawings = new Set<string>();
    for (let step = 0; step < count; step++) {
      await act(async () => progress.setValue(0));
      await result.rerender(
        <CivilScene kind={kind} step={step} progress={progress} />,
      );
      drawings.add(JSON.stringify(result.toJSON()));
      await act(async () => progress.setValue(1));
      expect(result.toJSON()).toBeTruthy();
    }
    expect(drawings.size).toBe(count);
    expect(screen.queryByTestId("civil-scene")).toBeNull();
    expect(
      screen.getByTestId("civil-scene", { includeHiddenElements: true }).props
        .accessibilityElementsHidden,
    ).toBe(true);
  },
);
