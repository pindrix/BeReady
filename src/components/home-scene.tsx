import { View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import { useTheme } from "../theme/theme";
import { useCountry } from "./country-picker";
import { LocalizedPressable as Pressable } from "./localized-native";
import { LocalizedText as Text } from "./localized-text";
import { Badge, Icon, type IconName } from "./visual";
const zones = [
  {
    id: "water",
    label: "Pitná voda",
    icon: "water-outline" as IconName,
    x: 65,
    y: 70,
    path: "M650 467L830 430",
    route: { pathname: "/inventory" as const, params: { category: "voda" } },
  },
  {
    id: "food",
    label: "Jedlo",
    icon: "nutrition-outline" as IconName,
    x: 87,
    y: 38,
    path: "M870 253L840 360",
    route: { pathname: "/inventory" as const, params: { category: "jedlo" } },
  },
  {
    id: "family",
    label: "Rodinný plán",
    icon: "people-outline" as IconName,
    x: 30,
    y: 36,
    path: "M300 240L430 380",
    route: { pathname: "/plan" as const },
  },
];
/** A local architectural illustration with real navigation targets, never GPS or a safety assessment. */
export function HomeScene() {
  const c = useTheme(),
    country = useCountry();
  return (
    <LinearGradient
      colors={c.dark ? [c.hero, c.heroEnd] : [c.card, c.bg]}
      style={{
        borderRadius: c.radius,
        borderWidth: 1,
        borderColor: c.border,
        padding: 12,
        gap: 10,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Badge label="VÁŠ DOMÁCI PLÁN" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Krajina pobytu"
          onPress={() => router.push("/settings")}
          style={{
            minHeight: 44,
            paddingHorizontal: 10,
            borderRadius: 12,
            backgroundColor: c.card,
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Icon name="location-outline" size={15} />
          <Text
            translate={false}
            style={{
              color: c.text,
              fontSize: 12,
              fontWeight: "700",
              flexShrink: 1,
            }}
          >
            {country?.name ?? "—"}
          </Text>
        </Pressable>
      </View>
      <View style={{ width: "100%", aspectRatio: 1.5 }}>
        <Image
          source={
            c.dark
              ? require("../../assets/images/be-ready-house-aurora.webp")
              : require("../../assets/images/be-ready-house-atlas.webp")
          }
          contentFit="contain"
          style={{ position: "absolute", width: "100%", height: "100%" }}
          accessible={false}
        />
        <View
          pointerEvents="none"
          style={{ position: "absolute", width: "100%", height: "100%" }}
        >
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 667"
            accessible={false}
          >
            {zones.map((z) => (
              <Path
                key={z.id}
                d={z.path}
                stroke={c.primary}
                strokeWidth={4}
                fill="none"
                opacity={0.8}
              />
            ))}
          </Svg>
        </View>
        {zones.map((zone) => (
          <Pressable
            key={zone.id}
            testID={"house-zone-" + zone.id}
            accessibilityRole="button"
            accessibilityLabel={zone.label}
            onPress={() => router.push(zone.route)}
            style={({ pressed }) => ({
              position: "absolute",
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              marginLeft: -24,
              marginTop: -24,
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: c.dark ? "rgba(8,15,31,.85)" : c.card,
              borderWidth: 2,
              borderColor: c.primary,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.92 : 1 }],
              boxShadow: c.dark
                ? "0px 0px 14px rgba(105,232,212,.28)"
                : undefined,
            })}
          >
            <Icon name={zone.icon} size={23} />
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
        {zones.map((zone) => (
          <Pressable
            key={zone.id}
            accessibilityRole="button"
            accessibilityLabel={zone.label}
            onPress={() => router.push(zone.route)}
            style={({ pressed }) => ({
              flex: 1,
              minWidth: 68,
              minHeight: 48,
              borderRadius: c.buttonRadius,
              padding: 8,
              backgroundColor: c.tint,
              opacity: pressed ? 0.7 : 1,
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <Text
              style={{
                color: c.primary,
                fontSize: 12,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {zone.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </LinearGradient>
  );
}
