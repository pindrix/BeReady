import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Card,
  Choices,
  ErrorText,
  Field,
  Screen,
  T,
  useAction,
} from "../components/ui";
import { useStore } from "../state/store";
import {
  categories,
  categoryLabels,
  inventorySchema,
  newId,
  numeric,
  units,
  type Inventory,
} from "../types/model";
import { catalog } from "../data/content";
function Form({ initial }: { initial: Inventory }) {
  const s = useStore(),
    a = useAction();
  const [v, setV] = useState(initial),
    [quantity, setQuantity] = useState(String(v.quantity)),
    [kcal, setKcal] = useState(v.kcal === null ? "" : String(v.kcal));
  function set<K extends keyof Inventory>(key: K, value: Inventory[K]) {
    setV((x) => ({ ...x, [key]: value }));
  }
  return (
    <Card>
      <Field label="Názov" value={v.name} onChange={(x) => set("name", x)} />
      {!initial.name ? (
        <Choices
          label="Návrhy názvov — bez odhadovaných kcal"
          values={catalog}
          value={v.name}
          onChange={(x) => setV((y) => ({ ...y, name: x, category: "jedlo" }))}
        />
      ) : null}
      <Choices
        label="Kategória"
        values={categories}
        value={v.category}
        onChange={(x) =>
          setV((y) => ({
            ...y,
            category: x,
            unit: x === "voda" ? "l" : y.unit,
          }))
        }
        display={(x) => categoryLabels[x]}
      />
      <Field
        label="Množstvo"
        value={quantity}
        onChange={setQuantity}
        keyboard="decimal-pad"
      />
      <Choices
        label="Jednotka"
        values={v.category === "voda" ? (["l", "ml"] as const) : units}
        value={v.unit}
        onChange={(x) => {
          set("unit", x);
          setKcal("");
        }}
      />
      <Field
        label={`kcal na 1 ${v.unit} (voliteľné)`}
        value={kcal}
        onChange={setKcal}
        keyboard="decimal-pad"
        placeholder="Prázdne = neznáme"
      />
      <T muted>
        Celková energia = množstvo × kcal na zvolenú jednotku. Ak obal uvádza
        kcal/100 g a evidujete kg, vynásobte hodnotu desiatimi. Pri zmene
        jednotky zadajte energiu znova.
      </T>
      <Choices
        label="Typ dátumu"
        values={["spotreba", "trvanlivosť"] as const}
        value={v.expiryType}
        onChange={(x) => set("expiryType", x)}
        display={(x) =>
          x === "spotreba" ? "Spotrebujte do" : "Minimálna trvanlivosť"
        }
      />
      <Field
        label="Dátum na obale (RRRR-MM-DD, voliteľné)"
        value={v.expiry ?? ""}
        onChange={(x) => set("expiry", x || null)}
        placeholder="2027-06-30"
      />
      <Field
        label="Dátum nákupu (RRRR-MM-DD, voliteľné)"
        value={v.purchased ?? ""}
        onChange={(x) => set("purchased", x || null)}
      />
      <Field
        label="Poznámka"
        value={v.note}
        onChange={(x) => set("note", x)}
        multiline
      />
      <ErrorText message={a.error} />
      <Button
        title="Uložiť zásobu"
        disabled={a.busy || s.busy}
        onPress={() =>
          void a.run(async () => {
            await s.save(
              "inventory",
              inventorySchema.parse({
                ...v,
                quantity: numeric(quantity),
                kcal: kcal.trim() === "" ? null : numeric(kcal),
              }),
            );
            router.back();
          })
        }
      />
    </Card>
  );
}
export default function ItemScreen() {
  const { id, category } = useLocalSearchParams<{
      id?: string;
      category?: string;
    }>(),
    s = useStore();
  const existing = s.data?.inventory.find((x) => x.id === id);
  const initial: Inventory = existing ?? {
    id: newId(),
    name: "",
    category: category === "voda" ? "voda" : "jedlo",
    quantity: 1,
    unit: category === "voda" ? "l" : "kg",
    kcal: null,
    expiry: null,
    expiryType: "spotreba",
    purchased: null,
    note: "",
  };
  return (
    <Screen title={id ? "Upraviť zásobu" : "Nová zásoba"}>
      <Button title="Späť" secondary onPress={() => router.back()} />
      {id && !existing ? (
        <T>Položka už neexistuje.</T>
      ) : (
        <Form initial={initial} />
      )}
    </Screen>
  );
}
