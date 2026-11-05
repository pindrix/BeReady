import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";
import Scenarios from "../src/app/scenarios";
import { useStore } from "../src/state/store";
import { defaultHousehold } from "../src/types/model";
jest.mock("../src/state/store", () => ({ useStore: jest.fn() }));
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
const mockStore = jest.mocked(useStore),
  mockParams = jest.mocked(useLocalSearchParams);
beforeEach(() => {
  jest.clearAllMocks();
  mockParams.mockReturnValue({});
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
    profile: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn(),
    restore: jest.fn(),
    addShopping: jest.fn(),
    clearError: jest.fn(),
  });
});
test("offline nácvik prejde dvomi voľbami, umožní návrat a uloží iba výslovné dokončenie", async () => {
  await render(<Scenarios />);
  await fireEvent.press(
    screen.getByRole("button", {
      name: "Spustiť nácvik: Keď doma zhasne svetlo",
    }),
  );
  expect(screen.getByText("Čo sa deje okolo vás?")).toBeTruthy();
  expect(mockStore().save).not.toHaveBeenCalled();
  await fireEvent.press(
    screen.getByRole("button", { name: "Tma bez viditeľného nebezpečenstva" }),
  );
  expect(screen.getByText("Aký zdroj svetla pripravíte?")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Baterku alebo čelovku" }),
  );
  expect(
    screen.getByText("Pripravte si pokojný plán na prvé hodiny"),
  ).toBeTruthy();
  expect(mockStore().save).not.toHaveBeenCalled();
  await fireEvent.press(
    screen.getByRole("button", { name: "Uložiť absolvovaný nácvik" }),
  );
  await waitFor(() =>
    expect(mockStore().save).toHaveBeenCalledWith(
      "checklists",
      expect.objectContaining({ id: "drill-blackout", done: true }),
    ),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Predchádzajúca otázka" }),
  );
  expect(screen.getByText("Aký zdroj svetla pripravíte?")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Začať nácvik odznova" }),
  );
  expect(screen.getByText("Čo sa deje okolo vás?")).toBeTruthy();
});
test("nebezpečná vetva zdôrazní skutočnú pomoc a otvorí núdzovú obrazovku", async () => {
  mockParams.mockReturnValue({ id: "injury-help" });
  await render(<Scenarios />);
  await fireEvent.press(
    screen.getByRole("button", {
      name: "Človek nereaguje, ťažko dýcha alebo silno krváca",
    }),
  );
  expect(screen.getByText("Volajte 155 alebo 112")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Otvoriť rýchlu pomoc" }),
  );
  expect(router.push).toHaveBeenCalledWith("/now");
  expect(mockStore().save).not.toHaveBeenCalled();
});
test("súvisiaci návod je skutočný pribalený sprievodca a scenár možno zmeniť", async () => {
  mockParams.mockReturnValue({ id: "water-warning" });
  await render(<Scenarios />);
  await fireEvent.press(
    screen.getByRole("button", {
      name: "Máme oficiálny zákaz alebo upozornenie",
    }),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Otvoriť súvisiaci offline návod" }),
  );
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/guide",
    params: { id: "water-storage" },
  });
  await fireEvent.press(screen.getByRole("button", { name: "Zmeniť scenár" }));
  expect(screen.getByText("Vyberte situáciu")).toBeTruthy();
});
