import { HomeScene } from "../../components/home-scene";
import { HomeMetrics } from "../../components/home-metrics";
import { ExplanationCard } from "../../components/explanation";
import { civilProtectionGuides } from "../../data/civil-protection";
import { LocalizedPressable as Pressable } from "../../components/localized-native";
import {
  LocalizedText as Text,
  useLocale,
} from "../../components/localized-text";
import { View } from "react-native";
import { router } from "expo-router";
import { Card, Screen, T } from "../../components/ui";
import { Icon, IconButton, SectionTitle, Tile } from "../../components/visual";
import { coverage, expiryStatus } from "../../domain/readiness";
import { useStore } from "../../state/store";
import { nutritionNote } from "../../data/content";
import { formatNumber as fmt, translateText as t } from "../../i18n";
import { missionProgress } from "../../domain/missions";
import { useTheme } from "../../theme/theme";
export default function Home() {
  useLocale();
  const { data } = useStore(),
    theme = useTheme();
  if (!data?.household) return null;
  const p = data.household,
    c = coverage(p, data.inventory),
    tasks = data.checklists.filter(
      (x) =>
        x.topic === "evakuácia" &&
        !x.id.startsWith("bookmark-") &&
        !x.id.startsWith("kit-") &&
        !x.id.startsWith("drill-") &&
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
      subtitle={`${p.name || t("Vaša domácnosť")} · ${t(`Počet osôb: ${p.people}`)} · ${t("Cieľ zásob v dňoch")}: ${p.goal}`}
      subtitleTranslate={false}
      eyebrow="POKOJ SA ZAČÍNA PRÍPRAVOU"
      headerRight={
        <IconButton
          name="settings-outline"
          label="Nastavenia domácnosti"
          onPress={() => router.push("/settings")}
        />
      }
    >
      <HomeScene />
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
          borderColor: theme.danger,
          borderWidth: 1,
          backgroundColor: theme.danger,
        }}
      >
        <Icon name="medical-outline" color={theme.onPrimary} />
        <Text
          style={{
            flex: 1,
            color: theme.onPrimary,
            fontWeight: "700",
            fontSize: 14,
          }}
        >
          Potrebujem pomoc teraz
        </Text>
        <Icon name="chevron-forward" color={theme.onPrimary} size={17} />
      </Pressable>
      <SectionTitle
        title="Váš domov v číslach"
        action="Profil"
        onPress={() => router.push("/settings")}
      />
      <HomeMetrics
        foodDays={c.foodDays}
        waterDays={c.waterDays}
        goal={p.goal}
        done={completed}
        total={tasks.length}
      />
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

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Tile
          icon="bag-handle-outline"
          title="Môj 72-hodinový batoh"
          subtitle="Vizuálne balenie a vlastný pokrok"
          onPress={() => router.push("/field-kit")}
        />
        <Tile
          icon="git-branch-outline"
          title="Čo ak sa to stane?"
          subtitle="Precvičte si rozhodnutia v scenároch"
          tone="blue"
          onPress={() => router.push("/scenarios")}
        />
      </View>
      <ExplanationCard topic="coverage" />
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
          title="Akadémia BE READY"
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
      <SectionTitle title="CIVILNÁ OCHRANA" />
      {civilProtectionGuides.map((guide) => (
        <Tile
          fullWidth
          key={guide.id}
          icon={
            guide.id === "armed-conflict"
              ? "shield-checkmark-outline"
              : "home-outline"
          }
          title={guide.title}
          subtitle={guide.summary}
          tone="blue"
          onPress={() =>
            router.push({ pathname: "/guide", params: { id: guide.id } })
          }
        />
      ))}
      <Tile
        fullWidth
        icon="play-circle-outline"
        title="Animované postupy"
        subtitle="Pozrite si jednotlivé úkony v pohybe."
        tone="orange"
        onPress={() => router.push("/animations")}
      />
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
                    <T translate={false}>{item.name}</T>
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
        accessibilityLabel="Spoznať smerovanie BE READY Plus"
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
            Priestor pre viac. BE READY Plus.
          </Text>
          <Text style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>
            Pozrite si plán rozšírení. Offline režim s ročnou licenciou.
          </Text>
        </View>
        <Icon name="chevron-forward" size={19} />
      </Pressable>
      <T muted>{nutritionNote}</T>
    </Screen>
  );
}
