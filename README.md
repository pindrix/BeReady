# BE READY 1.7 — Domácnosť pripravená krok za krokom

Mobilná aplikácia pre pripravenosť domácnosti. Expo SDK 58, React Native, striktný TypeScript, Expo Router a SQLite. Osobné údaje domácnosti zostávajú lokálne. Bez reklamného SDK a vzdialeného sledovania.

## Čo je nové vo verzii 1.7

- **Dva voliteľné vzhľady:** predvolený Aurora Command (tmavá modrá, mätové akcenty) a Field Atlas (svetlá piesková, grafit a jantár). Vyberajú sa v **Nastavenia → Vzhľad aplikácie**. Zmena je okamžitá a voľba sa uloží lokálne aj po reštarte.
- **Nová značka BE READY** v rozhraní, 21 jazykových verziách, názve aplikácie a ikonách. Technické identifikátory zostávajú kompatibilné s existujúcou inštaláciou a zálohami.
- **Interaktívny domov:** dve lokálne ilustrácie domu s aktívnymi bodmi. Voda a jedlo otvoria príslušný filter skutočných zásob; rodina otvorí Plán. Ide o ilustráciu s navigáciou, nie otočný 3D model.
- **Prehľadné údaje:** samostatné krytie jedla a pitnej vody, pokrok úloh a výrazná pomoc teraz. Výpočty vychádzajú zo skutočne evidovaných údajov. Vzhľad sa prenáša aj do návodov, formulárov a animovaných scén.
- Nové ilustrácie majú spolu približne 265 KiB a načítavajú sa lokálne. Závislosti sa nemenia. Pravidlá licencie a plateného offline prístupu zostávajú zachované.

[**Aurora Command**](docs/screenshots/v1.7/aurora-preview.png) · [**Field Atlas**](docs/screenshots/v1.7/atlas-preview.png) · [Prepínač vzhľadu](docs/screenshots/v1.7/atlas-appearance.png). Snímky sú zo skutočných komponentov s testovacími údajmi v prehliadačovom QA prostredí. Podrobnosti: [docs/APPEARANCE.md](docs/APPEARANCE.md).

## Základ z verzie 1.6

- **Animácia v každom z 20 sprievodcov:** priamo pri aktuálnom kroku, s popisom tesne pod scénou. Pri zmene kroku sa ukážka zastaví a pripraví nový obrázok. Rozšírená knižnica obsahuje 24 postupov so 101 krokmi vrátane špecializovanej prvej pomoci, ohňa a civilnej ochrany.
- **54 nových názorných diagramov:** povodeň, požiar, výstrahy, chemický únik, evakuácia, jedlo bez varenia, prvé minúty pri úraze, horúčava, búrka, zima, zvieratá, digitálne doklady, turistika a pomoc ľuďom so špecifickými potrebami. Pohyb znázorňuje presun do úkrytu, odchod od rizika, kontrolu informácií alebo pridanie predmetu do výbavy. Nie je to navigácia po skutočnej bezpečnej trase.
- **12 vizuálnych vysvetlení v 15 pracovných obrazovkách:** profil, cieľ zásob, evidencia, deficit nákupu, balenie, rodinný plán, zálohy, licencia, scenáre, misie, kryty a offline obsah. Kompaktná ilustrovaná karta sa rozbalí na požiadanie. Nemá vplyv na údaje, uložený pokrok, nákup ani platnosť licencie.
- **Ovládanie pre malý displej:** prehrávanie, pauza, ručný výber kroku, opakovanie a statické scény pri obmedzenom pohybe. Zatvorené vysvetlenia nemajú časovače; scény sa pri každom posune časovej osi zbytočne neprekresľujú. Text je dostupný vždy.
- **Vyhľadávanie animácií aj v preklade**, všetkých 21 jazykov a pribalené grafické prvky. Nepribudol natívny balík ani potreba sťahovať video. Offline prístup naďalej určuje existujúca licencia.

[Animované vysvetlenie výpočtu](docs/screenshots/v1.6/coverage-demo.gif) · [Nové scény](docs/screenshots/v1.6/scenes.jpg) · [Vložená animácia v návode](docs/screenshots/v1.6/reader-flood.png). Ide o prehliadačový QA fixture, nie záznam fyzického telefónu. Podrobný rozsah v [docs/EXPLANATORY_ANIMATIONS.md](docs/EXPLANATORY_ANIMATIONS.md).

## Základ z verzie 1.5

