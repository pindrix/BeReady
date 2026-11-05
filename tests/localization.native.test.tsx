import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { LocalizedText } from "../src/components/localized-text";
import { Button, Field, Screen, T, Check } from "../src/components/ui";
import { setLocale, translateText } from "../src/i18n";
afterEach(async () => {
  await act(() => setLocale("sk"));
});
test("arabský text a popisky používajú lokálny slovník, RTL a zachovajú osobný text", async () => {
  await setLocale("ar");
  const onPress = jest.fn();
  await render(
    <Screen title="Zásoby">
      <LocalizedText>Do cieľa chýba {38} l pitnej vody.</LocalizedText>
      <T translate={false}>Pitná voda</T>
      <Field label="Názov" value="Môj názov" onChange={() => {}} />
      <Button title="Uložiť zásobu" onPress={onPress} />
    </Screen>,
  );
  const title = screen.getByText(translateText("Zásoby", "ar"));
  expect(StyleSheet.flatten(title.props.style).writingDirection).toBe("rtl");
  expect(screen.getByText("Pitná voda")).toBeTruthy();
  expect(screen.getByLabelText(translateText("Názov", "ar")).props.value).toBe(
    "Môj názov",
  );
  await fireEvent.press(
    screen.getByRole("button", { name: translateText("Uložiť zásobu", "ar") }),
  );
  expect(onPress).toHaveBeenCalledTimes(1);
});
test("zmena jazyka okamžite prekreslí existujúci text bez zmeny údajov", async () => {
  await setLocale("sk");
  await render(
    <>
      <LocalizedText>Zásoby</LocalizedText>
      <LocalizedText translate={false}>Zásoby</LocalizedText>
    </>,
  );
  expect(screen.getAllByText("Zásoby")).toHaveLength(2);
  await act(() => setLocale("ar"));
  expect(screen.getByText(translateText("Zásoby", "ar"))).toBeTruthy();
  expect(screen.getByText("Zásoby")).toBeTruthy();
});

test("vlastný názov úlohy zostáva nezmenený aj v prístupnom názve checkboxu", async () => {
  await setLocale("ar");
  await render(
    <Check
      label="Zásoby"
      done={false}
      onPress={() => {}}
      translateLabel={false}
    />,
  );
  expect(screen.getByRole("checkbox", { name: "Zásoby" })).toBeTruthy();
  expect(screen.getByText("Zásoby")).toBeTruthy();
});
