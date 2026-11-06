import {
  LocalizedPressable as Pressable,
  LocalizedTextInput as TextInput,
} from "./localized-native";
import { useState } from "react";
import { Modal, ScrollView, View, ActivityIndicator } from "react-native";
import { LocalizedText, useLocale } from "./localized-text";
import { languages, setLocale, translateText, type LocaleCode } from "../i18n";
import { useTheme } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
export function LanguagePicker({
  onSelect,
  initiallyOpen = false,
}: {
  onSelect?: (locale: LocaleCode) => Promise<void>;
  initiallyOpen?: boolean;
}) {
  const c = useTheme(),
    locale = useLocale(),
    [open, setOpen] = useState(initiallyOpen),
    [query, setQuery] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const current = languages.find((x) => x.code === locale)!;
  async function select(code: LocaleCode) {
    setBusy(true);
    setError("");
    try {
      await (onSelect ? onSelect(code) : setLocale(code));
      setOpen(false);
    } catch {
      setError("Jazyk sa nepodarilo uložiť. Skúste to znova.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translateText("Zmeniť jazyk")}
        onPress={() => setOpen(true)}
        style={{
          minHeight: 52,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.card,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 13,
        }}
      >
        <Ionicons name="language-outline" size={22} color={c.primary} />
        <View style={{ flex: 1 }}>
          <LocalizedText style={{ color: c.muted, fontSize: 11 }}>
            Jazyk aplikácie
          </LocalizedText>
          <LocalizedText
            translate={false}
            style={{ color: c.text, fontSize: 16, fontWeight: "700" }}
          >
            {current.nativeName}
          </LocalizedText>
        </View>
        <Ionicons name="chevron-down" size={18} color={c.primary} />
      </Pressable>
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: c.bg,
            padding: 22,
            paddingTop: 54,
            gap: 18,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <LocalizedText
              style={{
                flex: 1,
                fontSize: 28,
                fontWeight: "800",
                color: c.text,
              }}
            >
              Vyberte jazyk
            </LocalizedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={translateText("Zavrieť výber jazyka")}
              onPress={() => setOpen(false)}
              style={{
                width: 48,
                height: 48,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close-outline" size={27} color={c.text} />
            </Pressable>
          </View>
          <LocalizedText
            style={{ fontSize: 14, lineHeight: 21, color: c.muted }}
          >
            Offline nástroje a pribalené návody sa odomknú až po overení
            zaplatenej ročnej licencie.
          </LocalizedText>
          <TextInput
            accessibilityLabel={translateText("Hľadať jazyk")}
            placeholder={translateText("Hľadať jazyk")}
            placeholderTextColor={c.muted}
            value={query}
            onChangeText={setQuery}
            style={{
              color: c.text,
              fontSize: 17,
              minHeight: 50,
              padding: 13,
              borderRadius: 16,
              borderColor: c.border,
              borderWidth: 1,
              backgroundColor: c.card,
            }}
          />
          {busy ? <ActivityIndicator color={c.primary} /> : null}
          {error ? (
            <LocalizedText
              accessibilityRole="alert"
              style={{ color: c.danger }}
            >
              {error}
            </LocalizedText>
          ) : null}
          <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 30 }}>
            {languages
              .filter((x) =>
                `${x.nativeName} ${x.name} ${x.code}`
                  .toLocaleLowerCase()
                  .includes(query.toLocaleLowerCase()),
              )
              .map((lang) => (
                <Pressable
                  key={lang.code}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: lang.code === locale,
                    disabled: busy,
                  }}
                  disabled={busy}
                  accessibilityLabel={lang.nativeName}
                  onPress={() => void select(lang.code)}
                  style={{
                    padding: 16,
                    minHeight: 62,
                    borderRadius: 18,
                    backgroundColor: lang.code === locale ? c.tint : c.card,
                    borderWidth: 1,
                    borderColor: lang.code === locale ? c.primary : c.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <LocalizedText
                    translate={false}
                    style={{ fontSize: 19, color: c.text, flex: 1 }}
                  >
                    {lang.nativeName}
                  </LocalizedText>
                  <LocalizedText style={{ fontSize: 12, color: c.muted }}>
                    {lang.name}
                  </LocalizedText>
                  {lang.code === locale ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color={c.primary}
                    />
                  ) : null}
                </Pressable>
              ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
