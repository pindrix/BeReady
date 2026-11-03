import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AcademyArt } from "../components/academy-art";
import {
  Button,
  ErrorText,
  Field,
  Screen,
  T,
  useAction,
} from "../components/ui";
import { Badge, Callout, Icon, SectionTitle } from "../components/visual";
import { videoTopics, youtubeSearchUrl } from "../data/academy";
import { useTheme } from "../theme/theme";
export default function VideosScreen() {
  const c = useTheme(),
    { query: initial } = useLocalSearchParams<{ query?: string }>(),
    [query, setQuery] = useState(initial ?? ""),
    a = useAction();
  const [filter, setFilter] = useState<"Všetky" | "Slovenčina" | "Angličtina">(
    "Všetky",
  );
  const videos = videoTopics.filter(
    (v) => filter === "Všetky" || v.language === filter,
  );
  const open = (term: string) =>
    void a.run(async () => {
      await Linking.openURL(youtubeSearchUrl(term));
    });
  return (
    <Screen
      title="Pozrieť. Pochopiť. Vyskúšať."
      subtitle="Témy na učenie od organizácií, ktoré sa venujú bezpečnosti a prvej pomoci."
      eyebrow="VIDEO ZRUČNOSTI"
    >
      <Button title="Späť" secondary onPress={() => router.back()} />
      <View
        style={{
          backgroundColor: c.hero,
          borderRadius: 28,
          padding: 23,
          gap: 16,
        }}
      >
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View
            style={{
              height: 52,
              width: 52,
              borderRadius: 18,
              backgroundColor: "#D1EB9A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="play" color="#193C36" size={25} />
          </View>
          <Text
            style={{
              fontSize: 23,
              lineHeight: 29,
              fontWeight: "800",
              color: "#FFF9EC",
              flex: 1,
            }}
          >
            Zručnosti sú lepšie,{`\n`}keď ich vidíte.
          </Text>
        </View>
        <Text style={{ color: "#D4E1D8", fontSize: 14, lineHeight: 21 }}>
          Otvorte tematické vyhľadávanie na YouTube. Bez automatického
          prehrávania a bez videí načítaných na pozadí.
        </Text>
      </View>
      <Callout icon="wifi-outline" title="Online doplnok k offline knižnici">
        <T muted>
          Tu sú pripravené témy a vyhľadávacie odkazy, nie overené konkrétne
          videá. YouTube môže zobraziť reklamy aj obsah iných autorov; overte si
          skutočného vydavateľa a aktuálnosť. Prehrávanie vyžaduje internet.
        </T>
      </Callout>
      <Field
        label="Čo sa chcete naučiť?"
        value={query}
        onChange={setQuery}
        placeholder="Napríklad: prvá pomoc Červený kríž"
      />
      <Button
        title="Vyhľadať tému na YouTube"
        onPress={() => open(query)}
        disabled={!query.trim() || a.busy}
      />
      <ErrorText message={a.error} />
      <SectionTitle
        title="Vyberte si smer"
        subtitle="Každá karta otvorí vyhľadávanie s názvom organizácie."
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(["Všetky", "Slovenčina", "Angličtina"] as const).map((x) => (
          <Pressable
            key={x}
            accessibilityRole="radio"
            accessibilityLabel={x}
            accessibilityState={{ checked: x === filter }}
            onPress={() => setFilter(x)}
            style={{
              minHeight: 46,
              paddingHorizontal: 15,
              justifyContent: "center",
              borderRadius: 23,
              backgroundColor: x === filter ? c.primary : c.card,
              borderColor: c.border,
              borderWidth: 1,
            }}
          >
            <Text
              style={{
                color: x === filter ? (c.dark ? "#15392F" : "#FFFFFF") : c.text,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              {x}
            </Text>
          </Pressable>
        ))}
      </View>
      {videos.map((v) => (
        <View
          key={v.id}
          style={{
            borderRadius: 25,
            overflow: "hidden",
            backgroundColor: c.card,
            borderColor: c.border,
            borderWidth: 1,
          }}
        >
          <View style={{ position: "relative" }}>
            <AcademyArt kind={v.art} color={v.color} height={165} />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                right: 17,
                bottom: 16,
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: c.hero,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="play" color="#FFF9EC" size={22} />
            </View>
          </View>
          <View style={{ padding: 18, gap: 10 }}>
            <Badge
              label={`${v.language.toLocaleUpperCase("sk-SK")} · YOUTUBE`}
              tone="orange"
            />
            <Text
              style={{
                fontSize: 22,
                lineHeight: 28,
                fontWeight: "800",
                color: c.text,
                letterSpacing: -0.5,
              }}
            >
              {v.title}
            </Text>
            <T muted>{v.summary}</T>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Icon name="search-outline" size={17} />
              <Text style={{ fontSize: 13, color: c.muted, flex: 1 }}>
                {v.organization}
              </Text>
            </View>
            <Button
              title={`Otvoriť vyhľadávanie: ${v.title}`}
              secondary
              disabled={a.busy}
              onPress={() => open(v.query)}
            />
          </View>
        </View>
      ))}
      <Callout icon="medical-outline" title="V núdzi nečakajte na video">
        <T muted>
          Pri bezprostrednom ohrození volajte 112 alebo 155. Praktické zdravotné
          zručnosti sa učte aj na kvalifikovanom kurze a riaďte sa operátorom.
        </T>
      </Callout>
    </Screen>
  );
}
