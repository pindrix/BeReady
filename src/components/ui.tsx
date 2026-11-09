import { LinearGradient } from "expo-linear-gradient";
import { BrandMark } from "./brand-mark";
import {
  LocalizedAlert as Alert,
  LocalizedPressable as Pressable,
  LocalizedTextInput as TextInput,
} from "./localized-native";
import { LocalizedText as Text, useLocale } from "./localized-text";
import { isRTL, translateText as t } from "../i18n";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme";
import { errorMessage } from "../types/model";
export function T({
  children,
  muted = false,
  large = false,
  translate = true,
}: {
  children: ReactNode;
  muted?: boolean;
  large?: boolean;
  translate?: boolean;
}) {
  const c = useTheme();
  return (
    <Text
      translate={translate}
      style={{
        color: muted ? c.muted : c.text,
        fontSize: large ? 23 : 16,
        lineHeight: large ? 31 : 24,
        fontWeight: large ? "700" : "400",
        flexShrink: 1,
      }}
    >
      {children}
    </Text>
  );
}
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  return (
    <View
      style={{
        backgroundColor: c.card,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: c.radius,
        padding: 20,
        gap: 14,
        boxShadow: c.cardShadow,
        ...StyleSheet.flatten(style),
      }}
    >
      {children}
    </View>
  );
}
export function Row({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
      }}
    >
      {children}
    </View>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  const c = useTheme();
  const color = danger ? c.danger : c.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: c.buttonRadius,
        backgroundColor: secondary ? c.card : color,
        borderColor: color,
        borderWidth: 1,
        opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        justifyContent: "center",
      })}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: secondary ? color : c.onPrimary,
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Screen({
  title,
  subtitle,
  subtitleTranslate = true,
  children,
  eyebrow = "VÁŠ PRIESTOR PRE POKOJ",
  headerRight,
}: {
  title: string;
  subtitle?: string;
  subtitleTranslate?: boolean;
  eyebrow?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  const c = useTheme(),
    locale = useLocale();
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{
        flex: 1,
        backgroundColor: c.bg,
        direction: isRTL(locale) ? "rtl" : "ltr",
      }}
    >
      <LinearGradient
        pointerEvents="none"
        colors={c.dark ? ["#17213D", c.bg, c.bg] : [c.bg, c.bg, c.card]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 48,
            gap: 20,
            width: "100%",
            maxWidth: 760,
            alignSelf: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View style={{ gap: 5 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <BrandMark />
                <Text
                  translate={false}
                  style={{
                    fontSize: 21,
                    fontWeight: "900",
                    letterSpacing: 3,
                    color: c.primary,
                  }}
                >
                  BE READY
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 9,
                  letterSpacing: 1.8,
                  fontWeight: "700",
                  color: c.muted,
                }}
              >
                {eyebrow}
              </Text>
            </View>
            {headerRight}
          </View>
          <Text
            accessibilityRole="header"
            style={{
              fontSize: 34,
              lineHeight: 40,
              letterSpacing: -1.3,
              fontWeight: "800",
              color: c.navy,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <T muted translate={subtitleTranslate}>
              {subtitle}
            </T>
          ) : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard = "default",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboard?: KeyboardTypeOptions;
  multiline?: boolean;
}) {
  const c = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <T>{label}</T>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        keyboardType={keyboard}
        multiline={multiline}
        autoCapitalize="sentences"
        style={{
          fontSize: 17,
          color: c.text,
          backgroundColor: c.card,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 13,
          minHeight: 50,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}
export function Choices<TValue extends string | number>({
  label,
  values,
  value,
  onChange,
  display,
}: {
  label: string;
  values: readonly TValue[];
  value: TValue;
  onChange: (v: TValue) => void;
  display?: (v: TValue) => string;
}) {
  const c = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <T>{label}</T>
      <Row>
        {values.map((v) => (
          <Pressable
            key={v}
            accessibilityRole="radio"
            accessibilityState={{ checked: v === value }}
            accessibilityLabel={display ? display(v) : String(v)}
            onPress={() => onChange(v)}
            style={{
              padding: 12,
              minHeight: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: v === value ? c.primary : c.border,
              backgroundColor: v === value ? c.tint : c.card,
            }}
          >
            <Text
              style={{
                color: v === value ? c.primary : c.text,
                fontSize: 16,
                fontWeight: v === value ? "700" : "400",
              }}
            >
              {display ? display(v) : v}
            </Text>
          </Pressable>
        ))}
      </Row>
    </View>
  );
}
export function Check({
  label,
  done,
  onPress,
  disabled = false,
  translateLabel = true,
}: {
  label: string;
  done: boolean;
  onPress: () => void;
  disabled?: boolean;
  translateLabel?: boolean;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      translateLabel={translateLabel}
      accessibilityState={{ checked: done, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 50,
        paddingVertical: 8,
      }}
    >
      <Text style={{ fontSize: 26, color: c.primary }}>{done ? "☑" : "☐"}</Text>
      <Text
        translate={translateLabel}
        style={{
          flex: 1,
          fontSize: 17,
          lineHeight: 24,
          color: done ? c.muted : c.text,
          textDecorationLine: done ? "line-through" : "none",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Progress({ value, label }: { value: number; label: string }) {
  const c = useTheme(),
    pct = Math.min(100, Math.max(0, value));
  return (
    <View style={{ gap: 8 }}>
      <T>
        {label} · {Math.round(pct)} %
      </T>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
        accessibilityLabel={t(label)}
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: c.border,
          overflow: "hidden",
        }}
      >
        <View
          style={{ width: `${pct}%`, height: 8, backgroundColor: c.primary }}
        />
      </View>
    </View>
  );
}
export function ErrorText({ message }: { message: string }) {
  const c = useTheme();
  return message ? (
    <Text
      accessibilityRole="alert"
      style={{ color: c.danger, fontSize: 16, lineHeight: 24 }}
    >
      {message}
    </Text>
  ) : null;
}
export function Loading() {
  const c = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.bg,
        gap: 16,
      }}
    >
      <ActivityIndicator color={c.primary} size="large" />
      <T>Načítavam lokálne údaje…</T>
    </View>
  );
}
export function confirm(
  title: string,
  message: string,
  action: () => Promise<void>,
) {
  Alert.alert(title, message, [
    { text: "Zrušiť", style: "cancel" },
    {
      text: "Potvrdiť",
      style: "destructive",
      onPress: () => {
        void action().catch((e) =>
          Alert.alert("Operácia sa nepodarila", errorMessage(e)),
        );
      },
    },
  ]);
}
export function useAction() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function run(action: () => Promise<void>) {
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return { error, busy, run };
}
export const styles = StyleSheet.create({ gap: { gap: 16 } });
