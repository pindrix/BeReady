import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { router } from "expo-router";
import FieldKit from "../src/app/field-kit";
import { useStore } from "../src/state/store";
import { defaultHousehold, type State } from "../src/types/model";
jest.mock("../src/state/store", () => ({ useStore: jest.fn() }));
const mockStore = jest.mocked(useStore);
const base: State = {
  household: { ...defaultHousehold, people: 2 },
  inventory: [],
  shopping: [],
  checklists: [],
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
    save: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn(),
    profile: jest.fn(),
    restore: jest.fn(),
    addShopping: jest.fn(),
    clearError: jest.fn(),
  });
});
test("príprava položky uloží konkrétny záznam bez predstierania automatického dokončenia", async () => {
  await render(<FieldKit />);
  expect(mockStore().save).not.toHaveBeenCalled();
  await fireEvent.press(
    screen.getByRole("checkbox", { name: "Pitná voda v prenosnej nádobe" }),
  );
  await waitFor(() =>
    expect(mockStore().save).toHaveBeenCalledWith(
      "checklists",
      expect.objectContaining({
        id: "kit-water-container",
        done: true,
        topic: "evakuácia",
      }),
    ),
  );
});
test("modul zvierat vyžaduje vedomé zapnutie a kalkulačka mení cieľ", async () => {
  await render(<FieldKit />);
  expect(
    screen.queryByRole("radio", { name: "Domáce zvieratá, 0 z 3 pripravené" }),
  ).toBeNull();
  expect(screen.getByLabelText("Potrebná voda 22,8 litrov")).toBeTruthy();
  await fireEvent.press(screen.getByRole("radio", { name: "7" }));
  expect(screen.getByLabelText("Potrebná voda 53,2 litrov")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("checkbox", {
      name: "Do výbavy patria aj domáce zvieratá",
    }),
  );
  await waitFor(() =>
    expect(mockStore().save).toHaveBeenCalledWith(
      "checklists",
      expect.objectContaining({ id: "kit-pets-enabled", done: true }),
    ),
  );
});
test("voda sa nepredstiera ako prenesená výbava a návod otvorí skutočnú offline tému", async () => {
  await render(<FieldKit />);
  expect(screen.getByText("Domáca zásoba ≠ hmotnosť batoha")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Návod: Pitná voda" }),
  );
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/guide",
    params: { id: "water-storage" },
  });
});
