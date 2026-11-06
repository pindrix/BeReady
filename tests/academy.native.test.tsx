import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { Linking, AppState, Animated, AccessibilityInfo } from "react-native";
import { useLocalSearchParams } from "expo-router";
import GuideScreen from "../src/app/guide";
import VideosScreen from "../src/app/videos";
import { useStore } from "../src/state/store";
import { defaultHousehold } from "../src/types/model";
jest.mock("../src/state/store", () => ({ useStore: jest.fn() }));
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useFocusEffect: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));
const mockStore = jest.mocked(useStore),
  mockParams = jest.mocked(useLocalSearchParams);
beforeEach(() => {
  jest.clearAllMocks();
  mockParams.mockReturnValue({ id: "water-storage" });
  mockStore.mockReturnValue({
    data: {
      household: defaultHousehold,
      inventory: [],
      shopping: [],
      checklists: [],
      contacts: [],
      safePlaces: [],
    },
    error: "",
    busy: false,
    reload: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn(),
    profile: jest.fn(),
    restore: jest.fn(),
    addShopping: jest.fn(),
    clearError: jest.fn(),
  });
});
test("ilustrovaný návod postupuje medzi krokmi a uloží záložku do databázy", async () => {
  await render(<GuideScreen />);
  expect(screen.getByText("Začnite bezpečným zdrojom")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Ďalší krok" }));
  expect(screen.getByText("Vyberte správne nádoby")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Predchádzajúci krok" }),
  );
  expect(screen.getByText("Začnite bezpečným zdrojom")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Uložiť návod" }));
  await waitFor(() =>
    expect(mockStore().save).toHaveBeenCalledWith(
      "checklists",
      expect.objectContaining({ id: "bookmark-water-storage", done: true }),
    ),
  );
});
test("neznámy návod sa nespráva ako existujúci obsah", async () => {
  mockParams.mockReturnValue({ id: "missing" });
  await render(<GuideScreen />);
  expect(screen.getByText("Návod sa nenašiel")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Ďalší krok" })).toBeNull();
});
test("video knižnica nič neprehráva automaticky a otvorí explicitný YouTube vyhľadávací odkaz", async () => {
  mockParams.mockReturnValue({});
  const open = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  await render(<VideosScreen />);
  expect(open).not.toHaveBeenCalled();
  await fireEvent.press(
    screen.getByRole("button", {
      name: "Otvoriť vyhľadávanie: Prvá pomoc v praxi",
    }),
  );
  await waitFor(() =>
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining("https://www.youtube.com/results?search_query="),
    ),
  );
  expect(new URL(open.mock.calls[0][0]).searchParams.get("search_query")).toBe(
    "Slovenský Červený kríž prvá pomoc",
  );
  open.mockRestore();
});

test("changing a guide step pauses the animation and never writes checklist progress", async () => {
  const previous = AppState.currentState;
  AppState.currentState = "active";
  const preference = jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
  const timing = jest
    .spyOn(Animated, "timing")
    .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });
  mockParams.mockReturnValue({ id: "flood" });
  try {
    await render(<GuideScreen />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Prehrať" }).props.accessibilityState
          .disabled,
      ).toBe(false),
    );
    await fireEvent.press(screen.getByRole("button", { name: "Prehrať" }));
    expect(screen.getByRole("button", { name: "Pozastaviť" })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Ďalší krok" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Pozastaviť" })).toBeNull(),
    );
    expect(
      screen.getByText(
        /Nevstupujte ani nevchádzajte autom do zaplavenej cesty/,
      ),
    ).toBeTruthy();
    expect(mockStore().save).not.toHaveBeenCalled();
  } finally {
    AppState.currentState = previous;
    preference.mockRestore();
    timing.mockRestore();
  }
});
