import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { router } from "expo-router";
import * as ExpoRouter from "expo-router";
import { Alert } from "react-native";
import { ProfileForm } from "../src/components/profile-form";
import Home from "../src/app/(tabs)/index";
import InventoryScreen from "../src/app/(tabs)/inventory";
import ItemScreen from "../src/app/item";
import SafePlaces from "../src/app/safe-places";
import Help from "../src/app/(tabs)/help";
import { useStore } from "../src/state/store";
import { defaultHousehold, type State } from "../src/types/model";
import { initialChecklists } from "../src/data/content";
jest.mock("../src/state/store", () => ({ useStore: jest.fn() }));
const mockStore = jest.mocked(useStore);
const base: State = {
  household: defaultHousehold,
  inventory: [],
  shopping: [],
  checklists: initialChecklists,
  contacts: [],
  safePlaces: [],
};
beforeEach(() => {
  jest.clearAllMocks();
  mockStore.mockReturnValue({
    data: base,
    error: "",
    busy: false,
    reload: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    profile: jest.fn(),
    restore: jest.fn(),
    addShopping: jest.fn(),
    clearError: jest.fn(),
  });
});
test("onboarding odmietne nulu, potom uloží platný profil so slovenskou desatinnou čiarkou", async () => {
  const save = jest.fn().mockResolvedValue(undefined);
  await render(<ProfileForm initial={defaultHousehold} onSave={save} first />);
  await fireEvent.changeText(screen.getByLabelText("Počet osôb (1–10)"), "0");
  await fireEvent.press(
    screen.getByRole("button", { name: "Začať s prípravou" }),
  );
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText("Počet osôb (1–10)"), "2");
  await fireEvent.changeText(
    screen.getByLabelText("Litrov pitnej vody na osobu a deň"),
    "3,8",
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Začať s prípravou" }),
  );
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ people: 2, water: 3.8 }),
    ),
  );
});
test("domov vykreslí oddelené krytie a upozornenie na neznámu energiu", async () => {
  const state = {
    ...base,
    inventory: [
      {
        id: "r",
        name: "Ryža",
        category: "jedlo" as const,
        quantity: 1,
        unit: "kg" as const,
        kcal: 6600,
        expiry: null,
        expiryType: "spotreba" as const,
        purchased: null,
        note: "",
      },
      {
        id: "u",
        name: "Neznáma",
        category: "jedlo" as const,
        quantity: 1,
        unit: "ks" as const,
        kcal: null,
        expiry: null,
        expiryType: "spotreba" as const,
        purchased: null,
        note: "",
      },
    ],
  };
  mockStore.mockReturnValue({ ...mockStore(), data: state });
  await render(<Home />);
  expect(screen.getByText("3 dní jedla")).toBeTruthy();
  expect(screen.getByText("0 dní pitnej vody")).toBeTruthy();
  expect(screen.getByText(/Neznáme kcal: 1/)).toBeTruthy();
});
test("nová zásoba nesfalšuje kcal a odovzdá skutočnú položku na uloženie", async () => {
  const save = jest.fn().mockResolvedValue(undefined);
  mockStore.mockReturnValue({ ...mockStore(), save });
  await render(<ItemScreen />);
  await fireEvent.changeText(screen.getByLabelText("Názov"), "Ryža");
  await fireEvent.changeText(screen.getByLabelText("Množstvo"), "2,5");
  await fireEvent.press(screen.getByRole("button", { name: "Uložiť zásobu" }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      "inventory",
      expect.objectContaining({
        name: "Ryža",
        quantity: 2.5,
        kcal: null,
        unit: "kg",
      }),
    ),
  );
});
test("vyhľadávanie filtruje zásoby a mazanie vyžaduje potvrdenie", async () => {
  const remove = jest.fn().mockResolvedValue(undefined),
    alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  mockStore.mockReturnValue({
    ...mockStore(),
    remove,
    data: {
      ...base,
      inventory: [
        {
          id: "r",
          name: "Ryža",
          category: "jedlo",
          quantity: 1,
          unit: "kg",
          kcal: null,
          expiry: null,
          expiryType: "spotreba",
          purchased: null,
          note: "",
        },
      ],
    },
  });
  await render(<InventoryScreen />);
  await fireEvent.changeText(
    screen.getByLabelText("Vyhľadávanie zásob"),
    "voda",
  );
  expect(screen.queryByText("Ryža")).toBeNull();
  await fireEvent.changeText(
    screen.getByLabelText("Vyhľadávanie zásob"),
    "ryža",
  );
  expect(screen.getByText("Ryža")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Vymazať: Ryža" }));
  expect(alert).toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
  alert.mockRestore();
});
test("skutočná obrazovka krytov zobrazí prázdny stav bez falošných lokalít", async () => {
  await render(<SafePlaces />);
  expect(
    screen.getByText("Overené údaje zatiaľ nie sú dostupné."),
  ).toBeTruthy();
  expect(screen.queryByText(/Zdroj miesta:/)).toBeNull();
  expect(screen.getByText(/Žiadne uložené miesta/)).toBeTruthy();
});
test("núdzové volanie potrebuje výslovné potvrdenie a návod je dostupný bez načítania webu", async () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  await render(<Help />);
  await fireEvent.press(
    screen.getByRole("button", { name: "112 — Integrovaný záchranný systém" }),
  );
  expect(alert).toHaveBeenCalledWith(
    "Vytočiť 112?",
    expect.any(String),
    expect.any(Array),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Otvoriť: Výpadok elektriny" }),
  );
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/guide",
    params: { id: "blackout" },
  });
  alert.mockRestore();
});

test("house water link selects its inventory filter and the user can change it", async () => {
  const params: { category?: string } = { category: "voda" };
  const query = jest
    .mocked(ExpoRouter.useLocalSearchParams)
    .mockReturnValue(params);
  const update = jest.spyOn(router, "setParams").mockImplementation(() => {
    delete params.category;
  });
  try {
    await render(<InventoryScreen />);
    expect(
      screen.getByRole("radio", { name: "Pitná voda" }).props.accessibilityState
        .checked,
    ).toBe(true);
    await fireEvent.press(screen.getByRole("radio", { name: "Jedlo" }));
    expect(update).toHaveBeenCalledWith({ category: undefined });
    expect(
      screen.getByRole("radio", { name: "Jedlo" }).props.accessibilityState
        .checked,
    ).toBe(true);
  } finally {
    query.mockReturnValue({});
    update.mockRestore();
  }
});
