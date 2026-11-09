import { Screen, Card, T, Button, ErrorText, useAction } from "./ui";
import { LanguagePicker } from "./language-picker";
import { CountryPicker, useCountry } from "./country-picker";
import { completeWelcome } from "../state/region";
import { router } from "expo-router";
export function Welcome() {
  const country = useCountry(),
    a = useAction();
  return (
    <Screen title="BE READY" subtitle="Vyberte jazyk a krajinu.">
      <Card>
        <LanguagePicker initiallyOpen />
        <CountryPicker />
        <ErrorText message={a.error} />
        <Button
          title="Pokračovať"
          disabled={!country}
          onPress={() => void a.run(completeWelcome)}
        />
      </Card>
      <T muted>Krajina sa nezisťuje cez GPS. Výber sa uloží iba v zariadení.</T>
      <Button
        title="Potrebujem pomoc teraz"
        secondary
        onPress={() => router.push("/now")}
      />
    </Screen>
  );
}
