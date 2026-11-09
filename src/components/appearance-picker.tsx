import { View } from "react-native";
import { setAppearance } from "../state/appearance";
import { useTheme } from "../theme/theme";
import { LocalizedPressable as Pressable } from "./localized-native";
import { Card, T, ErrorText, useAction } from "./ui";
import { Icon } from "./visual";
export function AppearancePicker() {
  const c = useTheme(),
    a = useAction();
  return (
    <Card>
      <T large>Vzhľad aplikácie</T>
      <T muted>Vyberte si svoj štýl. Výber sa uloží v zariadení.</T>
      <View style={{ gap: 10 }}>
        {[
          {
            id: "aurora" as const,
            name: "Aurora Command",
            description: "Tmavý prehľad s jemnými svetelnými akcentmi.",
            color: "#69E8D4",
            bg: "#101D36",
            icon: "moon-outline" as const,
          },
          {
            id: "atlas" as const,
            name: "Field Atlas",
            description: "Svetlý sprievodca s technickými schémami.",
            color: "#E9AE55",
            bg: "#F3EBDD",
            icon: "sunny-outline" as const,
          },
        ].map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="radio"
            accessibilityLabel={item.name}
            aria-checked={c.appearance === item.id}
            translateLabel={false}
            accessibilityState={{
              checked: c.appearance === item.id,
              disabled: a.busy,
            }}
            disabled={a.busy}
            onPress={() => void a.run(() => setAppearance(item.id))}
            style={{
              padding: 16,
              borderRadius: c.buttonRadius,
              borderWidth: c.appearance === item.id ? 2 : 1,
              borderColor: c.appearance === item.id ? c.primary : c.border,
              backgroundColor: c.appearance === item.id ? c.tint : c.card,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: item.bg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={item.icon} color={item.color} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <T translate={false}>{item.name}</T>
              <T muted>{item.description}</T>
            </View>
            {c.appearance === item.id ? <Icon name="checkmark-circle" /> : null}
          </Pressable>
        ))}
      </View>
      <ErrorText message={a.error} />
    </Card>
  );
}
