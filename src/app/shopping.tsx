import { ExplanationCard } from "../components/explanation";
import { useState } from "react";
import { router } from "expo-router";
import {
  Button,
  Card,
  Check,
  Choices,
  ErrorText,
  Field,
  Row,
  Screen,
  T,
  confirm,
  useAction,
} from "../components/ui";
import { useStore } from "../state/store";
import { coverage, shoppingProposal } from "../domain/readiness";
import {
  goals,
  newId,
  numeric,
  shoppingSchema,
  units,
  type Shopping,
} from "../types/model";
function ShoppingForm({
  initial,
  onDone,
}: {
  initial: Shopping;
  onDone: () => void;
}) {
  const s = useStore(),
    a = useAction(),
    [name, setName] = useState(initial.name),
    [quantity, setQuantity] = useState(String(initial.quantity)),
    [unit, setUnit] = useState(initial.unit);
  return (
    <Card>
      <Field label="Názov nákupu" value={name} onChange={setName} />
      <Field
        label="Množstvo nákupu"
        value={quantity}
        onChange={setQuantity}
        keyboard="decimal-pad"
      />
      <Choices
        label="Jednotka nákupu"
        values={units}
        value={unit}
        onChange={setUnit}
      />
      <ErrorText message={a.error} />
      <Row>
        <Button
          title="Uložiť položku zoznamu"
          disabled={a.busy || s.busy}
          onPress={() =>
            void a.run(async () => {
              await s.save(
                "shopping",
                shoppingSchema.parse({
                  ...initial,
                  name,
                  quantity: numeric(quantity),
                  unit,
                }),
              );
              onDone();
            })
          }
        />
        <Button title="Zrušiť úpravu" secondary onPress={onDone} />
      </Row>
    </Card>
  );
}
export default function ShoppingScreen() {
  const s = useStore(),
    a = useAction(),
    [goal, setGoal] = useState(s.data?.household?.goal ?? 7),
    [edit, setEdit] = useState<Shopping | null>(null),
    [note, setNote] = useState("");
  if (!s.data?.household) return null;
  const p = s.data.household,
    c = coverage(p, s.data.inventory, undefined, goal);
  return (
    <Screen title="Nákupný zoznam">
      <Button title="Späť" secondary onPress={() => router.back()} />
      <Card>
        <Choices
          label="Cieľ v dňoch"
          values={goals}
          value={goal}
          onChange={setGoal}
        />
        <T>
          Chýba {Math.ceil(c.missingKcal).toLocaleString("sk-SK")} kcal a{" "}
          {c.missingWater.toLocaleString("sk-SK", { maximumFractionDigits: 2 })}{" "}
          l vody.
        </T>
        <T muted>
          {p.cooking
            ? "Máte možnosť varenia."
            : "Bez možnosti varenia: návrh používa potraviny pripravené na konzumáciu."}{" "}
          Návrh používa zjednodušenú šablónu, nepozná ceny a nie je nutrične
          kompletný. Množstvá upravte podľa obalov a potrieb domácnosti. Nákupný
          zoznam sa zatiaľ nezapočítava do zásob.
        </T>
        <T muted>
          {p.cooking
            ? "Podiel energie: ryža 40 % (3 600 kcal/kg), vločky 30 % (3 700 kcal/kg), suché strukoviny 30 % (3 300 kcal/kg)."
            : "Podiel energie: hotové konzervy 60 % (1 200 kcal/kg), trvanlivé pečivo 40 % (3 500 kcal/kg)."}{" "}
          Ide iba o predpoklady návrhu. Množstvá sa zaokrúhľujú nahor na 0,01
          kg/l.
        </T>
        <Button
          title="Pridať návrh podľa deficitu"
          disabled={s.busy || a.busy}
          onPress={() =>
            confirm(
              "Pridať návrh?",
              "Existujúci zoznam zostane zachovaný. Opakované pridanie môže vytvoriť ďalšie rovnaké položky.",
              async () => {
                const items = shoppingProposal(p, s.data!.inventory, goal);
                await s.addShopping(items);
                setNote(
                  items.length
                    ? "Návrh bol pridaný."
                    : "Podľa evidencie nič nechýba.",
                );
              },
            )
          }
        />
        {note ? <T>{note}</T> : null}
      </Card>
      <ExplanationCard topic="shopping" />
      <ErrorText message={a.error} />
      <Button
        title="Pridať vlastný nákup"
        onPress={() =>
          setEdit({
            id: newId(),
            name: "",
            quantity: 1,
            unit: "ks",
            done: false,
          })
        }
      />
      {edit ? (
        <ShoppingForm
          key={edit.id}
          initial={edit}
          onDone={() => setEdit(null)}
        />
      ) : null}
      {!s.data.shopping.length ? (
        <Card>
          <T>
            Nákupný zoznam je prázdny. Vytvorte návrh alebo pridajte vlastnú
            položku.
          </T>
        </Card>
      ) : null}
      {s.data.shopping.map((x) => (
        <Card key={x.id}>
          <Check
            label={`${x.name} · ${x.quantity} ${x.unit}`}
            done={x.done}
            disabled={s.busy || a.busy}
            onPress={() =>
              void a.run(() => s.save("shopping", { ...x, done: !x.done }))
            }
          />
          <Row>
            <Button
              title={`Upraviť nákup: ${x.name}`}
              secondary
              onPress={() => setEdit(x)}
            />
            <Button
              title={`Vymazať nákup: ${x.name}`}
              secondary
              danger
              disabled={s.busy}
              onPress={() =>
                confirm("Vymazať nákup?", x.name, () =>
                  s.remove("shopping", x.id),
                )
              }
            />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
