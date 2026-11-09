import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { Text } from "react-native";
import { router } from "expo-router";
import { AppearancePicker } from "../src/components/appearance-picker";
import { HomeScene } from "../src/components/home-scene";
import { setAppearance, getAppearance } from "../src/state/appearance";
import { useTheme } from "../src/theme/theme";
function ThemeSample() {
  const c = useTheme();
  return <Text>{c.dark ? "night" : "day"}</Text>;
}
beforeEach(async () => {
  await setAppearance("aurora");
  jest.clearAllMocks();
});
test("both design directions can be selected and update the visible theme immediately", async () => {
  await render(
    <>
      <AppearancePicker />
      <ThemeSample />
    </>,
  );
  expect(screen.getByText("night")).toBeTruthy();
  await fireEvent.press(screen.getByRole("radio", { name: "Field Atlas" }));
  await waitFor(() => expect(screen.getByText("day")).toBeTruthy());
  expect(getAppearance()).toBe("atlas");
  expect(
    screen.getByRole("radio", { name: "Field Atlas" }).props.accessibilityState
      .checked,
  ).toBe(true);
  await fireEvent.press(screen.getByRole("radio", { name: "Aurora Command" }));
  await waitFor(() => expect(screen.getByText("night")).toBeTruthy());
});
test("house hotspots navigate to the real water, food and family workflows", async () => {
  await render(<HomeScene />);
  await fireEvent.press(screen.getByTestId("house-zone-water"));
  expect(router.push).toHaveBeenLastCalledWith({
    pathname: "/inventory",
    params: { category: "voda" },
  });
  await fireEvent.press(screen.getByTestId("house-zone-food"));
  expect(router.push).toHaveBeenLastCalledWith({
    pathname: "/inventory",
    params: { category: "jedlo" },
  });
  await fireEvent.press(screen.getByTestId("house-zone-family"));
  expect(router.push).toHaveBeenLastCalledWith({ pathname: "/plan" });
});
