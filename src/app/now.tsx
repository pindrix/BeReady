import { translateText as t } from "../i18n";
import { CountryPicker, useCountry } from "../components/country-picker";
import { numbersForCountry } from "../data/countries";
import {
  LocalizedAlert as Alert,
  LocalizedPressable as Pressable,
} from "../components/localized-native";
import { LocalizedText as Text } from "../components/localized-text";
import { Linking, View } from "react-native";
import { router } from "expo-router";
import { Screen, Card, T, ErrorText, useAction } from "../components/ui";
import { Icon, IconButton, Tile } from "../components/visual";
import { disclaimer } from "../data/content";
import { useTheme } from "../theme/theme";
export default function Now() {
  const country = useCountry(),
    emergencyNumbers = numbersForCountry(country?.code);
  const c = useTheme(),
    a = useAction();
  return (
    <Screen
      title="Potrebujem pomoc."
      subtitle="Pri bezprostrednom ohrození volajte tiesňovú linku. BE READY nesleduje aktuálne výstrahy."
      eyebrow="RÝCHLA POMOC"
      headerRight={
        <IconButton
          name="close-outline"
          label="Zavrieť rýchlu pomoc"
          onPress={() => router.back()}
        />
      }
    >
      <CountryPicker />
      {country?.code === "ZZ" ? (
        <T muted>Ak krajina nie je v zozname, overte miestne tiesňové čísla.</T>
      ) : null}
      {country && country.code !== "ZZ" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${country.primary} — ${t(country.primaryName ?? "Integrovaný záchranný systém")}`}
          onPress={() =>
            Alert.alert(
              `Vytočiť ${country.primary}?`,
              "Volajte pri skutočnej núdzi. Otvorí sa systémové vytáčanie.",
              [
                { text: "Zrušiť", style: "cancel" },
                {
                  text: "Otvoriť vytáčanie",
                  onPress: () =>
                    void a.run(async () => {
                      await Linking.openURL(`tel:${country.primary}`);
                    }),
                },
              ],
            )
          }
          style={{
            padding: 26,
            borderRadius: 28,
            backgroundColor: c.danger,
            flexDirection: "row",
            alignItems: "center",
            gap: 18,
          }}
        >
          <Icon
            name="call-outline"
            size={36}
            color={c.dark ? "#452321" : "white"}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 47,
                fontWeight: "800",
                color: c.dark ? "#452321" : "white",
              }}
            >
              {country.primary}
            </Text>
            <Text
              style={{
                fontSize: 13,
                lineHeight: 20,
                color: c.dark ? "#452321" : "white",
              }}
            >
              Tiesňová linka · otvoriť vytáčanie
            </Text>
          </View>
          <Icon name="arrow-forward" color={c.dark ? "#452321" : "white"} />
        </Pressable>
      ) : null}
      <Card>
        <T large>Operátorovi povedzte:</T>
        {[
          "Čo sa stalo a kde ste — miesto, adresa alebo orientačný bod.",
          "Koľko ľudí potrebuje pomoc a aké ohrozenie vidíte.",
          "Odpovedajte na otázky a nezaveste, kým vás operátor nevyzve.",
        ].map((t, i) => (
          <View key={t} style={{ flexDirection: "row", gap: 12 }}>
            <Text style={{ fontWeight: "800", fontSize: 20, color: c.primary }}>
              {i + 1}
            </Text>
            <View style={{ flex: 1 }}>
              <T>{t}</T>
            </View>
          </View>
        ))}
      </Card>
      <T large>Čo sa deje?</T>
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        {[
          {
            id: "blackout",
            icon: "flashlight-outline" as const,
            title: "Výpadok prúdu",
            tone: "blue" as const,
          },
          {
            id: "fire",
            icon: "flame-outline" as const,
            title: "Požiar",
            tone: "orange" as const,
          },
          {
            id: "flood",
            icon: "water-outline" as const,
            title: "Povodeň",
            tone: "blue" as const,
          },
          {
            id: "evacuation",
            icon: "bag-handle-outline" as const,
            title: "Evakuácia",
            tone: "green" as const,
          },
        ].map((x) => (
          <Tile
            key={x.id}
            icon={x.icon}
            title={x.title}
            subtitle="Otvoriť offline postup"
            tone={x.tone}
            onPress={() =>
              router.push({ pathname: "/guide", params: { id: x.id } })
            }
          />
        ))}
      </View>
      <Card>
        {emergencyNumbers.slice(1).map((n) => (
          <Pressable
            key={n.name}
            accessibilityRole="button"
            accessibilityLabel={`${n.number} — ${n.name}`}
            onPress={() =>
              Alert.alert(`Vytočiť ${n.number}?`, n.name, [
                { text: "Zrušiť", style: "cancel" },
                {
                  text: "Otvoriť vytáčanie",
                  onPress: () =>
                    void a.run(async () => {
                      await Linking.openURL(`tel:${n.number}`);
                    }),
                },
              ])
            }
            style={{
              minHeight: 52,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "800", color: c.primary }}>
              {n.number}
            </Text>
            <View style={{ flex: 1 }}>
              <T>{n.name}</T>
            </View>
            <Icon name="call-outline" size={19} />
          </Pressable>
        ))}
      </Card>
      <ErrorText message={a.error} />
      <T muted>{disclaimer}</T>
    </Screen>
  );
}
