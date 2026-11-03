import { router } from "expo-router";
import { Button, Card, Progress, Screen, T } from "../../components/ui";
import { coverage } from "../../domain/readiness";
import { useStore } from "../../state/store";
import { nutritionNote } from "../../data/content";
import { formatNumber as fmt } from "../../i18n";
export default function Home() {
  const { data } = useStore();
  if (!data?.household) return null;
  const p = data.household,
    c = coverage(p, data.inventory),
    tasks = data.checklists.filter((x) => x.topic === "evakuácia"),
    completed = tasks.filter((x) => x.done).length;
  return (
    <Screen
      title={
        p.name ? `Doma v pohode, ${p.name}.` : "Pripravení krok za krokom."
      }
      subtitle={`${p.people} osôb · cieľ ${p.goal} dní · uložené v zariadení`}
    >
      <Card>
        <T large>Pripravenosť domácnosti</T>
        <T muted>
          Prehľad evidovaných zásob a úloh. Nie je to záruka bezpečnosti.
        </T>
        <T large>{fmt(c.foodDays)} dní jedla</T>
        <Progress
          label="Energetické zásoby voči cieľu"
          value={(c.foodDays / p.goal) * 100}
        />
        <T large>{fmt(c.waterDays)} dní pitnej vody</T>
        <Progress
          label="Pitná voda voči cieľu"
          value={(c.waterDays / p.goal) * 100}
        />
        <Progress
          label={`Evakuačný checklist (${completed}/${tasks.length})`}
          value={tasks.length ? (completed / tasks.length) * 100 : 0}
        />
      </Card>
      <Card>
        <T large>Najbližší užitočný krok</T>
        {c.missingKcal > 0 ? (
          <T>Do cieľa chýba {fmt(c.missingKcal)} kcal.</T>
        ) : (
          <T>Energetický cieľ je podľa evidovaných údajov pokrytý.</T>
        )}
        {c.missingWater > 0 ? (
          <T>Do cieľa chýba {fmt(c.missingWater)} l pitnej vody.</T>
        ) : (
          <T>Cieľ pitnej vody je podľa evidencie pokrytý.</T>
        )}
        {c.unknown > 0 ? (
          <T>Neznáme kcal: {c.unknown} položiek. Nie sú započítané.</T>
        ) : null}
        {c.expired > 0 ? (
          <T>
            Po dátume: {c.expired} položiek. Zostávajú v zásobách, ale
            nezapočítavajú sa do krytia.
          </T>
        ) : null}
        {c.soon > 0 ? (
          <T>
            V najbližších 30 dňoch dosiahne uvedený dátum {c.soon} položiek.
          </T>
        ) : null}
      </Card>
      <Button title="Pridať zásobu" onPress={() => router.push("/item")} />
      <Button
        title="Vytvoriť nákupný zoznam"
        secondary
        onPress={() => router.push("/shopping")}
      />
      <Button
        title="Môj krízový plán"
        secondary
        onPress={() => router.push("/plan")}
      />
      <Button
        title="Čo robiť pri výpadku elektriny"
        secondary
        onPress={() =>
          router.push({ pathname: "/help", params: { topic: "blackout" } })
        }
      />
      <T muted>{nutritionNote}</T>
    </Screen>
  );
}
