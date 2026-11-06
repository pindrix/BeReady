import { act, render } from "@testing-library/react-native";
import { Animated } from "react-native";
import { InstructionScene } from "../src/components/instruction-scene";
import { instructionalScenes } from "../src/data/instruction-scenes";
test.each(Object.entries(instructionalScenes))(
  "%s renders every mapped step in start and reduced-motion final frames",
  async (_id, steps) => {
    const progress = new Animated.Value(0),
      result = await render(
        <InstructionScene spec={steps[0]} progress={progress} />,
      );
    const drawings = new Set<string>();
    for (const spec of steps) {
      await act(async () => progress.setValue(0));
      await result.rerender(
        <InstructionScene spec={spec} progress={progress} />,
      );
      drawings.add(JSON.stringify(result.toJSON()));
      await act(async () => progress.setValue(1));
      expect(result.toJSON()).toBeTruthy();
    }
    expect(drawings.size).toBe(steps.length);
  },
);
