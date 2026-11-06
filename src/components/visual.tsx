import { LocalizedPressable as Pressable } from "./localized-native";
import { LocalizedText as Text, useLocale } from "./localized-text";
import { isRTL, translateText as t } from "../i18n";
import { type ComponentProps, type ReactNode } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../theme/theme";
export type IconName = ComponentProps<typeof Ionicons>["name"];
export function Icon({
  name,
  size = 24,
  color,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const c = useTheme(),
    locale = useLocale();
  const mirror: Partial<Record<IconName, IconName>> = {
    "arrow-forward": "arrow-back",
    "arrow-back": "arrow-forward",
    "chevron-forward": "chevron-back",
    "chevron-back": "chevron-forward",
    "play-skip-back": "play-skip-forward",
    "play-skip-forward": "play-skip-back",
  };
  const icon = isRTL(locale) ? (mirror[name] ?? name) : name;
  return (
    <Ionicons
      name={icon}
      size={size}
      color={color ?? c.primary}
      accessible={false}
    />
  );
}
export function IconButton({
  name,
  label,
  onPress,
  disabled = false,
  prominent = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  prominent?: boolean;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={({ pressed }) => ({
        height: 48,
        width: 48,
        borderRadius: 24,
        backgroundColor: prominent ? c.primary : c.card,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : pressed ? 0.65 : 1,
        borderWidth: 1,
        borderColor: c.border,
      })}
    >
      <Icon name={name} color={prominent ? c.bg : c.primary} />
    </Pressable>
  );
}
export function Badge({
  label,
  tone = "green",
}: {
  label: string;
  tone?: "green" | "orange" | "blue" | "neutral";
}) {
  const c = useTheme();
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor:
          tone === "orange"
            ? c.peach
            : tone === "blue"
              ? c.blue
              : tone === "neutral"
                ? c.bg
                : c.tint,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "800",
          letterSpacing: 0.5,
          color: tone === "orange" ? c.warning : c.primary,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
export function SectionTitle({
  title,
  subtitle,
  action,
  onPress,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onPress?: () => void;
}) {
  const c = useTheme();
  return (
    <View style={{ gap: 5, marginTop: 5 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            fontSize: 22,
            lineHeight: 29,
            fontWeight: "800",
            letterSpacing: -0.6,
            color: c.text,
            flexShrink: 1,
          }}
        >
          {title}
        </Text>
        {action && onPress ? (
          <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={{ minHeight: 48, justifyContent: "center" }}
          >
            <Text style={{ color: c.primary, fontSize: 13, fontWeight: "700" }}>
              {action}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {subtitle ? (
        <Text style={{ fontSize: 14, lineHeight: 21, color: c.muted }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
export function Tile({
  icon,
  title,
  subtitle,
  onPress,
  tone = "green",
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  tone?: "green" | "orange" | "blue" | "purple";
}) {
  const c = useTheme(),
    bg =
      tone === "orange"
        ? c.peach
        : tone === "blue"
          ? c.blue
          : tone === "purple"
            ? c.purple
            : c.sage;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({
        flexGrow: 1,
        flexBasis: 140,
        minWidth: 130,
        borderRadius: 23,
        padding: 18,
        backgroundColor: bg,
        minHeight: 148,
        opacity: pressed ? 0.8 : 1,
        gap: 10,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Icon name={icon} size={28} />
        <Icon name="arrow-up-right-box-outline" size={18} />
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: c.text,
          letterSpacing: -0.4,
        }}
      >
        {title}
      </Text>
      <Text style={{ fontSize: 13, lineHeight: 19, color: c.muted }}>
        {subtitle}
      </Text>
    </Pressable>
  );
}
export function Ring({
  values,
  goal,
}: {
  values: [number, number, number];
  goal: number;
}) {
  const size = 148,
    colors = ["#A8D8B3", "#F6C58C", "#88C6D8"];
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityLabel={t(
        `Cieľ zásob ${goal} dní. Vonkajší kruh jedlo, stredný voda, vnútorný checklist.`,
      )}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute" }}
        accessible={false}
      >
        {values.map((value, i) => {
          const r = 64 - i * 12,
            circ = 2 * Math.PI * r;
          return (
            <ReactRing
              key={i}
              r={r}
              circ={circ}
              value={value}
              color={colors[i]}
            />
          );
        })}
      </Svg>
      <Text
        style={{
          fontSize: 34,
          lineHeight: 40,
          fontWeight: "800",
          color: "#FFF9EC",
          letterSpacing: -1,
        }}
      >
        {goal}
      </Text>
      <Text style={{ fontSize: 11, color: "#C0D1C8", letterSpacing: 2 }}>
        DNÍ · CIEĽ
      </Text>
    </View>
  );
}
function ReactRing({
  r,
  circ,
  value,
  color,
}: {
  r: number;
  circ: number;
  value: number;
  color: string;
}) {
  return (
    <>
      <Circle
        cx={74}
        cy={74}
        r={r}
        stroke="#31524B"
        strokeWidth={8}
        fill="none"
      />
      <Circle
        cx={74}
        cy={74}
        r={r}
        stroke={color}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={circ * (1 - Math.min(1, Math.max(0, value)))}
        rotation={-90}
        origin="74, 74"
      />
    </>
  );
}
export function Callout({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  const c = useTheme();
  return (
    <View
      style={{
        padding: 17,
        borderRadius: 20,
        backgroundColor: c.tint,
        flexDirection: "row",
        gap: 12,
      }}
    >
      <Icon name={icon} size={23} />
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={{ fontSize: 15, fontWeight: "800", color: c.text }}>
          {title}
        </Text>
        {children}
      </View>
    </View>
  );
}
