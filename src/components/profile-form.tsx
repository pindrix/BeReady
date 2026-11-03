import { useState } from "react";
import { View } from "react-native";
import {
  type Household,
  goals,
  householdSchema,
  numeric,
} from "../types/model";
import {
  Button,
  Card,
  Check,
  Choices,
  ErrorText,
  Field,
  T,
  useAction,
} from "./ui";
export function ProfileForm({
  initial,
  onSave,
  first = false,
}: {
  initial: Household;
  onSave: (v: Household) => Promise<void>;
  first?: boolean;
}) {
  const [name, setName] = useState(initial.name),
    [people, setPeople] = useState(String(initial.people)),
    [goal, setGoal] = useState(initial.goal),
    [kcal, setKcal] = useState(String(initial.kcal)),
    [water, setWater] = useState(String(initial.water)),
    [cooking, setCooking] = useState(initial.cooking);
  const a = useAction();
  const [saved, setSaved] = useState(false);
  return (
    <Card>
      <T large>{first ? "Vaša domácnosť" : "Profil domácnosti"}</T>
      <Field
        label="Názov domácnosti (voliteľné)"
        value={name}
        onChange={setName}
      />
      <Field
        label="Počet osôb (1–10)"
        value={people}
        onChange={setPeople}
        keyboard="number-pad"
      />
      <Choices
        label="Cieľ zásob v dňoch"
        values={goals}
        value={goal}
        onChange={setGoal}
      />
      <Field
        label="kcal na osobu a deň"
        value={kcal}
        onChange={setKcal}
        keyboard="decimal-pad"
      />
      <Field
        label="Litrov pitnej vody na osobu a deň"
        value={water}
        onChange={setWater}
        keyboard="decimal-pad"
      />
      <Check
        label="Máme možnosť núdzového varenia"
        done={cooking}
        onPress={() => setCooking(!cooking)}
      />
      <T muted>
        Hodnoty 2 200 kcal a 3,8 l sú orientačné a upraviteľné. Nejde o
        zdravotné odporúčanie pre konkrétnu osobu.
      </T>
      <ErrorText message={a.error} />
      {saved ? <T>Profil bol uložený.</T> : null}
      <View>
        <Button
          title={first ? "Začať s prípravou" : "Uložiť profil"}
          disabled={a.busy}
          onPress={() =>
            void a.run(async () => {
              const v = householdSchema.parse({
                ...initial,
                name,
                people: numeric(people),
                goal,
                kcal: numeric(kcal),
                water: numeric(water),
                cooking,
              });
              await onSave(v);
              setSaved(true);
            })
          }
        />
      </View>
    </Card>
  );
}
