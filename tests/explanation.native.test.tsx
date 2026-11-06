import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { AccessibilityInfo, Animated, AppState } from "react-native";
import { ExplanationCard } from "../src/components/explanation";
const initialState = AppState.currentState;
beforeEach(() => {
  AppState.currentState = "active";
});
afterEach(() => {
  jest.restoreAllMocks();
  AppState.currentState = initialState;
});
test("collapsed explanations allocate no playback; opening is paused and manual stages change the caption", async () => {
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
  const timing = jest
    .spyOn(Animated, "timing")
    .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });
  await render(<ExplanationCard topic="coverage" />);
  expect(screen.queryByRole("button", { name: "Prehrať" })).toBeNull();
  expect(timing).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole("button", { name: "Animácia" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Prehrať" }).props.accessibilityState
        .disabled,
    ).toBe(false),
  );
  expect(timing).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole("button", { name: "Ďalší krok" }));
  expect(
    screen.getByText("Počet osôb × denná potreba × počet dní = cieľ zásob."),
  ).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Prehrať" }));
  expect(timing).toHaveBeenCalledTimes(1);
  await fireEvent.press(screen.getByRole("button", { name: "Zavrieť" }));
  expect(screen.queryByRole("button", { name: "Pozastaviť" })).toBeNull();
});
test("reduced-motion explanations remain readable without starting motion", async () => {
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(true);
  await render(<ExplanationCard topic="backup" />);
  await fireEvent.press(screen.getByRole("button", { name: "Animácia" }));
  await waitFor(() => expect(screen.getByText("Statická ukážka")).toBeTruthy());
  expect(
    screen.getByRole("button", { name: "Prehrať" }).props.accessibilityState
      .disabled,
  ).toBe(true);
  await fireEvent.press(screen.getByRole("button", { name: "Ďalší krok" }));
  await fireEvent.press(screen.getByRole("button", { name: "Ďalší krok" }));
  expect(
    screen.getByText(
      "Záloha READY nie je šifrovaná. Chráňte ju ako osobné údaje.",
    ),
  ).toBeTruthy();
});
