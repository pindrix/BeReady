import { View } from "react-native";
import { useTheme } from "../theme/theme";
import { formatNumber as fmt } from "../i18n";
import { LocalizedText as Text } from "./localized-text";
import { Card, T } from "./ui";
import { Icon, type IconName } from "./visual";
export function HomeMetrics({
  foodDays,
  waterDays,
  goal,
  done,
  total,
}: {
  foodDays: number;
  waterDays: number;
  goal: number;
  done: number;
  total: number;
}) {
  const c = useTheme();
  const cards = [
    {
      title: "Energetické zásoby",
      value: `${fmt(foodDays)} dní jedla`,
      ratio: foodDays / goal,
      icon: "nutrition-outline" as IconName,
      color: c.dark ? "#A9E6BE" : "#426B4E",
    },
    {
      title: "Pitná voda",
      value: `${fmt(waterDays)} dní pitnej vody`,
      ratio: waterDays / goal,
      icon: "water-outline" as IconName,
      color: c.dark ? "#95DDF2" : "#32657B",
    },
  ];
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        {cards.map((item) => (
          <Card
            key={item.title}
            style={{ flex: 1, minWidth: 120, padding: 16, gap: 12 }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Icon name={item.icon} color={item.color} size={22} />
              <Text style={{ fontSize: 12, color: c.muted, flex: 1 }}>
                {item.title}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 22,
                lineHeight: 29,
                minHeight: 58,
                fontWeight: "800",
                color: c.text,
                fontVariant: ["tabular-nums"],
              }}
            >
              {item.value}
            </Text>
            <View
              accessibilityRole="progressbar"
              accessibilityLabel={item.title}
              accessibilityValue={{
                min: 0,
                max: 100,
                now: Math.round(Math.max(0, Math.min(1, item.ratio)) * 100),
              }}
              style={{
                height: 5,
                borderRadius: 5,
                backgroundColor: c.border,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 5,
                  width: `${Math.max(0, Math.min(1, item.ratio)) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </View>
          </Card>
        ))}
      </View>
      <Card style={{ padding: 16, gap: 7 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: c.muted }}>Evakuačný batoh</Text>
          <Text style={{ fontSize: 18, fontWeight: "800", color: c.primary }}>
            {done} / {total} úloh
          </Text>
        </View>
        <T muted>
          Prehľad porovnáva evidované zásoby s vaším cieľom. Nie je skóre
          bezpečnosti ani záruka pripravenosti.
        </T>
      </Card>
    </View>
  );
}