- **Dva nové animované postupy civilnej ochrany:** vojnový konflikt (5 krokov) a jadrový výbuch/spad (6 krokov). Celkom 10 animovaných návodov a 47 krokov.
- **Vlastné scény pre každý úkon:** rodinný plán, ukrytie, evakuácia podľa úradov, odstup od neznámych predmetov, rádio; pri jadrovom výbuchu ochrana hlavy za krytom, presun do pevnej budovy, suterén, kontaminovaný odev a umytie, pobyt vnútri, uzavreté zásoby a lieky len podľa úradov.
- **Text priamo pod scénou**, ručné kroky, pauza, časová os a systémové obmedzenie pohybu. Bez prudkého blikania. Čas animácie nie je bezpečný čas na opustenie úkrytu.
- Texty sa preberajú priamo z existujúcich návodov so všetkými 21 prekladmi. Scény sú pribalené pre platený offline režim; netreba sťahovať video ani nové závislosti.

[Ukážka prehrávania](docs/screenshots/v1.5/nuclear-demo.gif) · [Všetkých 11 scén](docs/screenshots/v1.5/scenes.jpg). Ide o prehliadačový QA náhľad skutočných komponentov, nie záznam telefónu. Odborné overenie obsahu a hranice zdrojov platia naďalej podľa [docs/CIVIL_PROTECTION.md](docs/CIVIL_PROTECTION.md).

## Základ z verzie 1.4

- **Popis hneď pod animáciou:** názov a text aktuálneho kroku sú v spoločnej karte priamo pod scénou, pred časovou osou a tlačidlami. Menia sa spolu so scénou.
- **Sviežejšie rozhranie:** modrá a mentolová paleta, svetlé povrchy a čitateľné nočné farby.
- **Prvé spustenie:** otvorí sa výber z 21 jazykov a následne výber krajiny pobytu. Jazyk aj krajinu možno zmeniť v Nastaveniach; krajinu aj v Rýchlej pomoci. Nepoužíva sa GPS a jazyk nepredurčuje krajinu.
- **Tiesňové čísla pre 36 krajín:** všetky krajiny EÚ, Spojené kráľovstvo, USA, Kanada, Austrália, Nový Zéland, India, Švajčiarsko, Nórsko a Island. Používajú sa v Rýchlej pomoci, Akadémii, rodinnej karte a číselných pokynoch návodov. Pre inú alebo neurčenú krajinu sa čísla neodhadujú a tlačidlo volania sa nezobrazí. Ide o národné kontakty, nie garanciu miestneho pokrytia služby.
- **Civilná ochrana:** dva nové pribalené návody o príprave civilistov na vojnový konflikt a o jadrovom výbuchu/spade. Celkom 20 sprievodcov. Pokrývajú rodinný plán, ukrytie, evakuáciu, nevybuchnutú muníciu, ochranu pri záblesku, spad, základnú dekontamináciu a bezpečné zásoby. Neobsahujú živé varovania ani oznámenie konca nebezpečenstva.

[Nový prehrávač](docs/screenshots/v1.4/animations.png) · [Domov](docs/screenshots/v1.4/home.png) · [Jadrový výbuch](docs/screenshots/v1.4/guide.png).

Zdrojové odkazy a hranice overenia sú v [docs/CIVIL_PROTECTION.md](docs/CIVIL_PROTECTION.md) a [docs/COUNTRIES.md](docs/COUNTRIES.md). Aktuálne zdroje blokovala sieťová politika; pred verejným vydaním treba údaje, bezpečnostné postupy aj preklady odborne skontrolovať.

## Základ z verzie 1.3

- **Osem animovaných návodov, 36 názorných krokov:** evakuačný batoh, pitná voda, blackout, rodinný komunikačný plán, resuscitácia dospelého, silné krvácanie, malé tepelné popálenie a malý oheň na povolenom vonkajšom ohnisku.
- **Ovládané prehrávanie:** spustenie a pauza, opakovanie, posun po časovej osi a výber kroku. Pri odchode z obrazovky alebo prepnutí aplikácie do pozadia sa prehrávanie zastaví. Systémové obmedzenie pohybu zobrazí statické scény.
- **Lokálna grafika a 21 jazykov:** scény aj preklady sú súčasťou aplikácie; platený offline prístup používa existujúcu licenčnú kontrolu. Nejde o streamované videá. Vstup je na Domove, v Akadémii a pri príslušných návodoch.

