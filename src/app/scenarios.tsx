import { ExplanationCard } from "../components/explanation";
import { LocalizedPressable as Pressable } from "../components/localized-native";
import { LocalizedText as Text } from "../components/localized-text";
import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AcademyArt } from "../components/academy-art";
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
} from "../components/visual";
import { scenarios, type Scenario } from "../data/scenarios";
import {
  activeScenarioNode,
  chooseScenario,
  completedDrills,
  findScenario,
  scenarioBreadcrumbs,
  scenarioCompletion,
  type ScenarioPath,
} from "../domain/scenarios";
import { useStore } from "../state/store";
import { useTheme } from "../theme/theme";
function Player({
  scenario,
  onExit,
}: {
  scenario: Scenario;
  onExit: () => void;
}) {
  const c = useTheme(),
    s = useStore(),
    action = useAction(),
    [path, setPath] = useState<ScenarioPath>([]);
  const { node } = activeScenarioNode(scenario, path),
    breadcrumbs = scenarioBreadcrumbs(scenario, path),
    done = completedDrills(s.data?.checklists ?? []).includes(scenario.id);
  return (
    <Screen
      title={scenario.title}
      subtitle="Rozhodovací nácvik — nie živé vyhodnotenie núdzovej udalosti."
      eyebrow="ROZHODNITE SA NANEČISTO"
      headerRight={
        <IconButton
          name="close-outline"
          label="Zmeniť scenár"
          onPress={onExit}
        />
      }
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Badge label="VŠETKO PRIBALENÉ · OFFLINE" />
        <Badge
          label={
            node.kind === "outcome"
              ? "VÝSLEDOK NÁCVIKU"
              : `OTÁZKA ${path.length + 1}`
          }
          tone="blue"
        />
      </View>
      <AcademyArt kind={scenario.art} color={scenario.color} height={165} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Potrebujem skutočnú pomoc teraz"
        onPress={() => router.push("/now")}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: 50,
          borderWidth: 1,
          borderColor: c.danger,
          borderRadius: 18,
          flexDirection: "row",
          alignItems: "center",
          gap: 11,
        }}
      >
        <Icon name="medical-outline" color={c.danger} size={21} />
        <Text
          style={{ color: c.danger, fontSize: 14, fontWeight: "800", flex: 1 }}
        >
          Je to skutočná núdza? Otvoriť rýchlu pomoc
        </Text>
        <Icon name="arrow-forward" color={c.danger} size={19} />
      </Pressable>
      {breadcrumbs.length ? (
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1.5,
              color: c.muted,
            }}
          >
            VAŠA CESTA
          </Text>
          {breadcrumbs.map((choice, i) => (
            <View
              key={`${choice.id}-${i}`}
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: c.tint,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "800", color: c.primary }}
                >
                  {i + 1}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 18,
                  color: c.muted,
                  flex: 1,
                }}
              >
                {choice.label}
              </Text>
              <Icon name="checkmark" size={16} />
            </View>
          ))}
        </View>
      ) : null}
      <Card>
        <View style={{ flexDirection: "row", gap: 13, alignItems: "center" }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              backgroundColor:
                node.kind === "outcome" && node.urgent ? c.peach : c.tint,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={
                node.kind === "question"
                  ? "git-branch-outline"
                  : node.urgent
                    ? "alert-circle-outline"
                    : "bulb-outline"
              }
              color={
                node.kind === "outcome" && node.urgent ? c.danger : c.primary
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              accessibilityRole="header"
              style={{
                fontSize: 23,
                lineHeight: 29,
                fontWeight: "800",
                letterSpacing: -0.5,
                color: c.text,
              }}
            >
              {node.title}
            </Text>
          </View>
        </View>
        <T muted>{node.body}</T>
        {node.kind === "question" ? (
          <View style={{ gap: 11 }}>
            {node.choices.map((choice, i) => (
              <Pressable
                key={choice.id}
                accessibilityRole="button"
                accessibilityLabel={choice.label}
                onPress={() =>
                  setPath((p) => chooseScenario(scenario, p, choice.id))
                }
                style={({ pressed }) => ({
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 19,
                  padding: 16,
                  minHeight: 76,
                  backgroundColor: pressed ? c.tint : c.bg,
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                })}
              >
                <View
                  style={{
                    width: 29,
                    height: 29,
                    borderRadius: 10,
                    backgroundColor: c.card,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      color: c.primary,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      lineHeight: 22,
                      color: c.text,
                    }}
                  >
                    {choice.label}
                  </Text>
                  <Text
                    style={{ fontSize: 12, lineHeight: 18, color: c.muted }}
                  >
                    {choice.detail}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={17} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {node.urgent ? (
              <Badge
                label="PRI SKUTOČNOM OHROZENÍ KONAJTE TERAZ"
                tone="orange"
              />
            ) : null}
            {node.actions.map((text, i) => (
              <View key={text} style={{ flexDirection: "row", gap: 13 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    backgroundColor: c.tint,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: c.primary,
                    }}
                  >
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <T>{text}</T>
                </View>
              </View>
            ))}
            {node.urgent ? (
              <Button
                title="Otvoriť rýchlu pomoc"
                onPress={() => router.push("/now")}
              />
            ) : null}
            <Button
              title="Otvoriť súvisiaci offline návod"
              secondary
              onPress={() =>
                router.push({
                  pathname: "/guide",
                  params: { id: node.guideId },
                })
              }
            />
          </View>
        )}
      </Card>
      <Row>
        <Button
          title="Predchádzajúca otázka"
          secondary
          disabled={!path.length}
          onPress={() => setPath((p) => p.slice(0, -1))}
        />
        <Button
          title="Začať nácvik odznova"
          secondary
          disabled={!path.length}
          onPress={() => setPath([])}
        />
      </Row>
      {node.kind === "outcome" ? (
        <Card>
          <Text style={{ fontSize: 17, fontWeight: "800", color: c.text }}>
            Zapamätajte si užitočný krok.
          </Text>
          <T muted>
            Uloženie znamená iba to, že ste prešli nácvikom. Nehodnotí správnosť
            každej voľby a nie je dôkazom pripravenosti ani zdravotného stavu.
          </T>
          <ErrorText message={action.error} />
          <Button
            title={done ? "Nácvik je uložený" : "Uložiť absolvovaný nácvik"}
            disabled={done || s.busy || action.busy}
            onPress={() =>
              void action.run(() =>
                s.save("checklists", scenarioCompletion(scenario)),
              )
            }
          />
          <Button title="Vybrať iný scenár" secondary onPress={onExit} />
        </Card>
      ) : null}
      <T muted>
        Pri reálnej udalosti majú prednosť aktuálne pokyny úradov a záchranných
        zložiek. Na ďalšie rozhodnutie nemusíte dokončiť tento nácvik.
      </T>
      <ExplanationCard topic="scenarios" />
    </Screen>
  );
}
export default function ScenariosScreen() {
  const params = useLocalSearchParams<{ id?: string }>(),
    c = useTheme(),
    s = useStore(),
    [selected, setSelected] = useState<string | null>(
      params.id && findScenario(params.id) ? params.id : null,
    );
  const scenario = selected ? findScenario(selected) : undefined,
    completed = completedDrills(s.data?.checklists ?? []);
  if (scenario)
    return (
      <Player
        key={scenario.id}
        scenario={scenario}
        onExit={() => setSelected(null)}
      />
    );
  return (
    <Screen
      title="Čo urobím ako prvé?"
      subtitle="Päť situácií. Niekoľko rozhodnutí. Pokojný nácvik v bezpečných podmienkach — aj bez internetu."
      eyebrow="TRÉNING ROZHODOVANIA"
      headerRight={
        <IconButton
          name="close-outline"
          label="Späť z nácvikov"
          onPress={() => router.back()}
        />
      }
    >
      <View
        style={{
          padding: 24,
          borderRadius: 27,
          backgroundColor: c.hero,
          gap: 18,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1.8,
              color: "#C4D6C7",
            }}
          >
            NACVIČTE SI ROZHODNUTIE
          </Text>
          <Icon name="git-branch-outline" color="#D1EB9A" size={27} />
        </View>
        <Text
          style={{
            fontSize: 28,
            lineHeight: 34,
            fontWeight: "800",
            letterSpacing: -1,
            color: "#FFF9EA",
          }}
        >
          Plán je lepší,{`\n`}keď si ho vyskúšate.
        </Text>
        <View style={{ flexDirection: "row", gap: 7 }}>
          {scenarios.map((x) => (
            <View
              key={x.id}
              style={{
                height: 7,
                borderRadius: 4,
                flex: 1,
                backgroundColor: completed.includes(x.id)
                  ? "#D1EB9A"
                  : "#416356",
              }}
            />
          ))}
        </View>
        <Text style={{ fontSize: 12, color: "#C4D6C7" }}>
          {completed.length} z {scenarios.length} nácvikov označených ako
          absolvované
        </Text>
      </View>
      <Callout
        icon="information-circle-outline"
        title="Cvičenie, nie núdzová triáž"
      >
        <T muted>
          Otázky pomáhajú s prípravou. Pri skutočnom ohrození nečakajte na
          výsledok aplikácie.
        </T>
        <Button
          title="Potrebujem skutočnú pomoc teraz"
          secondary
          onPress={() => router.push("/now")}
        />
      </Callout>
      <SectionTitle
        title="Vyberte situáciu"
        subtitle="Každá voľba vedie k ďalšiemu kroku alebo konkrétnemu vysvetleniu."
      />
      {scenarios.map((item, i) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`Spustiť nácvik: ${item.title}`}
          onPress={() => setSelected(item.id)}
          style={({ pressed }) => ({
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 25,
            padding: 17,
            gap: 14,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <AcademyArt kind={item.art} color={item.color} height={135} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "800",
                color: c.primary,
                opacity: 0.55,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </Text>
            <View style={{ flex: 1, gap: 6 }}>
              <Text
                style={{
                  fontSize: 20,
                  lineHeight: 26,
                  fontWeight: "800",
                  letterSpacing: -0.4,
                  color: c.text,
                }}
              >
                {item.title}
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 19, color: c.muted }}>
                {item.summary}
              </Text>
            </View>
            <Icon name="arrow-forward" size={20} />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Badge label={`${item.duration} · OFFLINE`} tone="neutral" />
            {completed.includes(item.id) ? (
              <Badge label="NÁCVIK ULOŽENÝ" />
            ) : null}
          </View>
        </Pressable>
      ))}
      <T muted>
        Návody aj otázky sú pribalené v aplikácii. Internet potrebujete iba na
        otvorenie externých zdrojov; tento tréning si nič nenačítava zo siete.
      </T>
    </Screen>
  );
}
