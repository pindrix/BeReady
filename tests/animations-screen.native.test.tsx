import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { AccessibilityInfo, Animated, AppState } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animations from "../src/app/animations";
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn(),
}));
/* eslint-disable @typescript-eslint/no-require-imports -- Hoisted factories load mock views independently. */
jest.mock("../src/components/tutorial-scene", () => ({
  TutorialScene: ({ kind, step }: { kind: string; step: number }) =>
    require("react").createElement(require("react-native").View, {
      testID: `scene-${kind}-${step}`,
    }),
}));
jest.mock("../src/components/practical-scene", () => ({
  PracticalScene: ({ kind, step }: { kind: string; step: number }) =>
    require("react").createElement(require("react-native").View, {
      testID: `scene-${kind}-${step}`,
    }),
}));
const params = jest.mocked(useLocalSearchParams),
  initial = AppState.currentState;
beforeEach(() => {
  AppState.currentState = "active";
  params.mockReturnValue({ id: "water-storage" });
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
  jest
    .spyOn(Animated, "timing")
    .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });
});
afterEach(() => {
  jest.restoreAllMocks();
  AppState.currentState = initial;
});
test("prehrávač začína pozastavený a prepína skutočný krok aj ovládanie pauzy", async () => {
  await render(<Animations />);
  expect(screen.getByTestId("scene-water-0")).toBeTruthy();
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Prehrať" }).props.accessibilityState
        .disabled,
    ).toBe(false),
  );
  await fireEvent.press(screen.getByRole("button", { name: "Prehrať" }));
  expect(screen.getByRole("button", { name: "Pozastaviť" })).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Pozastaviť" }));
  expect(screen.getByRole("button", { name: "Prehrať" })).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Ďalší krok" }));
  expect(screen.getByTestId("scene-water-1")).toBeTruthy();
  expect(screen.getAllByText("Vyberte správne nádoby")).toHaveLength(2);
});
test("režim obmedzeného pohybu zablokuje prehrávanie a ponechá ručný postup", async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  await render(<Animations />);
  await waitFor(() => expect(screen.getByText("Statická ukážka")).toBeTruthy());
  expect(
    screen.getByRole("button", { name: "Prehrať" }).props.accessibilityState
      .disabled,
  ).toBe(true);
  await fireEvent.press(screen.getByRole("button", { name: "Ďalší krok" }));
  expect(screen.getByTestId("scene-water-1")).toBeTruthy();
});
test("CPR má trvalo zobrazené vekové a časové upozornenie; zdroj nepredstiera živé overenie", async () => {
  params.mockReturnValue({ id: "adult-cpr" });
  await render(<Animations />);
  expect(screen.getByText(/Tento postup nie je návodom pre deti/)).toBeTruthy();
  expect(
    screen.getByText("Čas patrí animácii, nie trvaniu ošetrenia."),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Potrebujem pomoc teraz" }),
  ).toBeTruthy();
  expect(screen.getByText(/Aktuálnosť externého zdroja nebola/)).toBeTruthy();
});
test("neznámy postup nepredstiera existujúce video", async () => {
  params.mockReturnValue({ id: "missing" });
  await render(<Animations />);
  expect(screen.getByText("Postup sa nenašiel")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Prehrať" })).toBeNull();
});
