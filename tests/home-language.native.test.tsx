/* eslint-disable @typescript-eslint/no-require-imports -- Hoisted Jest fixture needs the model after module mocking. */
import { render, screen, act } from "@testing-library/react-native";
import Home from "../src/app/(tabs)/index";
import { setLocale, translateText } from "../src/i18n";
jest.mock("../src/state/store", () => ({
  useStore: () => ({
    data: {
      household: {
        ...require("../src/types/model").defaultHousehold,
        name: "Súkromný názov",
      },
      inventory: [],
      checklists: [],
      shopping: [],
      contacts: [],
      safePlaces: [],
    },
  }),
}));
afterEach(async () => {
  await act(() => setLocale("sk"));
});
test("vizuálne nadpisy a navigačné body sú arabské a názov domácnosti zostáva osobný", async () => {
  await setLocale("ar");
  await render(<Home />);
  expect(screen.queryByText(/Malé kroky/)).toBeNull();
  expect(screen.queryByText(/Menej čítania/)).toBeNull();
  expect(
    screen.getAllByText(translateText("VÁŠ DOMÁCI PLÁN", "ar")).length,
  ).toBeGreaterThan(0);
  expect(screen.queryByText("Rodinný plán")).toBeNull();
  expect(
    screen.getAllByText(translateText("Rodinný plán", "ar")).length,
  ).toBeGreaterThan(0);
  expect(screen.getByText(/Súkromný názov/)).toBeTruthy();
  expect(screen.queryByText(/osoby/)).toBeNull();
});
