# READY — Krízová pripravenosť

Mobilné MVP pre slovenskú domácnosť. Expo SDK 58, React Native, striktný TypeScript, Expo Router a SQLite. Bez účtu, aplikačného backendu, platených API a vzdialeného sledovania.

## Spustenie na Windows (PowerShell)

1. Nainštalujte **Node.js 24 LTS** (obsahuje npm), Git a aktuálny Expo Go z Google Play / App Store. Projekt používa SDK 58; Expo Go musí podporovať práve túto verziu. Verzie balíkov sú uzamknuté v `package-lock.json`.
2. Ak máte nainštalovaný Git a priečinok `BeReady` ešte nemáte, stiahnite projekt a prejdite doň:

```powershell
Set-Location $HOME
git clone https://github.com/pindrix/BeReady.git BeReady
Set-Location .\BeReady
```

Ak už máte projekt z predchádzajúceho klonovania, neklonujte ho znova; otvorte jeho existujúci priečinok. Pri sťahovaní cez ZIP ho najprv rozbaľte. Otvorte priečinok obsahujúci **oba súbory `package.json` a `package-lock.json`**, kliknite do adresného riadka Prieskumníka, napíšte `powershell` a stlačte Enter. Podľa spôsobu rozbalenia môže byť projekt o priečinok hlbšie.

3. Najprv overte pracovný priečinok, potom inštalujte a spustite:

```powershell
Get-Location
if (!(Test-Path .\package.json) -or !(Test-Path .\package-lock.json)) {
    throw "Nie ste v priecinku projektu. Otvorte priecinok s package.json a package-lock.json."
}
node --version
npm.cmd ci
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd start -- --lan
```

Príkazy `npm` nespúšťajte priamo v `C:\Users\matej`, ak tam nemáte súbory aplikácie. Pri klonovaní podľa vyššie uvedeného postupu má výzva vyzerať ako `PS C:\Users\matej\BeReady>`.

4. Počítač aj telefón pripojte k rovnakej dôveryhodnej Wi-Fi.
5. **Android:** otvorte Expo Go a použite skener QR kódu z terminálu.
6. **iPhone:** naskenujte QR fotoaparátom a otvorte odkaz v Expo Go. Mac nie je potrebný na skúšku v Expo Go na fyzickom iPhone.
7. Vyplňte profil domácnosti a pridajte vlastné zásoby. Pri vývojovom spustení nechajte Metro server na počítači zapnutý.

`npm.cmd` obchádza bežné blokovanie `npm.ps1` politikou PowerShell bez zmeny bezpečnostnej politiky systému. Na macOS/Linux použite `npm`.

### Časté problémy

- **`npm ci` hlási EUSAGE alebo chýbajúci lockfile; `npm start` hlási ENOENT a `C:\Users\matej\package.json`:** príkazy bežia v nesprávnom priečinku. Prejdite cez `Set-Location` do priečinka aplikácie a overte `Get-ChildItem package*.json`. Musia sa zobraziť `package.json` aj `package-lock.json`. Nevytvárajte nový projekt cez `npm init` a nevyrábajte náhradný lockfile v domovskom priečinku.
- **QR sa nenačíta / spojenie vyprší:** skontrolujte rovnakú sieť, izoláciu klientov na Wi-Fi a povolenie Node.js cez firewall na súkromnej sieti. Vývojový server je na vašom počítači; cloudový localhost nie je dostupná telefónna ukážka.
- **Nesprávne SDK v Expo Go:** aktualizujte Expo Go a porovnajte podporované SDK s 58. Nerobte náhodný upgrade jednotlivých natívnych balíkov. Použite `npx.cmd expo install --check` a dokumentáciu Expo pre danú verziu. Ak distribúcia Expo Go už SDK 58 nepodporuje, potrebujete koordinovaný upgrade SDK alebo vlastný development build. Tento projekt nepridáva vlastný natívny modul, ktorý by sám vyžadoval development build.
- **Stará Metro cache:** zastavte server cez Ctrl+C a spustite `npm.cmd start -- --clear`.
- **Chýbajúce balíky:** použite `npm.cmd ci`, nie ručné úpravy lockfilu.
- **Chyba Node SQLite v testoch:** použite Node 24; databázové integračné testy používajú jeho `node:sqlite`. Telefón používa `expo-sqlite`, nie Node.
- **Offline režim Expo CLI:** `npx.cmd expo start --offline` preskočí online služby Expo, ale telefón stále potrebuje lokálne spojenie s Metro serverom. Nie je to dôkaz fungovania samostatného offline buildu.

