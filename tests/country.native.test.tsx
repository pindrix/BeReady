import { Welcome } from "../src/components/welcome";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { Alert, Linking } from "react-native";
import Now from "../src/app/now";
import {
  initializeRegion,
  isWelcomeComplete,
  getCountryCode,
  setCountryCode,
} from "../src/state/region";
import { setLocale } from "../src/i18n";
test("US emergency dial uses 911 even with Slovak language and requires confirmation", async () => {
  await setCountryCode("US");
  await setLocale("sk");
  const open = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined),
    alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  await render(<Now />);
  await fireEvent.press(
    screen.getByRole("button", { name: "911 — Integrovaný záchranný systém" }),
  );
  expect(open).not.toHaveBeenCalled();
  await act(async () => {
    alert.mock.calls[0][2]!.find((b) => b.text === "Otvoriť vytáčanie")!
      .onPress!();
  });
  await waitFor(() => expect(open).toHaveBeenCalledWith("tel:911"));
  alert.mockRestore();
  open.mockRestore();
});

test("first run opens language choice and waits for an explicit country before completion", async () => {
  const db = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({}),
  };
  await initializeRegion(
    db as unknown as Parameters<typeof initializeRegion>[0],
  );
  await render(<Welcome />);
  expect(isWelcomeComplete()).toBe(false);
  await fireEvent.press(screen.getByRole("radio", { name: "English" }));
  expect(
    screen.getByRole("button", { name: "Continue" }).props.accessibilityState
      .disabled,
  ).toBe(true);
  await fireEvent.press(
    screen.getByRole("button", { name: "Choose a country." }),
  );
  await fireEvent.press(screen.getByRole("radio", { name: "United States" }));
  expect(getCountryCode()).toBe("US");
  await fireEvent.press(screen.getByRole("button", { name: "Continue" }));
  await waitFor(() => expect(isWelcomeComplete()).toBe(true));
  await act(async () => {
    await setLocale("sk");
  });
});
