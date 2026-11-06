import { CountryPicker, useCountry } from "../../components/country-picker";
import { numbersForCountry } from "../../data/countries";
import {
  LocalizedAlert as Alert,
  LocalizedPressable as Pressable,
} from "../../components/localized-native";
import {
  LocalizedText as Text,
  useLocale,
} from "../../components/localized-text";
import { translateText as t } from "../../i18n";
import { useState } from "react";
import { Linking, ScrollView, View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  ErrorText,
  Field,
  Screen,
  T,
  useAction,
} from "../../components/ui";
import {
  Badge,
  Callout,
  Icon,
  IconButton,
  SectionTitle,
  Tile,
} from "../../components/visual";
import { AcademyArt } from "../../components/academy-art";
import { disclaimer } from "../../data/content";
import {
  academyCategories,
  academyGuides,
  guideBookmark,
  savedGuideIds,
  searchAcademy,
  type AcademyFilter,
} from "../../data/academy";
import { useStore } from "../../state/store";
import { useTheme } from "../../theme/theme";

export default function HelpScreen() {
  const country = useCountry(),
    emergencyNumbers = numbersForCountry(country?.code);
  useLocale();
  const c = useTheme(),
    s = useStore(),
    a = useAction(),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState<AcademyFilter>("Všetko");
  const saved = savedGuideIds(s.data?.checklists ?? []),
    results = searchAcademy("", category, saved).filter((g) => {
      const fold = (v: string) =>
        v
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase();
      return fold(
        [g.title, g.summary, t(g.title), t(g.summary), t(g.eyebrow)].join(" "),
      ).includes(fold(query));
    });
  return (
    <Screen
      title="Vedieť znamená viac."
      subtitle="Malé zručnosti. Väčší pokoj."
      eyebrow="READY AKADÉMIA"
      headerRight={
        <IconButton
          name="call-outline"
          label="Potrebujem pomoc teraz"
          onPress={() => router.push("/now")}
        />
      }
    >
      <View
        style={{
          backgroundColor: c.hero,
          borderRadius: 28,
          padding: 22,
          overflow: "hidden",
          gap: 18,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 2,
              color: "#D1EB9A",
            }}
          >
            VŽDY PO RUKE
          </Text>
          <Icon name="cloud-offline-outline" color="#D1EB9A" size={23} />
        </View>
        <Text
          style={{
            fontSize: 28,
            lineHeight: 34,
            fontWeight: "800",
            color: "#FFF9EC",
            letterSpacing: -0.7,
          }}
        >
          Príprava sa začína{`\n`}jedným krokom.
        </Text>
        <AcademyArt kind="bag" color="#C6D6A9" height={156} />
        <Text style={{ fontSize: 14, lineHeight: 21, color: "#D4E1D8" }}>
          {academyGuides.length} ilustrovaných sprievodcov. Bez registrácie,
          pripravené aj bez internetu.
        </Text>
        <Button
          title="Začnite 72-hodinovým batohom"
          onPress={() =>
            router.push({ pathname: "/guide", params: { id: "go-bag" } })
          }
        />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Tile
          icon="play-circle-outline"
          title="Video zručnosti"
          subtitle="Témy a organizácie na YouTube"
          tone="orange"
          onPress={() => router.push("/videos")}
        />
        <Tile
          icon="location-outline"
          title="Bezpečné miesta"
          subtitle="Stav adresára a zdroje"
          tone="blue"
          onPress={() => router.push("/safe-places")}
        />
      </View>
      <Tile
        icon="play-circle-outline"
        title="Animované postupy"
        subtitle="Pozrite si jednotlivé úkony v pohybe."
        tone="purple"
        onPress={() => router.push("/animations")}
      />
      <SectionTitle
        title="Vaša offline knižnica"
        subtitle="Otvorte si tému a prejdite postup krok za krokom."
      />
      <Field
        label="Vyhľadať návod"
        value={query}
        onChange={setQuery}
        placeholder="Voda, výpadok, prvá pomoc…"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      >
        {academyCategories.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="radio"
            accessibilityLabel={item}
            accessibilityState={{ checked: item === category }}
            onPress={() => setCategory(item)}
            style={{
              minHeight: 46,
              paddingHorizontal: 16,
              justifyContent: "center",
              borderRadius: 24,
              backgroundColor: item === category ? c.primary : c.card,
              borderWidth: 1,
              borderColor: item === category ? c.primary : c.border,
            }}
          >
            <Text
              style={{
                color:
                  item === category ? (c.dark ? "#15392F" : "#FFFFFF") : c.text,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              {item}
              {item === "Uložené" ? ` · ${saved.length}` : ""}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ErrorText message={a.error} />
      {!results.length ? (
        <Callout icon="search-outline" title="Táto polička je zatiaľ prázdna">
          <T muted>
            {category === "Uložené"
              ? "Uložte si návod ikonou záložky. Zostane tu aj po reštarte."
              : "Skúste kratší názov alebo inú kategóriu."}
          </T>
        </Callout>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {results.map((g) => (
          <View
            key={g.id}
            style={{
              flexBasis: "46%",
              flexGrow: 1,
              minWidth: 140,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 23,
              overflow: "hidden",
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Otvoriť: ${g.title}`}
              onPress={() =>
                router.push({ pathname: "/guide", params: { id: g.id } })
              }
              style={({ pressed }) => ({
                padding: 9,
                gap: 10,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <AcademyArt kind={g.art} color={g.color} height={120} />
              <View style={{ paddingHorizontal: 5, gap: 6 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    letterSpacing: 0.8,
                    color: c.primary,
                  }}
                >
                  {g.category.toLocaleUpperCase("sk-SK")}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    lineHeight: 23,
                    fontWeight: "800",
                    letterSpacing: -0.4,
                    color: c.text,
                  }}
                >
                  {g.title}
                </Text>
                <Text
                  numberOfLines={3}
                  style={{ fontSize: 12, lineHeight: 18, color: c.muted }}
                >
                  {g.summary}
                </Text>
              </View>
            </Pressable>
            <View
              style={{
                paddingHorizontal: 14,
                paddingBottom: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 11, color: c.muted }}>
                {g.minutes} min · offline
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${saved.includes(g.id) ? "Odložiť záložku" : "Uložiť návod"}: ${g.title}`}
                accessibilityState={{
                  selected: saved.includes(g.id),
                  disabled: s.busy,
                }}
                disabled={s.busy || a.busy}
                onPress={() =>
                  void a.run(() =>
                    s.save(
                      "checklists",
                      guideBookmark(g, !saved.includes(g.id)),
                    ),
                  )
                }
                style={{
                  width: 46,
                  height: 46,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  name={saved.includes(g.id) ? "bookmark" : "bookmark-outline"}
                  size={22}
                />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      <SectionTitle
        title="Pomoc v skutočnej núdzi"
        subtitle="Tiesňové čísla podľa krajiny, nie podľa jazyka. Pri cestovaní krajinu zmeňte."
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <CountryPicker />
        {emergencyNumbers.map((x) => (
          <Pressable
            key={x.name}
            accessibilityRole="button"
            accessibilityLabel={`${x.number} — ${x.name}`}
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
            style={{
              flexBasis: "45%",
              flexGrow: 1,
              backgroundColor: c.card,
              borderRadius: 20,
              padding: 16,
              gap: 5,
              borderWidth: 1,
              borderColor: c.border,
              minHeight: 110,
            }}
          >
            <Icon name="call-outline" size={20} />
            <Text style={{ color: c.text, fontSize: 28, fontWeight: "800" }}>
              {x.number}
            </Text>
            <Text style={{ color: c.muted, fontSize: 12, lineHeight: 17 }}>
              {x.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <Callout
        icon="information-circle-outline"
        title="Všeobecná pomoc, žiadne živé výstrahy"
      >
        <T muted>{disclaimer}</T>
      </Callout>
      <Badge label="TEXTY A ILUSTRÁCIE DOSTUPNÉ OFFLINE" />
    </Screen>
  );
}