[Ukážka skutočného prehrávania batoha](docs/screenshots/v1.3/bag-demo.gif) · [Praktické scény](docs/screenshots/v1.3/practical-scenes.jpg) · [Podrobnosti ovládania](docs/ANIMATIONS.md).

Prvá pomoc je tréningová ilustrácia a nenahrádza kurz ani pokyny operátora tiesňovej linky. Čas klipu nie je čas ošetrenia ani tempo resuscitácie. Aktuálne stránky NHS/NPS sa v tomto prostredí nepodarilo načítať; pred verejným vydaním potrebujú postupy a ich preklady odbornú revíziu. Presný rozsah a zdroje sú v [docs/PRACTICAL_CONTENT.md](docs/PRACTICAL_CONTENT.md).

## Základ z verzie 1.2

- **21 jazykov rozhrania a pribaleného obsahu.** Výber v onboardingu a Nastaveniach, uložená preferencia, arabské RTL, lokálne slovníky a čísla. Pracovné preklady nie sú odbornou certifikáciou; pred verejným vydaním potrebujú jazykovú a bezpečnostnú revíziu. Podrobnosti v [docs/LOCALIZATION.md](docs/LOCALIZATION.md).
- **Vizuálna baliaca stanica:** osem modulov evakuačného batoha, až 24 položiek, voliteľné potreby zvierat, skutočne uložený pokrok a výpočet vody podľa domácnosti. Zásoba domácnosti sa nezamieňa s hmotnosťou prenosného batoha.
- **Päť interaktívnych scenárov:** blackout, evakuácia, problém s pitnou vodou, búrka a úraz. Voľby vedú k rôznym bezpečným výsledkom, umožňujú návrat a odkazujú na skutočné pribalené návody. Ide o nácvik, nie živé riadenie zásahu.
- **18 ilustrovaných sprievodcov, sedem misií s kvízmi, prehľad zásob a rodinná karta** zostávajú súčasťou aplikácie. YouTube ponúka 8 tematických vyhľadávaní, nie overené jednotlivé videá ani offline prehrávanie.
- **Licencia podľa zadania:**14 dní online skúšania, potom jedna platba 10 USD za 12 mesiacov bez automatického obnovenia. Offline funkcie a návody sa odomknú až po overenej platbe. Čítanie/export vlastných údajov a tiesňové čísla zostávajú dostupné.
- **Overovanie podpisu a offline cache:** klient vie overiť Ed25519 oprávnenie, jeho platnosť a načítať ho po reštarte. Zmena dátumu, lokálny Boolean či import zálohy samy o sebe neaktivujú platený prístup.

**Skutočné platby zatiaľ nie sú pripojené.** Používateľ má Google Play Console, ale repozitár zatiaľ nemá produkčný Play Billing bridge, prepojený produkt, dôveryhodnú podpisovú službu ani produkčný verejný kľúč. Nákupné tlačidlá sú preto neaktívne. Vývojový online náhľad zostáva dostupný aj po uplynutí skúšky; **offline prístup sa tým neodomkne**. Aplikácia nič neúčtuje a nevydáva falošnú licenciu. Presné kroky na dokončenie v [docs/BILLING.md](docs/BILLING.md).

Dizajn vychádza z aktuálnych oficiálnych materiálov M3 Expressive a zásad prístupnosti React Native; dôkazy a hranice overenia sú v [docs/DESIGN_RESEARCH.md](docs/DESIGN_RESEARCH.md). Ilustrácie domácnosti sú vygenerované pre BE READY a pribalené lokálne ako WebP; nevyžadujú sťahovanie zo siete. Ukážky [Domov](docs/screenshots/home.png), [Akadémia](docs/screenshots/academy.png) a [Misie](docs/screenshots/missions.png) sú renderované skutočnými komponentmi s označenými testovacími údajmi v prehliadačovom QA prostredí, nie snímky fyzického telefónu.

Ak už máte klon predchádzajúcej verzie, v jeho priečinku spustite:

```powershell
git pull --ff-only
npm.cmd ci
npm.cmd start -- --lan
```

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

Príkazy `npm` spúšťajte v priečinku projektu, nie v domovskom priečinku používateľa. Kontrola vyššie musí nájsť oba súbory projektu.

4. Počítač aj telefón pripojte k rovnakej dôveryhodnej Wi-Fi.
5. **Android:** otvorte Expo Go a použite skener QR kódu z terminálu.
6. **iPhone:** naskenujte QR fotoaparátom a otvorte odkaz v Expo Go. Mac nie je potrebný na skúšku v Expo Go na fyzickom iPhone.
7. Vyplňte profil domácnosti a pridajte vlastné zásoby. Pri vývojovom spustení nechajte Metro server na počítači zapnutý.

