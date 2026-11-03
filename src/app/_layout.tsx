import { SQLiteProvider } from "expo-sqlite";
import {
  Stack,
  Redirect,
  useSegments,
  type ErrorBoundaryProps,
} from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
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
          <Button title="Skúsiť znova" onPress={() => void retry()} />
        </Card>
      </Screen>
    </SafeAreaProvider>
  );
}
function Gate() {
  const { data, error, reload, busy } = useStore(),
    segments = useSegments(),
    c = useTheme();
  if (!data)
    return error ? (
      <Screen title="Chyba načítania">
        <ErrorText message={error} />
        <Button title="Skúsiť znova" onPress={() => void reload()} />
      </Screen>
    ) : (
      <Loading />
    );
  const onboarding = segments[0] === "onboarding";
  if (!data.household && !onboarding) return <Redirect href="/onboarding" />;
  if (data.household && onboarding) return <Redirect href="/" />;
  return (
    <>
      <StatusBar style={c.dark ? "light" : "dark"} />
      {error ? <ErrorText message={error} /> : null}
      {busy ? <T muted>Ukladám…</T> : null}
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
      </Stack>
    </>
  );
}
export default function Layout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="ready.db" onInit={initialize}>
        <StoreProvider>
          <Gate />
        </StoreProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
