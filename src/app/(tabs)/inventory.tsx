import { useState } from "react";
import { router } from "expo-router";
import {
  Button,
  Card,
  Choices,
  Field,
  Row,
  Screen,
  T,
  confirm,
} from "../../components/ui";
import { useStore } from "../../state/store";
import { categories, categoryLabels } from "../../types/model";
import { expiryStatus } from "../../domain/readiness";
export default function InventoryScreen() {
  const s = useStore(),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState<string>("všetko");
  const items = (s.data?.inventory ?? []).filter(
    (x) =>
      (category === "všetko" || x.category === category) &&
      `${x.name} ${x.note}`
        .toLocaleLowerCase("sk")
        .includes(query.toLocaleLowerCase("sk")),
  );
  return (
    <Screen
      title="Zásoby"
      subtitle="Evidencia domácnosti. Energiu odčítajte z obalu a zadajte na zvolenú jednotku."
    >
      <Button title="Pridať zásobu" onPress={() => router.push("/item")} />
      <Field
        label="Vyhľadávanie zásob"
        value={query}
        onChange={setQuery}
        placeholder="Názov alebo poznámka"
      />
      <Choices
        label="Kategória"
        values={["všetko", ...categories]}
        value={category}
        onChange={setCategory}
        display={(v) =>
          v === "všetko"
            ? "Všetko"
            : categoryLabels[v as (typeof categories)[number]]
        }
      />
      {!items.length ? (
        <Card>
          <T large>Tu je priestor pre vaše zásoby.</T>
          <T>Pridajte prvú položku alebo upravte filter vyhľadávania.</T>
        </Card>
      ) : null}
      {items.map((item) => {
        const status = expiryStatus(item);
        return (
          <Card key={item.id}>
            <T large>{item.name}</T>
            <T>
              {categoryLabels[item.category]} · {item.quantity} {item.unit}
            </T>
            <T muted>
              {item.kcal === null
                ? "Energia: neznáme — nezapočítava sa do energetického súčtu."
                : `Energia: ${item.kcal} kcal/${item.unit} · spolu ${item.quantity * item.kcal} kcal${item.category !== "jedlo" ? " (do dní jedla sa počíta iba kategória Jedlo)" : ""}`}
            </T>
            {item.expiry ? (
              <T>
                {item.expiryType === "spotreba"
                  ? "Spotrebujte do"
                  : "Minimálna trvanlivosť"}
                : {item.expiry}
                {status === "past"
                  ? " · po dátume, bez započítania do krytia"
                  : status === "soon"
                    ? " · dátum v najbližších 30 dňoch"
                    : ""}
              </T>
            ) : null}
            {item.expiryType === "trvanlivosť" && status === "past" ? (
              <T>
                Po minimálnej trvanlivosti nemusí byť potravina nebezpečná.
                Skontrolujte obal, skladovanie a stav; riaďte sa pokynmi
                výrobcu.
              </T>
            ) : null}
            {item.purchased ? <T muted>Nákup: {item.purchased}</T> : null}
            {item.note ? <T>{item.note}</T> : null}
            <Row>
              <Button
                title={`Upraviť: ${item.name}`}
                secondary
                onPress={() =>
                  router.push({ pathname: "/item", params: { id: item.id } })
                }
              />
              <Button
                title={`Vymazať: ${item.name}`}
                secondary
                danger
                disabled={s.busy}
                onPress={() =>
                  confirm("Vymazať zásobu?", item.name, () =>
                    s.remove("inventory", item.id),
                  )
                }
              />
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