`npm.cmd` obchádza bežné blokovanie `npm.ps1` politikou PowerShell bez zmeny bezpečnostnej politiky systému. Na macOS/Linux použite `npm`.

### Časté problémy

- **`npm ci` hlási EUSAGE alebo chýbajúci lockfile; `npm start` hlási ENOENT pre `package.json`:** príkazy bežia v nesprávnom priečinku. Prejdite cez `Set-Location` do priečinka aplikácie a overte `Get-ChildItem package*.json`. Musia sa zobraziť `package.json` aj `package-lock.json`. Nevytvárajte nový projekt cez `npm init` a nevyrábajte náhradný lockfile v domovskom priečinku.
- **QR sa nenačíta / spojenie vyprší:** skontrolujte rovnakú sieť, izoláciu klientov na Wi-Fi a povolenie Node.js cez firewall na súkromnej sieti. Vývojový server je na vašom počítači; cloudový localhost nie je dostupná telefónna ukážka.
- **Nesprávne SDK v Expo Go:** aktualizujte Expo Go a porovnajte podporované SDK s 58. Nerobte náhodný upgrade jednotlivých natívnych balíkov. Použite `npx.cmd expo install --check` a dokumentáciu Expo pre danú verziu. Ak distribúcia Expo Go už SDK 58 nepodporuje, potrebujete koordinovaný upgrade SDK alebo vlastný development build. Tento projekt nepridáva vlastný natívny modul, ktorý by sám vyžadoval development build.
- **Stará Metro cache:** zastavte server cez Ctrl+C a spustite `npm.cmd start -- --clear`.
- **Chýbajúce balíky:** použite `npm.cmd ci`, nie ručné úpravy lockfilu.
- **Chyba Node SQLite v testoch:** použite Node 24; databázové integračné testy používajú jeho `node:sqlite`. Telefón používa `expo-sqlite`, nie Node.
- **Offline režim Expo CLI:** `npx.cmd expo start --offline` preskočí online služby Expo, ale telefón stále potrebuje lokálne spojenie s Metro serverom. Nie je to dôkaz fungovania samostatného offline buildu.

