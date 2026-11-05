import { LocalizedPressable as Pressable } from "../components/localized-native";
import { LocalizedText as Text } from "../components/localized-text";
import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import {
  Button,
  Card,
  Check,
  Choices,
  ErrorText,
  Progress,
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
} from "../components/visual";
import { useTheme } from "../theme/theme";
import { useStore } from "../state/store";
import { goals } from "../types/model";
import {
  kitItemRecord,
  kitPetsRecord,
  packingProgress,
  waterPackingPlan,
} from "../domain/field-kit";
import { formatNumber } from "../i18n";

/** Locally drawn bag map. Interactive controls below carry all accessible information. */
function BagDiagram({
  color,
  completed,
}: {
  color: string;
  completed: number;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 170, height: 195 }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 240 260" accessible={false}>
        <Circle cx={119} cy={132} r={112} fill="#FFFFFF" opacity={0.07} />
        <Path
          d="M83 47V32Q83 17 101 17H137Q155 17 155 32V47"
          fill="none"
          stroke="#BFD5BB"
          strokeWidth={10}
        />
        <Path
          d="M56 93Q28 94 29 132L33 210 58 214M181 93Q208 94 208 132L204 210 179 214"
          fill="#234E42"
          stroke="#B5CDB6"
          strokeWidth={3}
        />
        <Rect
          x={52}
          y={42}
          width={133}
          height={194}
          rx={33}
          fill="#6A9374"
          stroke="#DCE7CB"
          strokeWidth={3}
        />
        <Path
          d="M64 45H173V107Q119 135 64 107Z"
          fill="#E7E9CC"
          stroke="#DCE7CB"
          strokeWidth={2}
        />
        <Rect x={71} y={139} width={96} height={73} rx={18} fill={color} />
        <Path d="M84 154H154" stroke="#234E42" opacity={0.45} strokeWidth={3} />
        <Path d="M106 111V140M135 111V140" stroke="#234E42" strokeWidth={9} />
        <Rect x={99} y={120} width={17} height={19} rx={4} fill="#F5D595" />
        <Rect x={127} y={120} width={17} height={19} rx={4} fill="#F5D595" />
        {Array.from({ length: 7 }, (_, i) => (
          <Circle
            key={i}
            cx={72 + i * 16}
            cy={228}
            r={4.4}
            fill={i < completed ? "#D1EB9A" : "#3A6554"}
          />
        ))}
      </Svg>
    </View>
  );
}
function WaterTank({ fraction }: { fraction: number }) {
  const level = Math.max(0, Math.min(1, fraction));
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 80, height: 114 }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 140" accessible={false}>
        <Rect x={33} y={6} width={34} height={17} rx={5} fill="#285A62" />
        <Path
          d="M32 24H68V38Q83 44 83 62V124Q83 133 74 133H26Q17 133 17 124V62Q17 44 32 38Z"
          fill="#DFEFF1"
          stroke="#285A62"
          strokeWidth={3}
        />
        <Rect
          x={23}
          y={125 - level * 62}
          width={54}
          height={level * 62}
          rx={5}
          fill="#70BCD1"
        />
        <Path
          d="M35 54H57M34 63H48"
          stroke="white"
          strokeWidth={5}
          strokeLinecap="round"
        />
        <Path d="M29 106H71" stroke="#285A62" opacity={0.25} strokeWidth={2} />
      </Svg>
    </View>
  );
}
export default function FieldKitScreen() {
  const s = useStore(),
    c = useTheme(),
    action = useAction(),
    [selected, setSelected] = useState("water"),
    [days, setDays] = useState<number>(3);
  const progress = packingProgress(s.data?.checklists ?? []),
    active =
      progress.modules.find((x) => x.module.id === selected) ??
      progress.modules[0];
  const profile = s.data?.household;
  const water = profile
    ? waterPackingPlan(profile, s.data?.inventory ?? [], days)
    : null;
  const completedModules = progress.modules.filter(
    (x) => x.completed === x.total,
  ).length;
  return (
    <Screen
      title="Všetko má svoje miesto."
      subtitle="Vizuálna baliaca stanica. Začnite výbavou, ktorú už doma máte."
      eyebrow="OFFLINE VÝBAVA / 72 HODÍN"
      headerRight={
        <IconButton
          name="close-outline"
          label="Zavrieť baliacu stanicu"
          onPress={() => router.back()}
        />
      }
    >
      <View
        style={{
          backgroundColor: c.hero,
          borderRadius: 28,
          padding: 22,
          gap: 17,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <View style={{ flexGrow: 1, gap: 12, minWidth: 105 }}>
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 1.5,
                color: "#C6D7C3",
                fontWeight: "800",
              }}
            >
              VÁŠ EVAKUAČNÝ BATOH
            </Text>
            <Text
              style={{
                color: "#F6F6E7",
                fontWeight: "800",
                fontSize: 43,
                letterSpacing: -1,
              }}
            >
              {progress.completed}
              <Text
                style={{ fontSize: 20, fontWeight: "500", color: "#B7D0BF" }}
              >
                {" "}
                / {progress.total}
              </Text>
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 20, color: "#C1D6C7" }}>
              položiek označených{`\n`}ako pripravené
            </Text>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#365E4B",
                paddingHorizontal: 10,
                paddingVertical: 7,
                borderRadius: 13,
              }}
            >
              <Text
                style={{ fontSize: 11, color: "#E1EBCB", fontWeight: "700" }}
              >
                {completedModules} z {progress.modules.length} modulov
              </Text>
            </View>
          </View>
          <BagDiagram
            color={active.module.color}
            completed={Math.min(7, completedModules)}
          />
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Označená výbava"
          accessibilityValue={{
            min: 0,
            max: progress.total,
            now: progress.completed,
          }}
          style={{
            height: 7,
            borderRadius: 5,
            backgroundColor: "#365D50",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress.percent}%`,
              height: 7,
              backgroundColor: "#CCE99C",
            }}
          />
        </View>
        <Text style={{ fontSize: 11, lineHeight: 17, color: "#BCD1C3" }}>
          Odškrtnutie je vaša evidencia. Nie je to záruka bezpečnosti ani
          potvrdenie, že sa všetko zmestí do batoha.
        </Text>
      </View>
      <ErrorText message={action.error} />
      <SectionTitle
        title="Vyberte si priehradku"
        subtitle="Každá má tri praktické kroky. Stav zostane uložený aj po reštarte."
      />
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {progress.modules.map(({ module, completed, total }) => (
          <Pressable
            key={module.id}
            accessibilityRole="radio"
            accessibilityLabel={`${module.title}, ${completed} z ${total} pripravené`}
            accessibilityState={{ checked: active.module.id === module.id }}
            onPress={() => setSelected(module.id)}
            style={{
              flexGrow: 1,
              flexBasis: "44%",
              minWidth: 118,
              padding: 15,
              minHeight: 118,
              borderRadius: 21,
              borderWidth: active.module.id === module.id ? 2 : 1,
              borderColor:
                active.module.id === module.id ? c.primary : c.border,
              backgroundColor: active.module.id === module.id ? c.tint : c.card,
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <View
                style={{
                  height: 36,
                  width: 36,
                  borderRadius: 12,
                  backgroundColor: module.color,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name={module.icon} color="#264C40" size={21} />
              </View>
              <Text
                style={{ fontSize: 12, fontWeight: "800", color: c.primary }}
              >
                {completed}/{total}
              </Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: "800", color: c.text }}>
              {module.title}
            </Text>
          </Pressable>
        ))}
      </View>
      <Check
        label="Do výbavy patria aj domáce zvieratá"
        done={progress.includePets}
        disabled={s.busy || action.busy}
        onPress={() =>
          void action.run(async () => {
            await s.save("checklists", kitPetsRecord(!progress.includePets));
            if (progress.includePets && selected === "pets")
              setSelected("water");
          })
        }
      />
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              height: 48,
              width: 48,
              borderRadius: 16,
              backgroundColor: active.module.color,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={active.module.icon} color="#264C40" />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <T large>{active.module.title}</T>
            <T muted>{active.module.subtitle}</T>
          </View>
        </View>
        <Progress
          label="Priehradka"
          value={(active.completed / active.total) * 100}
        />
        {active.items.map((item) => (
          <View
            key={item.id}
            style={{
              gap: 3,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderColor: c.border,
            }}
          >
            <Check
              label={item.name}
              done={item.done}
              disabled={s.busy || action.busy}
              onPress={() =>
                void action.run(() =>
                  s.save("checklists", kitItemRecord(item, !item.done)),
                )
              }
            />
            <T muted>{item.detail}</T>
          </View>
        ))}
        <Button
          title={`Návod: ${active.module.title}`}
          secondary
          onPress={() =>
            router.push({
              pathname: "/guide",
              params: { id: active.module.guide },
            })
          }
        />
      </Card>
      <SectionTitle
        title="Koľko vody patrí do rezervy?"
        subtitle="Kalkulačka domácej zásoby. Nie pokyn naložiť všetko do batoha."
      />
      {water ? (
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
            <WaterTank fraction={water.coverage} />
            <View style={{ flex: 1, gap: 6 }}>
              <Badge label="PODĽA VÁŠHO PROFILU" tone="blue" />
              <Text
                accessibilityLabel={`Potrebná voda ${formatNumber(water.required)} litrov`}
                style={{
                  fontSize: 35,
                  fontWeight: "800",
                  color: c.text,
                  letterSpacing: -1,
                }}
              >
                {formatNumber(water.required)}{" "}
                <Text style={{ fontSize: 18 }}>l</Text>
              </Text>
              <T muted>
                {water.people} osôb × {formatNumber(water.perPerson)} l ×{" "}
                {water.days} dní
              </T>
            </View>
          </View>
          <Choices
            label="Cieľ vody v dňoch"
            values={goals}
            value={days}
            onChange={setDays}
          />
          <Progress
            label="Evidovaná pitná voda voči tomuto cieľu"
            value={water.coverage * 100}
          />
          <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
            <View style={{ flex: 1, minWidth: 100, gap: 5 }}>
              <T muted>Evidované</T>
              <T large>{formatNumber(water.stored)} l</T>
            </View>
            <View style={{ flex: 1, minWidth: 100, gap: 5 }}>
              <T muted>Ešte chýba</T>
              <T large>{formatNumber(water.missing)} l</T>
            </View>
          </View>
          <T muted>
            Vychádzame z vašich nastaviteľných predpokladov, nie z osobného
            zdravotného odporúčania. Voda pre zvieratá ani voda v potravinách
            nie sú automaticky započítané.
          </T>
          <Callout
            icon="bag-handle-outline"
            title="Domáca zásoba ≠ hmotnosť batoha"
          >
            <T muted>
              Samotná vypočítaná voda váži približne{" "}
              {formatNumber(water.waterMassApproxKg)} kg, bez obalov. Na presun
              voľte prenosnú výbavu, zohľadnite ľudí a dohodnite bezpečné
              doplnenie. Odchod podľa úradov neodkladajte balením.
            </T>
          </Callout>
          <Button
            title="Zaevidovať pitnú vodu"
            onPress={() =>
              router.push({ pathname: "/item", params: { category: "voda" } })
            }
          />
        </Card>
      ) : (
        <Card>
          <T>
            Najprv nastavte počet osôb a dennú potrebu vody v profile
            domácnosti.
          </T>
          <Button
            title="Otvoriť nastavenia domácnosti"
            onPress={() => router.push("/settings")}
          />
        </Card>
      )}
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        <Tile
          icon="book-outline"
          title="Návod k batohu"
          subtitle="Prehľadný postup aj bez internetu"
          onPress={() =>
            router.push({ pathname: "/guide", params: { id: "go-bag" } })
          }
        />
        <Tile
          icon="people-outline"
          title="Dohoda domácnosti"
          subtitle="Kontakty a miesto stretnutia"
          tone="blue"
          onPress={() => router.push("/plan")}
        />
      </View>
      <T muted>
        Obsah a ilustrácie sú súčasťou aplikácie. Na túto baliacu stanicu ani
        jej výpočty sa nevolá sieť. V konkrétnej udalosti majú prednosť pokyny
        záchranných zložiek a úradov.
      </T>
    </Screen>
  );
}
