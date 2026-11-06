import { LocalizedPressable as Pressable } from "../components/localized-native";
import { LocalizedText as Text, useLocale } from "../components/localized-text";
import { translateText as t } from "../i18n";
import { getTutorialsForGuide } from "../data/tutorials";
import { useState } from "react";
import { Linking, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AcademyArt } from "../components/academy-art";
import {
  Button,
  Card,
  ErrorText,
  Progress,
  Row,
  Screen,
  T,
  useAction,
} from "../components/ui";
import { Badge, Callout, Icon, IconButton } from "../components/visual";
import {
  academyGuides,
  guideBookmark,
  savedGuideIds,
  type AcademyGuide,
} from "../data/academy";
import { disclaimer } from "../data/content";
import { useStore } from "../state/store";
import { useTheme } from "../theme/theme";
function Reader({ guide }: { guide: AcademyGuide }) {
  useLocale();
  const c = useTheme(),
    s = useStore(),
    a = useAction(),
    [index, setIndex] = useState(0),
    [overview, setOverview] = useState(false);
  const saved = savedGuideIds(s.data?.checklists ?? []).includes(guide.id),
    step = guide.steps[index],
    last = index === guide.steps.length - 1;
  return (
    <Screen
      title={guide.title}
      subtitle={guide.summary}
      eyebrow={guide.eyebrow}
      headerRight={
        <IconButton
          name={saved ? "bookmark" : "bookmark-outline"}
          label={saved ? "Odstrániť záložku" : "Uložiť návod"}
          onPress={() => {
            if (!s.busy)
              void a.run(() =>
                s.save("checklists", guideBookmark(guide, !saved)),
              );
          }}
        />
      }
    >
      <Row>
        <Button
          title="Späť do knižnice"
          secondary
          onPress={() => router.back()}
        />
        <Badge label={`${guide.minutes} MIN · OFFLINE`} />
      </Row>
      <AcademyArt kind={guide.art} color={guide.color} height={210} />
      {getTutorialsForGuide(guide.id).map((item) => (
        <Button
          key={item.id}
          title={`${t("Animácia")}: ${t(item.title)}`}
          onPress={() =>
            router.push({ pathname: "/animations", params: { id: item.id } })
          }
        />
      ))}
      <ErrorText message={a.error} />
      <Progress
        value={((index + 1) / guide.steps.length) * 100}
        label={`Krok ${index + 1} z ${guide.steps.length}`}
      />
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 47,
              height: 47,
              borderRadius: 16,
              backgroundColor: c.tint,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "800", color: c.primary }}>
              {String(index + 1).padStart(2, "0")}
            </Text>
          </View>
          <Text
            style={{
              flex: 1,
              fontSize: 22,
              lineHeight: 29,
              fontWeight: "800",
              color: c.text,
              letterSpacing: -0.4,
            }}
          >
            {step.title}
          </Text>
        </View>
        <T>{step.body}</T>
        <View style={{ flexDirection: "row", gap: 7, paddingVertical: 4 }}>
          {guide.steps.map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 4,
                backgroundColor: i <= index ? c.primary : c.border,
              }}
            />
          ))}
        </View>
        <Row>
          <Button
            title="Predchádzajúci krok"
            secondary
            disabled={index === 0}
            onPress={() => setIndex((i) => i - 1)}
          />
          <Button
            title={last ? "Späť do knižnice po dočítaní" : "Ďalší krok"}
            onPress={() => (last ? router.back() : setIndex((i) => i + 1))}
          />
        </Row>
      </Card>
      <Callout icon="bulb-outline" title="To najdôležitejšie">
        <T>{guide.takeaway}</T>
      </Callout>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          overview ? "Zavrieť celý postup" : "Zobraziť celý postup"
        }
        onPress={() => setOverview(!overview)}
        style={{
          minHeight: 50,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 4,
        }}
      >
        <T>{overview ? "Zavrieť celý postup" : "Chcem vidieť celý postup"}</T>
        <Icon name={overview ? "chevron-up" : "chevron-down"} size={20} />
      </Pressable>
      {overview
        ? guide.steps.map((item, i) => (
            <Card key={i}>
              <T large>
                {i + 1}. {item.title}
              </T>
              <T>{item.body}</T>
            </Card>
          ))
        : null}
      <Button
        title="Nájsť súvisiace videá na YouTube"
        secondary
        onPress={() =>
          router.push({ pathname: "/videos", params: { query: guide.title } })
        }
      />
      <Card>
        <Badge label="ZDROJ A KONTROLA" tone="neutral" />
        <T>{guide.sourceName}</T>
        <T muted>
          Redakčná kontrola pribaleného textu: {guide.reviewed}. Aktuálnosť
          externého zdroja nebola v tomto prostredí overená. Pri konkrétnej
          udalosti majú prednosť miestne pokyny úradov.
        </T>
        <T muted>{guide.source}</T>
        <Button
          title="Otvoriť oficiálny zdroj (online)"
          secondary
          onPress={() =>
            void a.run(async () => {
              await Linking.openURL(guide.source);
            })
          }
        />
      </Card>
      <T muted>{disclaimer}</T>
    </Screen>
  );
}
export default function GuideScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>(),
    guide = academyGuides.find((g) => g.id === id);
  if (!guide)
    return (
      <Screen title="Návod sa nenašiel">
        <T>Táto téma nie je súčasťou aktuálnej offline knižnice.</T>
        <Button title="Späť" onPress={() => router.back()} />
      </Screen>
    );
  return <Reader key={guide.id} guide={guide} />;
}
