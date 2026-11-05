import { setLocale, translateText } from "../src/i18n";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import MissionsScreen from "../src/app/missions";
import PlusScreen from "../src/app/plus";
import HouseholdCardScreen from "../src/app/household-card";
import { useStore } from "../src/state/store";
import { defaultHousehold, type State } from "../src/types/model";

jest.mock("../src/state/license", () => ({
  useLicense: () => ({
    state: { status: "trial", remainingTrialDays: 14 },
    connectivity: "online",
    error: "",
    refresh: jest.fn(),
  }),
  BILLING_CONFIGURATION: { configured: false },
}));
jest.mock("../src/state/store", () => ({ useStore: jest.fn() }));
const mockStore = jest.mocked(useStore);
const state: State = {
  household: {
    ...defaultHousehold,
    name: "Testová domácnosť",
    meeting: "Súkromné miesto",
  },
  inventory: [],
  shopping: [],
  checklists: [],
  contacts: [{ id: "c", name: "Blízka osoba", details: "Súkromný kontakt" }],
  safePlaces: [],
};
beforeEach(() => {
  jest.clearAllMocks();
  mockStore.mockReturnValue({
    data: state,
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
test("misia uloží len vlastné explicitné potvrdenie a kvíz vysvetlí nesprávnu odpoveď", async () => {
  await render(<MissionsScreen />);
  await fireEvent.press(
    screen.getByRole("radio", { name: "Všetka tekutina v domácnosti" }),
  );
  expect(screen.getByText("Skúsme sa na to pozrieť spolu.")).toBeTruthy();
  expect(mockStore().save).not.toHaveBeenCalled();
  await fireEvent.press(
    screen.getByRole("button", { name: "Tento krok som urobil/a" }),
  );
  await waitFor(() =>
    expect(mockStore().save).toHaveBeenCalledWith(
      "checklists",
      expect.objectContaining({
        id: "mission-water",
        done: true,
        topic: "ukrytie",
      }),
    ),
  );
});
test("dokončenie misie je možné vrátiť medzi nesplnené", async () => {
  mockStore.mockReturnValue({
    ...mockStore(),
    data: {
      ...state,
      checklists: [
        { id: "mission-water", name: "Voda", topic: "ukrytie", done: true },
      ],
    },
  });
  await render(<MissionsScreen />);
  await fireEvent.press(
    screen.getByRole("button", {
      name: "Otvoriť krok: Spoznajte svoju vodnú rezervu",
    }),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Vrátiť krok medzi nesplnené" }),
  );
  await waitFor(() =>
    expect(mockStore().save).toHaveBeenCalledWith(
      "checklists",
      expect.objectContaining({ id: "mission-water", done: false }),
    ),
  );
});
test("ročná licencia jasne ukazuje podmienky a bez pripojeného obchodu neponúka falošnú platbu", async () => {
  await render(<PlusScreen />);
  expect(screen.getByText("Platby ešte nie sú pripojené")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Kúpiť ročnú licenciu — 10 USD" }).props
      .accessibilityState.disabled,
  ).toBe(true);
  expect(
    screen.getByRole("button", { name: "Obnoviť overený nákup" }).props
      .accessibilityState.disabled,
  ).toBe(true);
  await fireEvent.press(
    screen.getByRole("button", { name: "Ako funguje licencia" }),
  );
  expect(screen.getByText(/Platný nákup musí overiť/)).toBeTruthy();
});
test("rodinná karta pred odhalením nevykreslí súkromný kontakt ani miesto", async () => {
  await render(<HouseholdCardScreen />);
  expect(screen.queryByText("Súkromný kontakt")).toBeNull();
  expect(screen.queryByText("Súkromné miesto")).toBeNull();
});

test("osobný kontakt zostáva pôvodný aj pri arabskom rozhraní a známom názve zo slovníka", async () => {
  await setLocale("ar");
  try {
    mockStore.mockReturnValue({
      ...mockStore(),
      data: {
        ...state,
        contacts: [{ id: "c", name: "Pomoc", details: "Pitná voda" }],
      },
    });
    await render(<HouseholdCardScreen />);
    await fireEvent.press(
      screen.getByRole("checkbox", {
        name: translateText("Zobraziť a zahrnúť osobné údaje", "ar"),
      }),
    );
    expect(screen.getByText("Pomoc")).toBeTruthy();
    expect(screen.getByText("Pitná voda")).toBeTruthy();
  } finally {
    await act(() => setLocale("sk"));
  }
});
