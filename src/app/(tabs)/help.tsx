import { useState } from "react";
import { Alert, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Card,
  ErrorText,
  Screen,
  T,
  useAction,
} from "../../components/ui";
import { disclaimer, emergencyNumbers, guides } from "../../data/content";
export default function HelpScreen() {
  const { topic } = useLocalSearchParams<{ topic?: string }>(),
    [selected, setSelected] = useState<string | null>(null),
    a = useAction();
  const active = selected ?? topic;
  return (
    <Screen
      title="Pomoc vždy poruke"
      subtitle="Základné postupy sú uložené v aplikácii a dostupné offline."
    >
      <Card>
        <T>{disclaimer}</T>
      </Card>
      <Button
        title="Bezpečné miesta / Kryty"
        secondary
        onPress={() => router.push("/safe-places")}
      />
      <Card>
        <T large>Núdzové kontakty na Slovensku</T>
        <T muted>
          Volajte pri skutočnej núdzi. Vytáčanie sa otvorí až po vašom
          potvrdení.
        </T>
        {emergencyNumbers.map((x) => (
          <Button
            key={x.number}
            title={`${x.number} — ${x.name}`}
            secondary
            onPress={() =>
              Alert.alert(`Vytočiť ${x.number}?`, x.name, [
                { text: "Zrušiť", style: "cancel" },
                {
                  text: "Otvoriť vytáčanie",
                  onPress: () =>
                    void a.run(async () => {
                      await Linking.openURL(`tel:${x.number}`);
                    }),
                },
              ])
            }
          />
        ))}
      </Card>
      <ErrorText message={a.error} />
      {guides.map((g) => (
        <Card key={g.id}>
          <Button
            title={`${active === g.id ? "Zavrieť" : "Otvoriť"}: ${g.title}`}
            secondary
            onPress={() => setSelected(active === g.id ? "" : g.id)}
          />
          {active === g.id ? (
            <>
              <T large>{g.title}</T>
              {g.steps.map((text, i) => (
                <T key={i}>
                  {i + 1}. {text}
                </T>
              ))}
              <T muted>
                Redakčná kontrola textu: {g.reviewed}. Všeobecné informácie
                nenahrádzajú miestne pokyny úradov. Aktuálnosť externého zdroja
                v tomto prostredí nebola overená.
              </T>
              <T muted>Zdroj: {g.source}</T>
              <Button
                title={`Otvoriť oficiálny zdroj: ${g.title} (online)`}
                secondary
                onPress={() =>
                  void a.run(async () => {
                    await Linking.openURL(g.source);
                  })
                }
              />
            </>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}
