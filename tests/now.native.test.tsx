import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { Alert, Linking } from "react-native";
import { router } from "expo-router";
import Now from "../src/app/now";
test("rýchla pomoc funguje bez databázy alebo profilu a nevytáča bez potvrdenia", async () => {
  const open = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined),
    alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  await render(<Now />);
  await fireEvent.press(
    screen.getByRole("button", { name: "112 — Integrovaný záchranný systém" }),
  );
  expect(open).not.toHaveBeenCalled();
  const buttons = alert.mock.calls[0][2]!;
  buttons.find((b) => b.text === "Otvoriť vytáčanie")!.onPress!();
  await waitFor(() => expect(open).toHaveBeenCalledWith("tel:112"));
  alert.mockRestore();
  open.mockRestore();
});
test("rýchla pomoc otvorí správny pribalený scenár", async () => {
  await render(<Now />);
  await fireEvent.press(screen.getByRole("button", { name: "Požiar" }));
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/guide",
    params: { id: "fire" },
  });
});