Oficiálne návody: [Expo Go](https://docs.expo.dev/get-started/start-developing/), [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/), [zmena SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).

## Implementované funkcie

- Onboarding a perzistentný profil: 1–10 osôb, cieľ 3/7/14/30/90 dní, kcal, pitná voda a možnosť varenia.
- Päť záložiek: Domov, Zásoby, Plán, Pomoc, Nastavenia; svetlý/tmavý režim podľa systému.
- Zásoby: pridanie, úprava, vymazanie s potvrdením, kategórie, filtre, vyhľadávanie, poznámky, dátumy a kcal na zvolenú jednotku. Návrhy potravín nepridávajú vymyslené kcal.
- Oddelené krytie jedla a pitnej vody, upozornenia na dátumy a transparentné deficity.
- Editovateľné tematické checklisty, vlastné úlohy, kontakty a miesto stretnutia.
- Trvalý nákupný zoznam: návrh podľa deficitu a varenia, vlastné položky, úprava, označenie nákupu a vymazanie. Označenie „kúpené“ **nepridáva** zásobu; zásobu treba zaevidovať s údajmi z obalu.
- Šesť offline návodov, oficiálne zdrojové odkazy a potvrdenie pred otvorením núdzového vytáčania.
- Kryty: počiatočný zoznam je prázdny, bez GPS, vymyslených miest alebo demo záznamov. Schéma umožňuje budúci import. Prípadné miesta zo zálohy sú označené ako importované, bez garancie.
- Export JSON cez systémové zdieľanie a import cez výber súboru: kontrola schémy, limit 10 MB, potvrdenie pred prepísaním a transakčné obnovenie.

## Výpočty a pravidlá

```text
energia jedla = súčet (množstvo × kcal na zvolenú jednotku)
dni jedla = energia / (osoby × kcal na osobu a deň)
litre vody = súčet pitnej vody v l + pitnej vody v ml / 1000
dni vody = litre / (osoby × litre na osobu a deň)
deficit = max(0, cieľová potreba − evidovaná zásoba)
```

Do energie vstupuje len kategória Jedlo. Neznáme kcal sú `null`, nezapočítavajú sa a používateľ vidí vysvetlenie. Pitná voda sa eviduje iba v l/ml; voda v jedle sa automaticky nepočíta. Množstvo musí byť kladné. Na výpočet sa nezaokrúhľuje, čísla sa zaokrúhľujú pri zobrazovaní.

Položky s dátumom pred dnešným **miestnym kalendárnym dňom** zostávajú v evidencii, ale nevstupujú do krytia. Dnešný dátum sa ešte započítava. Upozornenie je do 30 dní vrátane. Po minimálnej trvanlivosti aplikácia netvrdí, že potravina je automaticky nebezpečná; odkazuje na kontrolu obalu a stavu. Kalórie nie sú zárukou vyváženej výživy ani bezpečnosti.

### Nákupná šablóna

Jednoduchý orientačný návrh delí **chýbajúcu energiu**, nepriraďuje odhadované kcal existujúcim zásobám:

| Možnosť varenia | Podiel energie a predpokladaná hustota                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Áno             | ryža 40 % pri 3 600 kcal/kg; vločky 30 % pri 3 700 kcal/kg; suché strukoviny 30 % pri 3 300 kcal/kg |
| Nie             | konzervy pripravené na jedenie 60 % pri 1 200 kcal/kg; trvanlivé pečivo 40 % pri 3 500 kcal/kg      |

Množstvo = deficit × podiel / hustota, zaokrúhlené nahor na 0,01 kg. Voda sa navrhuje podľa chýbajúcich litrov, nahor na 0,01 l. Hodnoty sú výslovné predpoklady šablóny, nie overené údaje konkrétnych výrobkov. Návrh nie je nutrične kompletný a nepozná ceny. Opakované pridanie návrhu zachová zoznam a môže pridať duplicity; používateľ dostane upozornenie.

## Architektúra a databáza

- `src/app`: navigácia a obrazovky Expo Router.
- `src/components`: spoločné prvky, prístupné formuláre a profil.
- `src/db/repository.ts`: migrácie, parametrizované SQL, CRUD a transakcie.
- `src/types/model.ts`: striktné Zod schémy a odvodené TS typy.
- `src/domain`: čisté výpočty, zálohy a prezentácia importovaných miest.
- `src/data/content.ts`: offline návody, katalóg názvov a počiatočné úlohy.
- `src/theme`: systémový svetlý/tmavý vzhľad.
- `src/i18n`: slovenské základné popisky a formátovanie; pred úplnou podporou ďalšieho jazyka treba doplniť preklady textov obrazoviek a knižnice. Prepínač jazyka zatiaľ nie je implementovaný.
- `tests`: doménové, skutočné SQLite integračné a React Native komponentové testy.

`ready.db` používa WAL. Migračná tabuľka `schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)` eviduje verziu 1. Tabuľky `households`, `inventory_items`, `shopping_items`, `checklist_items`, `emergency_contacts`, `safe_places` majú `id TEXT PRIMARY KEY NOT NULL` a `payload TEXT NOT NULL` s validovaným JSON dokumentom. Dokumentové riadky zachovávajú presnosť JS čísel a umožňujú jednotnú schému exportu; nejde o fulltextovo indexovaný skladový systém. Všetky zápisy aj načítanie sa validujú.

Profil má pevný identifikátor `main`. Ostatné záznamy používajú lokálne textové identifikátory; duplicity pri importe sa odmietajú. Dátumy na obale a dátum overenia miesta sú `RRRR-MM-DD`, export a migrácie používajú UTC ISO timestamp. Jednotky, kategórie a typy sú v schémach. Kryt obsahuje HTTPS zdroj, typ, dátum overenia, stav a poznámku; neobsahuje automatické tvrdenie o dostupnosti. Aktuálny MVP nemá verejný import adresára ani mapu.

Migrácia a seed úloh sa vykonajú iba raz. Import neobnovuje používateľom odstránené úlohy. Novšia neznáma schéma sa odmietne bez mazania. Ďalšie migrácie musia byť aditívne alebo zachovať dáta v transakcii; nezvyšujte verziu spôsobom, ktorý databázu resetuje.

JSON záloha má tvar `{ "version": 1, "exportedAt": "UTC ISO dátum", "data": { "household": ..., "inventory": [], "shopping": [], "checklists": [], "contacts": [], "safePlaces": [] } }`. Autoritatívna schéma je `backupSchema` v `src/types/model.ts`.

## Kontroly a obmedzenia

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run format:check
npm.cmd run export:mobile
```

Výsledky a presný ručný scenár sú v [docs/VALIDATION.md](docs/VALIDATION.md). Export vytvorí JS/Hermes balíky, **nie inštalovateľné APK/IPA**. Samostatný natívny build nebol vytvorený. Web nie je cieľom MVP a nebol overený; SQLite na webe vyžaduje ďalšiu konfiguráciu workerov a hlavičiek.

Oficiálne stránky zdrojov boli v cloudovom prostredí blokované HTTP politikou. Dátum 2026-11-03 označuje redakčnú kontrolu pribaleného všeobecného textu, nie overenie aktuálneho obsahu webov. Pred verejným používaním treba obsah a odkazy porovnať s aktuálnymi pokynmi slovenských úradov.

**READY nie je oficiálna výstražná služba. V kríze sa riaď pokynmi záchranných zložiek a úradov.**
