import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import MissionsScreen from "../src/app/missions";
import PlusScreen from "../src/app/plus";
import HouseholdCardScreen from "../src/app/household-card";
import { useStore } from "../src/state/store";
import { defaultHousehold, type State } from "../src/types/model";

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
test("Plus jasne označuje koncept a bezplatné nástroje sa dajú rozbaliť", async () => {
  await render(<PlusScreen />);
  expect(screen.getByText("KONCEPT · NIE JE V PREDAJI")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Pozrieť bezplatné funkcie" }),
  );
  expect(
    screen.getByText("Offline krízové postupy a núdzové kontakty"),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Rodinná karta" })).toBeTruthy();
});
test("rodinná karta pred odhalením nevykreslí súkromný kontakt ani miesto", async () => {
  await render(<HouseholdCardScreen />);
  expect(screen.queryByText("Súkromný kontakt")).toBeNull();
  expect(screen.queryByText("Súkromné miesto")).toBeNull();
});
