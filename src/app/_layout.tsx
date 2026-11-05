import { LocalizedAlert as Alert } from "../components/localized-native";
import { useEffect } from "react";
import { Linking, View } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import {
  Stack,
  router,
  useRootNavigationState,
  useSegments,
  type ErrorBoundaryProps,
} from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { initializeLocale, isRTL } from "../i18n";
import { useLocale } from "../components/localized-text";
import { initializeLicense } from "../db/license-store";
import { LicenseProvider, useLicense, protectedAccess } from "../state/license";
import { AccessPanel } from "../components/access-panel";
import { initialize } from "../db/repository";
import { StoreProvider, useStore } from "../state/store";
import { Button, Card, ErrorText, Loading, Screen, T } from "../components/ui";
import { useTheme } from "../theme/theme";
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <Screen title="Údaje sa nepodarilo otvoriť">
        <Card>
          <ErrorText message={error.message} />
          <T>
            Existujúce údaje sa automaticky nemažú. Skúste aplikáciu načítať
            znova.
          </T>
          <Button
            title="Tiesňová linka 112"
            secondary
            onPress={() =>
              Alert.alert(
                "Vytočiť 112?",
                "Otvorí sa systémové vytáčanie. Volajte pri skutočnej núdzi.",
                [
                  { text: "Zrušiť", style: "cancel" },
                  {
                    text: "Otvoriť vytáčanie",
                    onPress: () => {
                      void Linking.openURL("tel:112").catch(() =>
                        Alert.alert(
                          "Vytáčanie nie je dostupné",
                          "Použite telefónnu aplikáciu zariadenia.",
                        ),
                      );
                    },
                  },
                ],
              )
            }
          />
          <Button title="Skúsiť znova" onPress={() => void retry()} />
        </Card>
      </Screen>
    </SafeAreaProvider>
  );
}
async function prepare(db: Parameters<typeof initialize>[0]) {
  await initialize(db);
  await initializeLocale(db);
  await initializeLicense(db, Date.now());
}
function Gate() {
  const locale = useLocale(),
    license = useLicense(),
    navigation = useRootNavigationState();
  const { data, error, reload, busy } = useStore(),
    segments = useSegments(),
    c = useTheme();
  const immediate = segments[0] === "now",
    onboarding = segments[0] === "onboarding";
  const essential =
    immediate ||
    segments[0] === "plus" ||
    segments[0] === "data-vault" ||
    (segments[0] === "(tabs)" && segments[1] === "settings");
  const redirectToProfile =
    !!data && !data.household && !onboarding && !essential;
  const redirectHome = !!data?.household && onboarding;
  const blocked =
    !!data?.household &&
    !essential &&
    !onboarding &&
    !protectedAccess(license).allowed;
  useEffect(() => {
    if (!navigation?.key) return;
    if (redirectToProfile) router.replace("/onboarding");
    else if (redirectHome) router.replace("/");
  }, [navigation?.key, redirectToProfile, redirectHome]);
  // Keep the root navigator mounted while guards/loaders are visible. Overlay buttons can then navigate safely.
  const loading = (!data && !immediate) || redirectToProfile || redirectHome;
  const overlay = loading ? (
    error ? (
      <Screen title="Chyba načítania">
        <ErrorText message={error} />
        <Button title="Skúsiť znova" onPress={() => void reload()} />
      </Screen>
    ) : (
      <Loading />
    )
  ) : blocked ? (
    <AccessPanel />
  ) : null;
  return (
    <View style={{ flex: 1, direction: isRTL(locale) ? "rtl" : "ltr" }}>
      <StatusBar style={c.dark ? "light" : "dark"} />
      <View
        style={{ flex: 1 }}
        importantForAccessibility={overlay ? "no-hide-descendants" : "auto"}
        accessibilityElementsHidden={!!overlay}
      >
        {error && !overlay ? <ErrorText message={error} /> : null}
        {busy && !overlay ? <T muted>Ukladám…</T> : null}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: c.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="item" options={{ presentation: "modal" }} />
          <Stack.Screen name="shopping" />
          <Stack.Screen name="safe-places" />
          <Stack.Screen name="guide" />
          <Stack.Screen name="videos" />
          <Stack.Screen name="missions" />
          <Stack.Screen name="plus" />
          <Stack.Screen name="household-card" />
          <Stack.Screen name="field-kit" />
          <Stack.Screen name="scenarios" />
          <Stack.Screen name="data-vault" />
          <Stack.Screen name="now" options={{ presentation: "modal" }} />
        </Stack>
      </View>
      {overlay ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: c.bg,
          }}
        >
          {overlay}
        </View>
      ) : null}
    </View>
  );
}
export default function Layout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="ready.db" onInit={prepare}>
        <LicenseProvider>
          <StoreProvider>
            <Gate />
          </StoreProvider>
        </LicenseProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
