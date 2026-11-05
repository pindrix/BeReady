import { router } from "expo-router";
import { View } from "react-native";
import { Button, Card, Screen, T, ErrorText } from "./ui";
import { Badge, Icon } from "./visual";
import { useLicense } from "../state/license";
import { useTheme } from "../theme/theme";
export function AccessPanel() {
  const l = useLicense(),
    c = useTheme();
  return (
    <Screen
      title={
        l.connectivity === "offline"
          ? "Váš plán aj bez signálu."
          : "Prístup k aplikácii"
      }
      subtitle="Offline nástroje a pribalené návody sa odomknú až po overení zaplatenej ročnej licencie."
    >
      <Card>
        <View style={{ alignItems: "center", padding: 18, gap: 18 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 32,
              backgroundColor: c.blue,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="cloud-offline-outline" size={49} />
          </View>
          <Badge label="14 DNÍ ONLINE · POTOM ROČNÁ LICENCIA" />
          <T large>
            {l.connectivity === "unknown"
              ? "Overujeme pripojenie."
              : "Offline režim patrí k licencii."}
          </T>
          <T>
            Počas skúšania sa pripojte na internet. Po zaplatení a overení
            licencie budete môcť používať pribalené návody aj nástroje bez
            siete.
          </T>
        </View>
        <ErrorText message={l.error} />
        <Button
          title="Zobraziť licenciu — 10 USD / 12 mesiacov"
          onPress={() => router.push("/plus")}
        />
        <Button
          title="Znova overiť pripojenie"
          secondary
          onPress={() => void l.refresh()}
        />
        <Button
          title="Moje dáta a export"
          secondary
          onPress={() => router.push("/settings")}
        />
        <Button
          title="Tiesňové čísla"
          secondary
          onPress={() => router.push("/now")}
        />
      </Card>
    </Screen>
  );
}
