import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  Button,
  Card,
  ErrorText,
  Screen,
  T,
  confirm,
  useAction,
} from "../../components/ui";
import { ProfileForm } from "../../components/profile-form";
import { useStore } from "../../state/store";
import {
  decodeBackup,
  encodeBackup,
  MAX_BACKUP_BYTES,
} from "../../domain/backup";
export default function SettingsScreen() {
  const s = useStore(),
    a = useAction(),
    [note, setNote] = useState("");
  if (!s.data?.household) return null;
  return (
    <Screen title="Vaše nastavenia">
      <ProfileForm
        key={JSON.stringify(s.data.household)}
        initial={s.data.household}
        onSave={s.profile}
      />
      <Card>
        <T large>Súkromie a lokálne dáta</T>
        <T>
          Bez účtu, backendu a vzdialeného sledovania. Údaje sú uložené v SQLite
          v tomto zariadení. Odinštalovaním môžete o dáta prísť; pravidelne si
          vytvárajte zálohu.
        </T>
        <T muted>
          JSON záloha obsahuje aj vaše kontakty a miesto stretnutia. Nie je
          šifrovaná. Uložte ju na dôveryhodnom mieste. Zdieľanie alebo cloudová
          záloha zariadenia môžu údaje preniesť mimo zariadenia podľa vašej
          voľby a nastavení systému.
        </T>
      </Card>
      <Card>
        <T large>Záloha domácnosti</T>
        <ErrorText message={a.error} />
        {note ? <T>{note}</T> : null}
        <Button
          title="Exportovať JSON zálohu"
          disabled={a.busy || s.busy}
          onPress={() =>
            void a.run(async () => {
              if (!(await Sharing.isAvailableAsync()))
                throw new Error(
                  "Zdieľanie súboru nie je na tomto zariadení dostupné.",
                );
              const file = new File(
                Paths.cache,
                `ready-backup-${Date.now()}.json`,
              );
              try {
                file.create();
                file.write(encodeBackup(s.data!));
                await Sharing.shareAsync(file.uri, {
                  mimeType: "application/json",
                  UTI: "public.json",
                  dialogTitle: "Uložiť zálohu READY",
                });
                setNote(
                  "Dialóg zdieľania bol zatvorený. Skontrolujte, či ste súbor uložili na zvolené miesto.",
                );
              } finally {
                if (file.exists) file.delete();
              }
            })
          }
        />
        <Button
          title="Importovať JSON zálohu"
          secondary
          disabled={a.busy || s.busy}
          onPress={() =>
            void a.run(async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: ["application/json", "text/plain"],
                copyToCacheDirectory: true,
                multiple: false,
              });
              if (result.canceled) return;
              const asset = result.assets[0],
                file = new File(asset.uri);
              try {
                if ((asset.size ?? file.size) > MAX_BACKUP_BYTES)
                  throw new Error("Záloha je príliš veľká (limit 10 MB).");
                const data = decodeBackup(await file.text());
                confirm(
                  "Nahradiť všetky údaje?",
                  `Záloha obsahuje ${data.inventory.length} zásob, ${data.shopping.length} nákupov, ${data.checklists.length} úloh a ${data.contacts.length} kontaktov. Súčasné údaje budú prepísané.`,
                  async () => {
                    await s.restore(data);
                    setNote("Záloha bola obnovená.");
                  },
                );
              } finally {
                if (file.exists) file.delete();
              }
            })
          }
        />
        <T muted>
          Import kontroluje verziu, typy, povinné polia, dátumy aj duplicitné
          identifikátory. Obnovenie prebehne v jednej transakcii.
        </T>
      </Card>
      <T muted>
        READY 1.0 · Rozhranie sa prispôsobuje svetlému a tmavému režimu
        zariadenia.
      </T>
    </Screen>
  );
}
