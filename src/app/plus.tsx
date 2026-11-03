import { useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Card,
  ErrorText,
  Row,
  Screen,
  T,
  useAction,
} from "../components/ui";
import {
  Badge,
  Callout,
  Icon,
  IconButton,
  SectionTitle,
  Tile,
  type IconName,
} from "../components/visual";
import { useTheme } from "../theme/theme";

const roadmap: {
  id: string;
  icon: IconName;
  title: string;
  summary: string;
  detail: string;
}[] = [
  {
    id: "households",
    icon: "home-outline",
    title: "Viac miest, jeden prehľad",
    summary: "Domov, chata alebo pomoc rodičom.",
    detail:
      "Plánovaný komfortný modul pre samostatné profily domácností a rýchle prepínanie lokálnych zásob. Základný profil aj jeho dáta by zostali bezplatné. Zatiaľ nie je implementovaný.",
  },
  {
    id: "packs",
    icon: "map-outline",
    title: "Tematické výpravy",
    summary: "Praktické učenie v širších súvislostiach.",
    detail:
      "Nápad na autorské ilustrované balíky a cvičenia pripravené s odborníkmi: sezónna pripravenosť, domácnosť so zvieratami alebo víkend mimo mesta. Základné núdzové postupy by zostali zadarmo. Zatiaľ nie sú v predaji.",
  },
  {
    id: "reports",
    icon: "pie-chart-outline",
    title: "Prehľad, ktorý ide do hĺbky",
    summary: "Trend zásob a pohodlnejšie plánovanie.",
    detail:
      "Plánované rozšírené prehľady, vlastné organizačné šablóny a exporty pre domácnosť. Nejde o odhad šance na prežitie ani zdravotnú analýzu. Zatiaľ nie je implementované.",
  },
];
const freeFeatures = [
  "Offline krízové postupy a núdzové kontakty",
  "Profil, zásoby a výpočty jedla a vody",
  "Nákupný zoznam a osobný krízový plán",
  "Základné misie a rodinná krízová karta",
  "Export aj import vlastných údajov",
];
export default function PlusScreen() {
  const c = useTheme(),
    a = useAction(),
    [expanded, setExpanded] = useState<string | null>("households"),
    [showFree, setShowFree] = useState(false);
  return (
    <Screen
      title="Viac pokoja. Viac možností."
      eyebrow="BUDÚCNOSŤ READY"
      subtitle="Dobrý produkt môže rásť. Základná pomoc má zostať pre každého."
      headerRight={
        <IconButton
          name="arrow-back"
          label="Späť"
          onPress={() => router.back()}
        />
      }
    >
      <View
        style={{
          backgroundColor: c.hero,
          borderRadius: 30,
          padding: 24,
          gap: 18,
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            height: 180,
            width: 180,
            borderRadius: 90,
            borderColor: "#396558",
            borderWidth: 35,
            position: "absolute",
            right: -65,
            top: -55,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              backgroundColor: "#345E4E",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="sparkles-outline" color="#D3E3B0" size={30} />
          </View>
          <Text
            style={{
              fontSize: 10,
              letterSpacing: 1.8,
              fontWeight: "800",
              color: "#D3E3B0",
            }}
          >
            KONCEPT · NIE JE V PREDAJI
          </Text>
        </View>
        <Text
          style={{
            fontSize: 38,
            fontWeight: "800",
            color: "#FFF9EC",
            letterSpacing: -1,
          }}
        >
          READY Plus
        </Text>
        <Text style={{ fontSize: 17, lineHeight: 25, color: "#D9E6D8" }}>
          Pohodlnejšie plánovanie a premyslené rozšírenia. Bez reklamy vo
          chvíli, keď potrebujete pomoc.
        </Text>
        <View
          style={{
            backgroundColor: "#284C3F",
            borderRadius: 16,
            padding: 15,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Icon name="lock-open-outline" size={22} color="#D3E3B0" />
          <Text
            style={{ fontSize: 14, lineHeight: 21, color: "#F0F2DE", flex: 1 }}
          >
            Všetky dnešné funkcie READY sú dostupné zadarmo.
          </Text>
        </View>
      </View>
      <Callout icon="heart-outline" title="Pomoc bez platobnej brány">
        <T muted>
          Núdzové kontakty, základné offline návody a vaše vlastné údaje
          nepatria za predplatné.
        </T>
      </Callout>
      <SectionTitle
        title="Čo môže prísť ďalej"
        subtitle="Smerovanie produktu. Tieto rozšírenia dnes nie sú aktívne."
      />
      {roadmap.map((feature) => (
        <Card key={feature.id}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${expanded === feature.id ? "Zavrieť" : "Preskúmať"}: ${feature.title}`}
            accessibilityState={{ expanded: expanded === feature.id }}
            onPress={() =>
              setExpanded(expanded === feature.id ? null : feature.id)
            }
            style={{ minHeight: 82, gap: 12 }}
          >
            <Row>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 15,
                  backgroundColor: c.sage,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name={feature.icon} size={25} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{ fontSize: 17, fontWeight: "800", color: c.text }}
                >
                  {feature.title}
                </Text>
                <Text style={{ fontSize: 13, lineHeight: 19, color: c.muted }}>
                  {feature.summary}
                </Text>
              </View>
              <Icon
                name={expanded === feature.id ? "chevron-up" : "chevron-down"}
                size={20}
              />
            </Row>
          </Pressable>
          {expanded === feature.id ? (
            <View style={{ gap: 10 }}>
              <Badge label="PLÁNOVANÉ" tone="orange" />
              <T muted>{feature.detail}</T>
            </View>
          ) : null}
        </Card>
      ))}
      <Card>
        <Row>
          <Icon name="shield-checkmark-outline" size={28} />
          <View style={{ flex: 1 }}>
            <T large>Základ zostáva otvorený</T>
          </View>
        </Row>
        <T muted>
          Žiadna aktivácia predplatného, žiadne inkaso a žiadne skryté skúšobné
          obdobie. Platené funkcie v tejto verzii nie sú zapnuté a cena nie je
          stanovená.
        </T>
        <Button
          title={
            showFree ? "Skryť bezplatné funkcie" : "Pozrieť bezplatné funkcie"
          }
          secondary
          onPress={() => setShowFree(!showFree)}
        />
        {showFree ? (
          <View style={{ gap: 12 }}>
            {freeFeatures.map((feature) => (
              <View key={feature} style={{ flexDirection: "row", gap: 10 }}>
                <Icon name="checkmark-circle" size={20} />
                <View style={{ flex: 1 }}>
                  <T>{feature}</T>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
      <SectionTitle
        title="Užitočné už dnes"
        subtitle="Skutočné nástroje, ktoré si môžete otvoriť hneď."
      />
      <Row>
        <Tile
          icon="trail-sign-outline"
          title="Malé kroky"
          subtitle="Sedem praktických misií bez časového tlaku."
          tone="green"
          onPress={() => router.push("/missions")}
        />
        <Tile
          icon="card-outline"
          title="Rodinná karta"
          subtitle="Dôležité kontakty a miesto stretnutia poruke."
          tone="blue"
          onPress={() => router.push("/household-card")}
        />
      </Row>
      <Card>
        <T large>Povedzte o READY ďalej</T>
        <T muted>
          Ak vám projekt pomáha, môžete odkaz vedome zdieľať. Žiadne kontakty
          domácnosti sa k nemu nepridávajú.
        </T>
        <ErrorText message={a.error} />
        <Button
          title="Zdieľať odkaz na projekt"
          secondary
          onPress={() =>
            void a.run(async () => {
              await Share.share({
                title: "READY — Krízová pripravenosť",
                message:
                  "READY — lokálny plán, zásoby a praktická pripravenosť domácnosti. Projekt: https://github.com/pindrix/BeReady",
              });
            })
          }
        />
      </Card>
    </Screen>
  );
}
