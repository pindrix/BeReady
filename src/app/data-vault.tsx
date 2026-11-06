import { ExplanationCard } from "../components/explanation";
import { router } from "expo-router";
import { Card, Screen, T, Button } from "../components/ui";
import { useStore } from "../state/store";
import { Badge, IconButton } from "../components/visual";
export default function DataVault() {
  const { data } = useStore();
  return (
    <Screen
      title="Moje uložené údaje"
      subtitle="Čítanie vlastných údajov a export zostávajú dostupné aj bez aktívnej licencie."
      headerRight={
        <IconButton
          name="close-outline"
          label="Zavrieť údaje"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/settings")
          }
        />
      }
    >
      <ExplanationCard topic="backup" />
      <Badge label="IBA ČÍTANIE · ÚDAJE SA NEMAŽÚ" />
      <Card>
        <T large>Domácnosť</T>
        <T translate={false}>{data?.household?.name || "—"}</T>
        <T>Počet osôb: {data?.household?.people ?? 0}</T>
        <T large>Miesto stretnutia</T>
        <T translate={false}>{data?.household?.meeting || "—"}</T>
      </Card>
      <Card>
        <T large>Zásoby</T>
        {data?.inventory.length ? (
          data.inventory.map((x) => (
            <Card key={x.id}>
              <T translate={false}>{x.name}</T>
              <T translate={false}>
                {x.quantity} {x.unit}
              </T>
              {x.expiry ? <T>Dátum na obale: {x.expiry}</T> : null}
              {x.note ? <T translate={false}>{x.note}</T> : null}
            </Card>
          ))
        ) : (
          <T>Zatiaľ nemáte uložené zásoby.</T>
        )}
      </Card>
      <Card>
        <T large>Kontakty</T>
        {data?.contacts.length ? (
          data.contacts.map((x) => (
            <Card key={x.id}>
              <T translate={false}>{x.name}</T>
              <T translate={false}>{x.details}</T>
            </Card>
          ))
        ) : (
          <T>Zatiaľ nemáte uložené kontakty.</T>
        )}
      </Card>
      <Card>
        <T large>Nákupný zoznam</T>
        {data?.shopping.map((x) => (
          <T key={x.id} translate={false}>
            {x.done ? "☑" : "☐"} {x.name} · {x.quantity} {x.unit}
          </T>
        ))}
      </Card>
      <Button
        title="Prejsť na export JSON"
        onPress={() => router.push("/settings")}
      />
    </Screen>
  );
}
