import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Card, Screen, T } from "../../components/ui";
import {
  Badge,
  Icon,
  IconButton,
  Ring,
  SectionTitle,
  Tile,
} from "../../components/visual";
import { coverage, expiryStatus } from "../../domain/readiness";
import { useStore } from "../../state/store";
import { nutritionNote } from "../../data/content";
import { formatNumber as fmt } from "../../i18n";
import { missionProgress } from "../../domain/missions";
import { useTheme } from "../../theme/theme";
export default function Home() {
  const { data } = useStore(),
    theme = useTheme(),
    compact = useWindowDimensions().width < 350;
  if (!data?.household) return null;
  const p = data.household,
    c = coverage(p, data.inventory),
    tasks = data.checklists.filter(
      (x) =>
        x.topic === "evakuácia" &&
        !x.id.startsWith("bookmark-") &&
        !x.id.startsWith("mission-"),
    ),
    completed = tasks.filter((x) => x.done).length;
  const missionCount = missionProgress(data.checklists).completed;
  const alerts = data.inventory
    .filter((x) => expiryStatus(x) !== "ok")
    .sort((a, b) => (a.expiry ?? "").localeCompare(b.expiry ?? ""))
    .slice(0, 3);
  return (
    <Screen
      title="Doma pripravení."
      subtitle={`${p.name || "Vaša domácnosť"} · ${p.people} ${p.people === 1 ? "osoba" : p.people < 5 ? "osoby" : "osôb"} · váš plán na ${p.goal} dní`}
      eyebrow="POKOJ SA ZAČÍNA PRÍPRAVOU"
      headerRight={
        <IconButton
          name="settings-outline"
          label="Nastavenia domácnosti"
          onPress={() => router.push("/settings")}
        />
      }
    >
      <View
        style={{
          borderRadius: 28,
          overflow: "hidden",
          backgroundColor: "#F1F1E8",
          minHeight: 242,
        }}
      >
        <Image
          source={require("../../../assets/images/ready-world.webp")}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          contentFit="cover"
          accessibilityLabel="Ilustrácia domácnosti, batohu, vody a výbavy"
        />
        <LinearGradient
          colors={["rgba(245,245,235,.95)", "rgba(245,245,235,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            padding: 23,
            minHeight: 242,
            justifyContent: "space-between",
            gap: 22,
          }}
        >
          <View style={{ gap: 10, width: compact ? "78%" : "62%" }}>
            <Badge
              label={compact ? "VÁŠ DOMÁCI PLÁN" : "MENEJ OBÁV. VIAC PLÁNU."}
            />
            <Text
              style={{
                fontSize: compact ? 26 : 31,
                lineHeight: compact ? 30 : 35,
                fontWeight: "800",
                letterSpacing: -1.3,
                color: "#183D34",
              }}
            >
              Malé kroky.{`\n`}Veľký pokoj.
            </Text>
            <Text
              style={{
                fontSize: compact ? 12 : 13,
                lineHeight: 19,
                color: "#4E6659",
              }}
            >
              Pripravte si domov na dni,{`\n`}ktoré sa nedajú naplánovať.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Začať 7 krokov prípravy"
            onPress={() => router.push("/missions")}
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 17,
              paddingVertical: 13,
              backgroundColor: "#244F40",
              borderRadius: 17,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 14, color: "white" }}>
              Môj prvý krok
            </Text>
            <Icon name="arrow-forward" color="white" size={18} />
          </Pressable>
        </LinearGradient>
      </View>
      <SectionTitle
        title="Váš domov v číslach"
        action="Profil"
        onPress={() => router.push("/settings")}
      />
      <LinearGradient
        colors={["#234D41", "#142F2E"]}
        style={{ borderRadius: 28, padding: 23, gap: 22 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 1.6,
              fontWeight: "700",
              color: "#B4CEC0",
            }}
          >
            ZÁSOBY A PRÍPRAVA
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icon name="cloud-offline-outline" size={15} color="#D1EB9A" />
            <Text style={{ fontSize: 11, color: "#D1EB9A" }}>LOKÁLNE</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Ring
            values={[
              c.foodDays / p.goal,
              c.waterDays / p.goal,
              tasks.length ? completed / tasks.length : 0,
            ]}
            goal={p.goal}
          />
          <View style={{ gap: 21, flexGrow: 1, minWidth: 110 }}>
            {[
              {
                text: `${fmt(c.foodDays)} dní jedla`,
                caption: "Energetické zásoby",
                color: "#A8D8B3",
                icon: "nutrition-outline" as const,
              },
              {
                text: `${fmt(c.waterDays)} dní pitnej vody`,
                caption: "Pitná voda",
                color: "#F6C58C",
                icon: "water-outline" as const,
              },
              {
                text: `${completed} / ${tasks.length} úloh`,
                caption: "Evakuačný batoh",
                color: "#88C6D8",
                icon: "bag-handle-outline" as const,
              },
            ].map((v) => (
              <View
                key={v.caption}
                style={{ flexDirection: "row", gap: 11, alignItems: "center" }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    backgroundColor: "#335849",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={v.icon} color={v.color} size={20} />
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: "#FCFAEE",
                    }}
                  >
                    {v.text}
                  </Text>
                  <Text
                    style={{ fontSize: 11, color: "#BCD0C4", marginTop: 3 }}
                  >
                    {v.caption}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <Text style={{ fontSize: 11, lineHeight: 17, color: "#B8CFC2" }}>
          Kruhy porovnávajú evidované zásoby s vaším cieľom. Nie sú skóre
          bezpečnosti ani zárukou pripravenosti.
        </Text>
      </LinearGradient>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          c.missingWater > 0 ? "Doplniť pitnú vodu" : "Pokračovať v príprave"
        }
        onPress={() =>
          c.missingWater > 0
            ? router.push({ pathname: "/item", params: { category: "voda" } })
            : router.push("/missions")
        }
        style={{
          padding: 20,
          borderRadius: 23,
          backgroundColor: theme.peach,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 16,
            backgroundColor: theme.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name={c.missingWater > 0 ? "water-outline" : "sparkles-outline"}
            color={theme.warning}
          />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1.5,
              color: theme.warning,
            }}
          >
            ODPORÚČANÝ ĎALŠÍ KROK
          </Text>
          <Text style={{ fontSize: 17, fontWeight: "800", color: theme.text }}>
            {c.missingWater > 0
              ? "Začnime pitnou vodou."
              : "Príprava je viac než zásoby."}
          </Text>
          <Text style={{ fontSize: 12, lineHeight: 18, color: theme.muted }}>
            {c.missingWater > 0
              ? `Do cieľa chýba ${fmt(c.missingWater)} l. Pridajte to, čo už doma máte.`
              : "Precvičte si plán s domácnosťou a overte výbavu."}
          </Text>
        </View>
        <Icon name="arrow-forward" size={20} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Potrebujem pomoc teraz"
        onPress={() => router.push("/now")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          padding: 15,
          borderRadius: 18,
          borderColor: theme.border,
          borderWidth: 1,
          backgroundColor: theme.card,
        }}
      >
        <Icon name="medical-outline" color={theme.danger} />
        <Text
          style={{
            flex: 1,
            color: theme.text,
            fontWeight: "700",
            fontSize: 14,
          }}
        >
          Potrebujem pomoc teraz
        </Text>
        <Icon name="chevron-forward" size={17} />
      </Pressable>
      <SectionTitle
        title="Čo dnes pripravíme?"
        subtitle="Vaše každodenné nástroje, vždy poruke."
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Tile
          icon="cube-outline"
          title="Moje zásoby"
          subtitle={`${data.inventory.length} položiek v domácnosti`}
          onPress={() => router.push("/inventory")}
        />
        <Tile
          icon="bag-handle-outline"
          title="Evakuačný plán"
          subtitle="Batoh, kontakty a miesto stretnutia"
          tone="orange"
          onPress={() => router.push("/plan")}
        />
        <Tile
          icon="cart-outline"
          title="Nákupný zoznam"
          subtitle="Nakúpte to, čo naozaj chýba"
          tone="blue"
          onPress={() => router.push("/shopping")}
        />
        <Tile
          icon="compass-outline"
          title="Akadémia READY"
          subtitle="Praktické návody krok za krokom"
          tone="purple"
          onPress={() => router.push("/help")}
        />
      </View>
      <SectionTitle
        title="Pripravenosť sa dá naučiť"
        action="Všetky kroky"
        onPress={() => router.push("/missions")}
      />
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          <View
            style={{
              height: 58,
              width: 58,
              borderRadius: 20,
              backgroundColor: theme.sage,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="trail-sign-outline" size={30} />
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Text
              style={{ fontSize: 18, fontWeight: "800", color: theme.text }}
            >
              7 malých krokov k plánu
            </Text>
            <T muted>Bez tlaku. Vlastným tempom.</T>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 7 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <View
              key={i}
              style={{
                height: 7,
                borderRadius: 4,
                flex: 1,
                backgroundColor:
                  i < missionCount ? theme.primary : theme.border,
              }}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pokračovať v 7 krokoch"
          onPress={() => router.push("/missions")}
          style={{
            minHeight: 48,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{ color: theme.primary, fontWeight: "800", fontSize: 14 }}
          >
            {missionCount} zo 7 krokov hotových · Pokračovať
          </Text>
          <Icon name="arrow-forward" size={20} />
        </Pressable>
      </Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Otvoriť video akadémiu"
        onPress={() => router.push("/videos")}
        style={{
          borderRadius: 26,
          backgroundColor: theme.blue,
          padding: 23,
          flexDirection: "row",
          alignItems: "center",
          gap: 18,
        }}
      >
        <View
          style={{
            height: 66,
            width: 66,
            borderRadius: 23,
            backgroundColor: "#234954",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="play" size={30} color="#F0F8EC" />
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Text
            style={{
              color: theme.primary,
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1.7,
            }}
          >
            POZRITE SI TO V PRAXI
          </Text>
          <Text style={{ color: theme.text, fontSize: 21, fontWeight: "800" }}>
            Menej čítania.{`\n`}Viac porozumenia.
          </Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>
            Témy a vyhľadávanie na YouTube · online
          </Text>
        </View>
        <Icon name="arrow-forward" size={20} />
      </Pressable>
      {alerts.length ? (
        <>
          <SectionTitle title="Dajte zásobám druhý pohľad" />
          {alerts.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Skontrolovať: ${item.name}`}
              onPress={() =>
                router.push({ pathname: "/item", params: { id: item.id } })
              }
            >
              <Card>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  <Icon name="time-outline" color={theme.warning} />
                  <View style={{ flex: 1 }}>
                    <T>{item.name}</T>
                    <T muted>
                      {item.expiry} ·{" "}
                      {expiryStatus(item) === "past"
                        ? "po uvedenom dátume"
                        : "v najbližších 30 dňoch"}
                    </T>
                  </View>
                  <Icon name="chevron-forward" size={18} />
                </View>
              </Card>
            </Pressable>
          ))}
        </>
      ) : null}
      {c.unknown > 0 || c.expired > 0 || c.missingKcal > 0 ? (
        <View style={{ gap: 6 }}>
          {c.unknown > 0 ? (
            <T muted>Neznáme kcal: {c.unknown} položiek. Nie sú započítané.</T>
          ) : null}
          {c.expired > 0 ? (
            <T muted>
              Po dátume: {c.expired} položiek, nezapočítavajú sa do krytia.
            </T>
          ) : null}
          {c.missingKcal > 0 ? (
            <T muted>Do cieľa chýba {fmt(c.missingKcal)} kcal.</T>
          ) : null}
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Spoznať smerovanie READY Plus"
        onPress={() => router.push("/plus")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          gap: 13,
        }}
      >
        <Icon name="sparkles-outline" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: theme.text }}>
            Priestor pre viac. READY Plus.
          </Text>
          <Text style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>
            Pozrite si plán rozšírení. Základná pomoc zostáva zadarmo.
          </Text>
        </View>
        <Icon name="chevron-forward" size={19} />
      </Pressable>
      <T muted>{nutritionNote}</T>
    </Screen>
  );
}
