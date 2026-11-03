import { useState } from "react";
import { IconButton, Badge, Tile } from "../../components/visual";
import { View } from "react-native";
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
} from "../../components/ui";
import { useStore } from "../../state/store";
import {
  checklistSchema,
  contactSchema,
  householdSchema,
  newId,
  topics,
  type Contact,
  type Checklist,
} from "../../types/model";
function ContactForm({
  initial,
  onDone,
}: {
  initial: Contact;
  onDone: () => void;
}) {
  const s = useStore(),
    a = useAction(),
    [name, setName] = useState(initial.name),
    [details, setDetails] = useState(initial.details);
  return (
    <Card>
      <Field label="Meno kontaktu" value={name} onChange={setName} />
      <Field
        label="Telefón / textové údaje"
        value={details}
        onChange={setDetails}
        multiline
      />
      <ErrorText message={a.error} />
      <Row>
        <Button
          title="Uložiť kontakt"
          disabled={a.busy || s.busy}
          onPress={() =>
            void a.run(async () => {
              await s.save(
                "contacts",
                contactSchema.parse({ ...initial, name, details }),
              );
              onDone();
            })
          }
        />
        <Button title="Zrušiť úpravu kontaktu" secondary onPress={onDone} />
      </Row>
    </Card>
  );
}
function Meeting({ initial }: { initial: string }) {
  const s = useStore(),
    a = useAction(),
    [meeting, setMeeting] = useState(initial),
    [saved, setSaved] = useState(false);
  return (
    <Card>
      <T large>Miesto stretnutia</T>
      <Field
        label="Kde sa stretneme a záložné miesto"
        value={meeting}
        onChange={(v) => {
          setMeeting(v);
          setSaved(false);
        }}
        multiline
      />
      <ErrorText message={a.error} />
      {saved ? <T>Miesto bolo uložené.</T> : null}
      <Button
        title="Uložiť miesto stretnutia"
        disabled={a.busy || s.busy}
        onPress={() =>
          void a.run(async () => {
            await s.profile(
              householdSchema.parse({ ...s.data!.household, meeting }),
            );
            setSaved(true);
          })
        }
      />
    </Card>
  );
}
export default function PlanScreen() {
  const s = useStore(),
    a = useAction(),
    [topic, setTopic] = useState<(typeof topics)[number]>("evakuácia"),
    [task, setTask] = useState(""),
    [taskEdit, setTaskEdit] = useState<Checklist | null>(null),
    [edit, setEdit] = useState<Contact | null>(null);
  if (!s.data?.household) return null;
  const tasks = s.data.checklists.filter(
    (x) =>
      x.topic === topic &&
      !x.id.startsWith("mission-") &&
      !x.id.startsWith("bookmark-"),
  );
  return (
    <Screen
      title="Môj krízový plán"
      subtitle="Dohodnite sa vopred. Údaje sa nikam automaticky neposielajú."
    >
      <Button
        title="Nákupný zoznam"
        secondary
        onPress={() => router.push("/shopping")}
      />
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        <Tile
          icon="trail-sign-outline"
          title="7 krokov prípravy"
          subtitle="Malé misie a praktické kvízy"
          onPress={() => router.push("/missions")}
        />
        <Tile
          icon="id-card-outline"
          title="Karta domácnosti"
          subtitle="Kontakty a plán na jednom mieste"
          tone="blue"
          onPress={() => router.push("/household-card")}
        />
      </View>
      <Meeting
        key={s.data.household.meeting}
        initial={s.data.household.meeting}
      />
      <Choices
        label="Tematický checklist"
        values={topics}
        value={topic}
        onChange={(v) => {
          setTopic(v);
          setTaskEdit(null);
          setTask("");
        }}
      />
      <Card>
        <Badge
          label={`${tasks.filter((x) => x.done).length} / ${tasks.length} ÚLOH SPLNENÝCH`}
        />
        {tasks.map((x) => (
          <View
            key={x.id}
            style={{
              borderBottomWidth: 1,
              borderColor: "#DFE7DE",
              paddingVertical: 10,
              gap: 4,
            }}
          >
            <Check
              label={x.name}
              done={x.done}
              disabled={s.busy || a.busy}
              onPress={() =>
                void a.run(() => s.save("checklists", { ...x, done: !x.done }))
              }
            />
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <IconButton
                name="create-outline"
                label={`Upraviť úlohu: ${x.name}`}
                onPress={() => {
                  setTaskEdit(x);
                  setTask(x.name);
                }}
              />
              <IconButton
                name="trash-outline"
                label={`Odstrániť úlohu: ${x.name}`}
                disabled={s.busy}
                onPress={() =>
                  confirm("Odstrániť úlohu?", x.name, () =>
                    s.remove("checklists", x.id),
                  )
                }
              />
            </View>
          </View>
        ))}
        {!tasks.length ? (
          <T>V tejto téme zatiaľ nie sú úlohy. Pridajte si vlastnú.</T>
        ) : null}
        <Field
          label={taskEdit ? "Úprava úlohy" : "Vlastná úloha"}
          value={task}
          onChange={setTask}
        />
        <Button
          title={taskEdit ? "Uložiť úlohu" : "Pridať úlohu"}
          disabled={a.busy || s.busy}
          onPress={() =>
            void a.run(async () => {
              await s.save(
                "checklists",
                checklistSchema.parse({
                  id: taskEdit?.id ?? newId(),
                  name: task,
                  topic,
                  done: taskEdit?.done ?? false,
                }),
              );
              setTask("");
              setTaskEdit(null);
            })
          }
        />
        {taskEdit ? (
          <Button
            title="Zrušiť úpravu úlohy"
            secondary
            onPress={() => {
              setTaskEdit(null);
              setTask("");
            }}
          />
        ) : null}
      </Card>
      <ErrorText message={a.error} />
      <Card>
        <T large>Blízke osoby</T>
        <T muted>Kontakty zapisujete ručne, bez prístupu k adresáru.</T>
        {s.data.contacts.length === 0 ? (
          <T>Zatiaľ nemáte žiadne kontakty.</T>
        ) : null}
        {s.data.contacts.map((x) => (
          <Card key={x.id}>
            <T large>{x.name}</T>
            <T>{x.details}</T>
            <Row>
              <Button
                title={`Upraviť kontakt: ${x.name}`}
                secondary
                onPress={() => setEdit(x)}
              />
              <Button
                title={`Vymazať kontakt: ${x.name}`}
                secondary
                danger
                disabled={s.busy}
                onPress={() =>
                  confirm("Vymazať kontakt?", x.name, () =>
                    s.remove("contacts", x.id),
                  )
                }
              />
            </Row>
          </Card>
        ))}
        <Button
          title="Pridať kontakt"
          onPress={() => setEdit({ id: newId(), name: "", details: "" })}
        />
      </Card>
      {edit ? (
        <ContactForm
          key={edit.id}
          initial={edit}
          onDone={() => setEdit(null)}
        />
      ) : null}
    </Screen>
  );
}
