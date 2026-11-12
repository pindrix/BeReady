import {
  AnimationScene as Scene,
  animationKindArt as kinds,
} from "../components/animation-scene";
import { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { LocalizedPressable as Pressable } from "../components/localized-native";
import { LocalizedText as Text, useLocale } from "../components/localized-text";
import { Screen, Card, Button, T, Row, Field } from "../components/ui";
import {
  Badge,
  Callout,
  Icon,
  IconButton,
  SectionTitle,
} from "../components/visual";
import { AcademyArt } from "../components/academy-art";
import {
  animationTutorials,
  getTutorial,
  type Tutorial,
} from "../data/tutorials";
import { useTutorialPlayer } from "../hooks/use-tutorial-player";
import { academyGuides } from "../data/academy";
import { translateText as t, isRTL } from "../i18n";
import { useTheme } from "../theme/theme";
function clock(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
function Player({ tutorial }: { tutorial: Tutorial }) {
  const c = useTheme(),
    locale = useLocale(),
    [active, setActive] = useState(true),
    trackWidth = useRef(0),
    player = useTutorialPlayer(tutorial, { active });
  useFocusEffect(
    useCallback(() => {
      setActive(true);
      return () => setActive(false);
    }, []),
  );
  const s = player.snapshot,
    step = tutorial.steps[s.stepIndex],
    source = academyGuides.find((g) => g.id === tutorial.guideId);
  return (
    <Screen
      title={tutorial.title}
      subtitle={tutorial.summary}
      eyebrow="ANIMOVANÉ POSTUPY"
      headerRight={
        <IconButton
          name="close-outline"
          label="Späť do knižnice"
          onPress={() => router.replace("/animations")}
        />
      }
    >
      {tutorial.warning ? (
        <Callout icon="information-circle-outline" title="Tréningová ukážka">
          <T>{tutorial.warning}</T>
          <Button
            title="Potrebujem pomoc teraz"
            secondary
            onPress={() => router.push("/now")}
          />
        </Callout>
      ) : null}
      <Card style={{ padding: 10, gap: 12 }}>
        <Scene
          tutorial={tutorial}
          step={s.stepIndex}
          progress={player.progress}
          phase={player.reducedMotion ? 1 : player.snapshot.stepProgress}
          motion={{
            playing: player.playing && !player.reducedMotion,
            durationMs: player.snapshot.stepDurationMs,
          }}
        />
        <View
          testID="current-step-caption"
          accessibilityLiveRegion="polite"
          style={{ paddingHorizontal: 10, paddingVertical: 8, gap: 8 }}
        >
          <Badge label={`Krok ${s.stepIndex + 1} z ${tutorial.steps.length}`} />
          <T large>{step.title}</T>
          <T>{step.body}</T>
          {s.isComplete ? <Badge label="Ukážka dokončená" /> : null}
        </View>
        <View style={{ paddingHorizontal: 10, gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Badge
              label={`Krok ${s.stepIndex + 1} z ${tutorial.steps.length}`}
            />
            <Text
              translate={false}
              style={{
                fontSize: 13,
                color: c.muted,
                fontVariant: ["tabular-nums"],
              }}
            >
              {clock(s.playheadMs)} / {clock(s.totalDurationMs)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="adjustable"
            accessibilityLabel="Posun prehrávania"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: Math.round(s.progress * 100),
            }}
            accessibilityActions={[
              { name: "increment" },
              { name: "decrement" },
            ]}
            onAccessibilityAction={(event) =>
              player.seek(
                s.progress +
                  (event.nativeEvent.actionName === "increment" ? 0.1 : -0.1),
              )
            }
            onLayout={(event) => {
              trackWidth.current = event.nativeEvent.layout.width;
            }}
            onPress={(event) => {
              if (trackWidth.current > 0) {
                const ratio = event.nativeEvent.locationX / trackWidth.current;
                player.seek(isRTL(locale) ? 1 - ratio : ratio);
              }
            }}
            style={{ minHeight: 48, justifyContent: "center" }}
          >
            <View
              style={{
                height: 8,
                backgroundColor: c.border,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 8,
                  width: `${s.progress * 100}%`,
                  backgroundColor: c.primary,
                  borderRadius: 8,
                }}
              />
            </View>
          </Pressable>
          <Row>
            <IconButton
              name="play-skip-back"
              label="Predchádzajúci krok"
              disabled={s.stepIndex === 0}
              onPress={() => player.goToStep(s.stepIndex - 1)}
            />
            <View style={{ flex: 1 }}>
              <Button
                title={player.playing ? "Pozastaviť" : "Prehrať"}
                disabled={!player.motionReady || player.reducedMotion}
                onPress={player.playing ? player.pause : player.play}
              />
            </View>
            <IconButton
              name="play-skip-forward"
              label="Ďalší krok"
              disabled={s.stepIndex === tutorial.steps.length - 1}
              onPress={() => player.goToStep(s.stepIndex + 1)}
            />
          </Row>
          <Button title="Od začiatku" secondary onPress={player.restart} />
          <T muted>
            {!["adult-cpr", "bleeding", "burns"].includes(tutorial.kind)
              ? "Animácia znázorňuje postup, nie rýchlosť skutočného zásahu."
              : "Čas patrí animácii, nie trvaniu ošetrenia."}
          </T>
        </View>
      </Card>
      {!player.motionReady ? (
        <T muted>Načítavam nastavenie pohybu…</T>
      ) : player.reducedMotion ? (
        <Callout icon="accessibility-outline" title="Statická ukážka">
          <T>
            V zariadení máte zapnuté obmedzenie pohybu. Zobrazuje sa statická
            ukážka.
          </T>
        </Callout>
      ) : (
        <T muted>Animácia znázorňuje postup, nie rýchlosť skutočného zásahu.</T>
      )}
      <SectionTitle title="Jednotlivé kroky" />
      {tutorial.steps.map((item, i) => (
        <Pressable
          key={i}
          accessibilityRole="button"
          accessibilityLabel={item.title}
          accessibilityState={{ selected: i === s.stepIndex }}
          onPress={() => player.goToStep(i)}
          style={{
            padding: 18,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: i === s.stepIndex ? c.primary : c.border,
            backgroundColor: i === s.stepIndex ? c.tint : c.card,
            flexDirection: "row",
            gap: 14,
            alignItems: "center",
          }}
        >
          <View
            style={{
              height: 34,
              width: 34,
              borderRadius: 12,
              backgroundColor: c.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              translate={false}
              style={{ fontSize: 18, fontWeight: "800", color: c.primary }}
            >
              {i + 1}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <T>{item.title}</T>
          </View>
          <Icon
            name={i === s.stepIndex ? "play-circle-outline" : "chevron-forward"}
            size={22}
          />
        </Pressable>
      ))}
      <Callout icon="book-outline" title="ZDROJ A KONTROLA">
        <T>{tutorial.sourceName ?? source?.sourceName ?? "BE READY"}</T>
        <T muted>{tutorial.sourceUrl ?? source?.source ?? ""}</T>
        <T muted>
          Aktuálnosť externého zdroja nebola v tomto prostredí overená. Pri
          konkrétnej udalosti majú prednosť miestne pokyny úradov.
        </T>
        <Button
          title="Zobraziť celý postup"
          secondary
          onPress={() =>
            router.push({
              pathname: "/guide",
              params: { id: tutorial.guideId },
            })
          }
        />
      </Callout>
    </Screen>
  );
}
export default function AnimationsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>(),
    tutorial = id ? getTutorial(id) : undefined,
    c = useTheme(),
    [query, setQuery] = useState("");
  useLocale();
  const fold = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
  const visible = animationTutorials.filter((item) =>
    fold(item.title + " " + t(item.title) + " " + t(item.summary)).includes(
      fold(query),
    ),
  );
  if (id && !tutorial)
    return (
      <Screen title="Postup sa nenašiel">
        <T>Vyberte si inú ukážku z knižnice.</T>
        <Button
          title="Späť do knižnice"
          onPress={() => router.replace("/animations")}
        />
      </Screen>
    );
  if (tutorial) return <Player key={tutorial.id} tutorial={tutorial} />;
  return (
    <Screen
      title="Pozrite si, ako na to."
      subtitle="Ilustrované úkony krok za krokom. Prehrávanie spúšťate sami."
      eyebrow="ANIMOVANÉ POSTUPY"
      headerRight={
        <IconButton
          name="close-outline"
          label="Späť"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/help")
          }
        />
      }
    >
      <Callout icon="cloud-offline-outline" title="Pribalené v aplikácii">
        <T>
          Animácie sa nesťahujú z internetu. Offline sú dostupné s platnou
          licenciou.
        </T>
      </Callout>
      <Field label="Vyhľadať návod" value={query} onChange={setQuery} />
      {visible.length === 0 ? <T>Postup sa nenašiel</T> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {visible.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() =>
              router.push({ pathname: "/animations", params: { id: item.id } })
            }
            style={{
              flexGrow: 1,
              flexBasis: 145,
              minWidth: 135,
              backgroundColor: c.card,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: c.border,
              padding: 11,
              gap: 12,
            }}
          >
            <View>
              <AcademyArt
                kind={
                  academyGuides.find((g) => g.id === item.guideId)?.art ??
                  kinds[item.kind].art
                }
                color={
                  academyGuides.find((g) => g.id === item.guideId)?.color ??
                  kinds[item.kind].color
                }
                height={125}
              />
              <View
                style={{
                  position: "absolute",
                  right: 9,
                  bottom: 9,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: c.card,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="play" size={18} />
              </View>
            </View>
            <Text
              style={{
                fontSize: 17,
                lineHeight: 23,
                fontWeight: "800",
                color: c.text,
                paddingHorizontal: 4,
              }}
            >
              {item.title}
            </Text>
            <View style={{ paddingHorizontal: 4, paddingBottom: 7 }}>
              <Badge
                label={`${item.steps.length} krokov · animácia`}
                tone="neutral"
              />
            </View>
          </Pressable>
        ))}
      </View>
      <Callout icon="medical-outline" title="Prvá pomoc">
        <T>
          Ak ide o skutočnú núdzu, volajte 112 alebo 155 a riaďte sa operátorom.
        </T>
        <Button
          title="Potrebujem pomoc teraz"
          secondary
          onPress={() => router.push("/now")}
        />
      </Callout>
    </Screen>
  );
}
