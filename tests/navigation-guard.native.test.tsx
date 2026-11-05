/* eslint-disable @typescript-eslint/no-require-imports -- Jest factories load mocked native modules after hoisting. */
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { router, useSegments } from "expo-router";
import RootLayout from "../src/app/_layout";
import { useStore } from "../src/state/store";
import { useLicense, protectedAccess } from "../src/state/license";
import { defaultHousehold } from "../src/types/model";
jest.mock("expo-router", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Stack = Object.assign(
    ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, { testID: "root-navigator" }, children),
    { Screen: () => null },
  );
  return {
    Stack,
    router: { replace: jest.fn(), push: jest.fn() },
    useSegments: jest.fn(),
    useRootNavigationState: () => ({ key: "mounted" }),
  };
});
jest.mock("expo-sqlite", () => ({
  SQLiteProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("../src/state/store", () => ({
  StoreProvider: ({ children }: { children: React.ReactNode }) => children,
  useStore: jest.fn(),
}));
jest.mock("../src/state/license", () => ({
  LicenseProvider: ({ children }: { children: React.ReactNode }) => children,
  useLicense: jest.fn(),
  protectedAccess: jest.fn(),
}));
const store = jest.mocked(useStore),
  license = jest.mocked(useLicense),
  segments = jest.mocked(useSegments),
  access = jest.mocked(protectedAccess);
beforeEach(() => {
  jest.clearAllMocks();
  store.mockReturnValue({
    data: {
      household: defaultHousehold,
      inventory: [],
      shopping: [],
      contacts: [],
      checklists: [],
      safePlaces: [],
    },
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
  license.mockReturnValue({
    state: null,
    connectivity: "offline",
    error: "",
    refresh: jest.fn(),
    purchase: jest.fn(),
    restorePurchase: jest.fn(),
  });
  segments.mockReturnValue(["(tabs)"]);
  access.mockReturnValue({
    allowed: false,
    reason: "offline-license-required",
  });
});
test("offline zámok ponechá koreňový navigátor a umožní prechod na licenciu", async () => {
  await render(<RootLayout />);
  expect(
    screen.getByTestId("root-navigator", { includeHiddenElements: true }),
  ).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", {
      name: "Zobraziť licenciu — 10 USD / 12 mesiacov",
    }),
  );
  expect(router.push).toHaveBeenCalledWith("/plus");
});
test("nová domácnosť sa presmeruje až pri namontovanom navigátore", async () => {
  store.mockReturnValue({
    ...store(),
    data: { ...store().data!, household: null },
  });
  await render(<RootLayout />);
  expect(
    screen.getByTestId("root-navigator", { includeHiddenElements: true }),
  ).toBeTruthy();
  await waitFor(() =>
    expect(router.replace).toHaveBeenCalledWith("/onboarding"),
  );
});
test("tiesňová stránka a nastavenia sú mimo offline zámku", async () => {
  segments.mockReturnValue(["now"]);
  await render(<RootLayout />);
  expect(screen.queryByText("Offline režim patrí k licencii.")).toBeNull();
  expect(
    screen.getByTestId("root-navigator", { includeHiddenElements: true }),
  ).toBeTruthy();
});
