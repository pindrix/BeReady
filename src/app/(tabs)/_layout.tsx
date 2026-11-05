import { translateText as t, messages } from "../../i18n";
import { useLocale } from "../../components/localized-text";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/theme";
export default function Layout() {
  useLocale();
  const c = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.border,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: 3 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t(messages.tabs.home),
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="home-outline"
              color={focused ? c.primary : c.muted}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: t(messages.tabs.inventory),
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="cube-outline"
              color={focused ? c.primary : c.muted}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: t(messages.tabs.plan),
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="checkbox-outline"
              color={focused ? c.primary : c.muted}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: t(messages.tabs.help),
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="help-buoy-outline"
              color={focused ? c.primary : c.muted}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t(messages.tabs.settings),
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="settings-outline"
              color={focused ? c.primary : c.muted}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
