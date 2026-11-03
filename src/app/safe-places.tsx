import { Linking } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Card,
  ErrorText,
  Screen,
  T,
  useAction,
} from "../components/ui";
import { useStore } from "../state/store";
import { safePlacesView } from "../domain/safe-places";
export default function SafePlaces() {
  const s = useStore(),
    a = useAction(),
    view = safePlacesView(s.data?.safePlaces ?? []);
  return (
    <Screen title="Bezpečné miesta / Kryty">
      <Button title="Späť" secondary onPress={() => router.back()} />
      <Card>
        <T large>Overené údaje zatiaľ nie sú dostupné.</T>
        <T>
          READY neobsahuje vstavaný adresár ani mapu krytov. Informácie o
          dostupných miestach a aktuálnych pokynoch získajte od obce a
          príslušných úradov.
        </T>
        <T muted>
          GPS sa nevyžaduje. Najbližšie miesto nemusí byť najbezpečnejšie a jeho
          prístupnosť nie je zaručená.
        </T>
      </Card>
      {view.empty ? (
        <Card>
          <T>
            Žiadne uložené miesta. Nezobrazujeme vymyslené lokality ani demo
            kryty.
          </T>
        </Card>
      ) : null}
      {view.places.map((p) => (
        <Card key={p.id}>
          <T large>{p.name}</T>
          <T>{p.label}</T>
          <T>
            {p.type} · {p.status}
          </T>
          <T>Dátum uvedeného overenia: {p.verified}</T>
          <T>{p.note}</T>
          <T muted>{p.sourceUrl}</T>
          <Button
            title={`Zdroj miesta: ${p.name} (online)`}
            secondary
            onPress={() =>
              void a.run(async () => {
                await Linking.openURL(p.sourceUrl);
              })
            }
          />
        </Card>
      ))}
      <ErrorText message={a.error} />
    </Screen>
  );
}