Oficiálne návody: [Expo Go](https://docs.expo.dev/get-started/start-developing/), [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/), [zmena SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).

## Implementované funkcie

- Onboarding a perzistentný profil: 1–10 osôb, cieľ 3/7/14/30/90 dní, kcal, pitná voda a možnosť varenia.
- Päť záložiek: Domov, Zásoby, Plán, Pomoc, Nastavenia; dva voliteľné vzhľady Aurora Command a Field Atlas.
- Zásoby: pridanie, úprava, vymazanie s potvrdením, kategórie, filtre, vyhľadávanie, poznámky, dátumy a kcal na zvolenú jednotku. Návrhy potravín nepridávajú vymyslené kcal.
- Oddelené krytie jedla a pitnej vody, upozornenia na dátumy a transparentné deficity.
- Editovateľné tematické checklisty, vlastné úlohy, kontakty a miesto stretnutia.
- Trvalý nákupný zoznam: návrh podľa deficitu a varenia, vlastné položky, úprava, označenie nákupu a vymazanie. Označenie „kúpené“ **nepridáva** zásobu; zásobu treba zaevidovať s údajmi z obalu.
- Osemnásť pribalených návodov, oficiálne zdrojové odkazy a potvrdenie pred otvorením núdzového vytáčania. Offline režim vyžaduje platnú licenciu.
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
- `src/theme`: palety Aurora Command a Field Atlas; preferencia v `src/state/appearance.ts`.
- `src/i18n`:21 pribalených jazykov, formátovanie, preferencia a RTL. Osobné údaje sa neprekladajú ani neposielajú prekladovej službe.
- `tests`: doménové, skutočné SQLite integračné a React Native komponentové testy.

`ready.db` používa WAL. Migračná tabuľka `schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)` eviduje verziu 1. Tabuľky `households`, `inventory_items`, `shopping_items`, `checklist_items`, `emergency_contacts`, `safe_places` majú `id TEXT PRIMARY KEY NOT NULL` a `payload TEXT NOT NULL` s validovaným JSON dokumentom. Dokumentové riadky zachovávajú presnosť JS čísel a umožňujú jednotnú schému exportu; nejde o fulltextovo indexovaný skladový systém. Všetky zápisy aj načítanie sa validujú.

Profil má pevný identifikátor `main`. Ostatné záznamy používajú lokálne textové identifikátory; duplicity pri importe sa odmietajú. Dátumy na obale a dátum overenia miesta sú `RRRR-MM-DD`, export a migrácie používajú UTC ISO timestamp. Jednotky, kategórie a typy sú v schémach. Kryt obsahuje HTTPS zdroj, typ, dátum overenia, stav a poznámku; neobsahuje automatické tvrdenie o dostupnosti. Aktuálny MVP nemá verejný import adresára ani mapu.

Dokončenia misií, záložky, balenie a nácviky používajú menné priestory `mission-<id>`, `bookmark-<id>`, `kit-<id>` a `drill-<id>` v existujúcej tabuľke checklistov. Bežný Plán ich nezobrazuje; progress a záložky počítajú iba aktuálne známe ID. Tým sa zachováva schéma aj kompatibilita starších záloh verzie 1. Export obsahuje aj tieto nové záznamy. V budúcej migrácii ich možno presunúť do samostatnej tabuľky pri zachovaní údajov.

Migrácia a seed úloh sa vykonajú iba raz. Import neobnovuje používateľom odstránené úlohy. Novšia neznáma schéma sa odmietne bez mazania. Ďalšie migrácie musia byť aditívne alebo zachovať dáta v transakcii; nezvyšujte verziu spôsobom, ktorý databázu resetuje.

JSON záloha má tvar `{ "version": 1, "exportedAt": "UTC ISO dátum", "data": { "household": ..., "inventory": [], "shopping": [], "checklists": [], "contacts": [], "safePlaces": [] } }`. Autoritatívna schéma je `backupSchema` v `src/types/model.ts`.

## Vizuálna kontrola pre vývojárov

```powershell
npm.cmd run visual:preview
# Voliteľné snímky; prvýkrát nainštalujte Chromium pre Playwright:
npx.cmd playwright install chromium
npm.cmd run visual:capture
```

Tento nástroj renderuje skutočné komponenty Home, Academy a Missions cez React Native Web s výslovne oddeleným testovacím store. Natívne služby nahrádzajú testovacie adaptéry. Nie je to produkčný web ani náhrada spustenia na telefóne. Snímky pokrývajú 390/320 px, svetlý/tmavý režim a kontrolu horizontálneho pretečenia. Server počúva iba na loopbacku; voliteľná premenná `READY_CHROMIUM_PATH` vyberie vlastný Chromium. Vizuálny harness vyžaduje lokálny prehliadač a neposiela údaje domácnosti.

## Prístup a licencia

| Režim                                   | Online nástroje          | Chránené offline funkcie                 |
| --------------------------------------- | ------------------------ | ---------------------------------------- |
| 14-dňová skúška v produkcii             | Áno                      | Nie                                      |
| Platná overená ročná licencia           | Áno                      | Áno, do overeného konca platnosti        |
| Skončená skúška/licencia                | Vyžaduje nákup           | Nie                                      |
| Vývojová verzia bez pripojených platieb | Označený vývojový náhľad | Nie, bez platného podpísaného oprávnenia |

Tiesňové čísla, Nastavenia a čítanie/export vlastných údajov sú mimo zámku. Oprávnenie ani začiatok skúšky sa neprenášajú JSON zálohou. Jazyková preferencia je samostatná lokálna voľba.

## Kontroly a obmedzenia

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run i18n:check
npm.cmd run format:check
npm.cmd run export:mobile
```

Výsledky a presný ručný scenár sú v [docs/VALIDATION.md](docs/VALIDATION.md). Export vytvorí JS/Hermes balíky, **nie inštalovateľné APK/IPA**. Samostatný natívny build nebol vytvorený. Web nie je cieľom MVP a nebol overený; SQLite na webe vyžaduje ďalšiu konfiguráciu workerov a hlavičiek.

Oficiálne stránky zdrojov boli v cloudovom prostredí blokované HTTP politikou. Dátum 2026-11-03 označuje redakčnú kontrolu pribaleného všeobecného textu, nie overenie aktuálneho obsahu webov. Pred verejným používaním treba obsah a odkazy porovnať s aktuálnymi pokynmi slovenských úradov.

**BE READY nie je oficiálna výstražná služba. V kríze sa riaď pokynmi záchranných zložiek a úradov.**
