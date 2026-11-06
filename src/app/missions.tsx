import { ExplanationCard } from "../components/explanation";
import { LocalizedPressable as Pressable } from "../components/localized-native";
import { LocalizedText as Text } from "../components/localized-text";
import { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
import { useStore } from "../state/store";
import { useTheme } from "../theme/theme";
import {
  gradeMissionQuiz,
  missionProgress,
  missionRecord,
} from "../domain/missions";
import { missions, type Mission } from "../data/missions";
import { IconButton } from "../components/visual";

function MissionCard({
  mission,
  number,
  done,
  expanded,
  onExpand,
}: {
  mission: Mission;
  number: number;
  done: boolean;
  expanded: boolean;
  onExpand: () => void;
}) {
  const c = useTheme(),
    s = useStore(),
    a = useAction(),
    [answer, setAnswer] = useState<number | null>(null);
  const grade = answer === null ? null : gradeMissionQuiz(mission, answer);
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ alignItems: "center", width: 34 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: done ? c.primary : c.card,
            borderColor: done ? c.primary : c.border,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {done ? (
            <Ionicons
              name="checkmark"
              size={20}
              color={c.dark ? "#10202C" : "#FFF"}
            />
          ) : (
            <Text style={{ fontWeight: "800", fontSize: 14, color: c.muted }}>
              {String(number).padStart(2, "0")}
            </Text>
          )}
        </View>
        <View
          style={{
            width: 2,
            backgroundColor: c.border,
            flex: 1,
            minHeight: 24,
            marginTop: 6,
          }}
        />
      </View>
      <View style={{ flex: 1, paddingBottom: 18 }}>
        <Card>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${expanded ? "Zavrieť" : "Otvoriť"} krok: ${mission.title}`}
            accessibilityState={{ expanded }}
            onPress={onExpand}
            style={{ gap: 14, minHeight: 100 }}
          >
            <Row>
              <View
                style={{
                  height: 50,
                  width: 50,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: mission.color + "18",
                }}
              >
                <Ionicons name={mission.icon} size={28} color={mission.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    letterSpacing: 1.4,
                    color: c.primary,
                  }}
                >
                  {mission.eyebrow}
                </Text>
                <Text style={{ fontSize: 12, color: c.muted, marginTop: 4 }}>
                  {mission.time} · {done ? "splnené" : "vlastným tempom"}
                </Text>
              </View>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                color={c.muted}
                size={20}
              />
            </Row>
            <T large>{mission.title}</T>
            <T muted>{mission.summary}</T>
          </Pressable>
          {expanded ? (
            <View style={{ gap: 16 }}>
              <View style={{ height: 1, backgroundColor: c.border }} />
              {mission.steps.map((step, index) => (
                <View key={step} style={{ flexDirection: "row", gap: 10 }}>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 9,
                      backgroundColor: c.tint,
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
                      {index + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <T>{step}</T>
                  </View>
                </View>
              ))}
              <Button
                title={mission.action.label}
                secondary
                onPress={() => router.push(mission.action.route)}
              />
              <View
                style={{
                  padding: 14,
                  backgroundColor: c.bg,
                  borderRadius: 16,
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    letterSpacing: 1.5,
                    fontWeight: "800",
                    color: c.primary,
                  }}
                >
                  SKÚSTE SI JEDNU OTÁZKU
                </Text>
                <T>{mission.quiz.question}</T>
                {mission.quiz.options.map((option, index) => (
                  <Pressable
                    key={option}
                    accessibilityRole="radio"
                    accessibilityLabel={option}
                    accessibilityState={{ checked: answer === index }}
                    onPress={() => setAnswer(index)}
                    style={{
                      padding: 12,
                      minHeight: 48,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: answer === index ? c.primary : c.border,
                      backgroundColor: answer === index ? c.tint : c.card,
                      flexDirection: "row",
                      gap: 9,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name={
                        answer === index
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={18}
                      color={answer === index ? c.primary : c.muted}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        lineHeight: 21,
                        color: c.text,
                      }}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
                {grade ? (
                  <View accessibilityRole="alert" style={{ gap: 5 }}>
                    <Text
                      style={{
                        fontWeight: "800",
                        color: grade.correct ? c.primary : c.warning,
                      }}
                    >
                      {grade.correct
                        ? "Presne tak."
                        : "Skúsme sa na to pozrieť spolu."}
                    </Text>
                    <T muted>{grade.explanation}</T>
                  </View>
                ) : null}
              </View>
              <ErrorText message={a.error} />
              <Button
                title={
                  done
                    ? "Vrátiť krok medzi nesplnené"
                    : "Tento krok som urobil/a"
                }
                secondary={done}
                disabled={s.busy || a.busy}
                onPress={() =>
                  void a.run(() =>
                    s.save("checklists", missionRecord(mission, !done)),
                  )
                }
              />
              <Text style={{ fontSize: 12, lineHeight: 18, color: c.muted }}>
                Označenie je vaše vlastné potvrdenie vykonanej úlohy. Aplikácia
                nekontroluje fyzickú výbavu ani nezaručuje bezpečnosť.
              </Text>
            </View>
          ) : null}
        </Card>
      </View>
    </View>
  );
}
export default function MissionsScreen() {
  const s = useStore(),
    c = useTheme(),
    progress = missionProgress(s.data?.checklists ?? []),
    [expanded, setExpanded] = useState<string | null>(
      progress.nextId ?? missions[0].id,
    );
  return (
    <Screen
      title="7 krokov k lepšiemu plánu"
      eyebrow="VAŠA MALÁ VÝPRAVA"
      subtitle="Pripravenosť nie je pretek. Vyberte si jeden malý krok na dnes."
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
          borderRadius: 28,
          backgroundColor: c.hero,
          padding: 23,
          overflow: "hidden",
          gap: 15,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: 80,
            borderWidth: 28,
            borderColor: "#234B59",
            right: -55,
            top: -60,
          }}
        />
        <Row>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 15,
              backgroundColor: "#28505A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="trail-sign-outline" size={26} color="#8EE1D2" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#8EE1D2",
                fontSize: 11,
                letterSpacing: 2,
                fontWeight: "800",
              }}
            >
              VAŠA MALÁ VÝPRAVA
            </Text>
            <Text style={{ fontSize: 14, color: "#C7D7E0", marginTop: 4 }}>
              Bez série dní. Bez výčitiek.
            </Text>
          </View>
        </Row>
        <Text
          style={{
            fontSize: 42,
            lineHeight: 48,
            fontWeight: "800",
            color: "#FFF",
          }}
        >
          {progress.completed}
          <Text style={{ fontSize: 22, color: "#91A9B7" }}>
            {" "}
            / {progress.total}
          </Text>
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: "#D8E6EB" }}>
          Každá dokončená úloha je konkrétny krok, nie percentuálna šanca na
          prežitie.
        </Text>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Dokončené kroky výpravy"
          accessibilityValue={{ min: 0, max: 7, now: progress.completed }}
          style={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "#31505F",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: 8,
              width: `${progress.percent}%`,
              backgroundColor: "#78DCC9",
              borderRadius: 4,
            }}
          />
        </View>
      </View>
      {progress.completed === progress.total ? (
        <Card>
          <T large>Dobrá práca. Plán žije ďalej.</T>
          <T muted>
            Občas skontrolujte zásoby, potreby domácnosti a kontakty. Ku
            ktorémukoľvek kroku sa môžete vrátiť.
          </T>
          <Button
            title="Vytvoriť rodinnú krízovú kartu"
            onPress={() => router.push("/household-card")}
          />
        </Card>
      ) : null}
      <View>
        {progress.items.map(({ mission, done }, index) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            number={index + 1}
            done={done}
            expanded={expanded === mission.id}
            onExpand={() =>
              setExpanded(expanded === mission.id ? null : mission.id)
            }
          />
        ))}
      </View>
      <Text style={{ fontSize: 13, lineHeight: 20, color: c.muted }}>
        Kroky aj ich dokončenie zostávajú v zariadení a sú súčasťou JSON zálohy.
        Poradie je odporúčané, žiadny krok nie je zamknutý.
      </Text>
      <ExplanationCard topic="missions" />
    </Screen>
  );
}
