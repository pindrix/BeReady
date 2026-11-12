# BE READY 1.10 — detailné postavy a lokálne 3D vykresľovanie

Aktívne scény kreslí Three.js v lokálnom WebView. Verzia 1.10 používa anatomickú postavu s textúrami pokožky, civilného oblečenia, vlasov a očí. Model má 23 270 trojuholníkov a kostru so 163 kosťami. Inverzná kinematika smeruje ruky a nohy k zadaným polohám pri balení, prvej pomoci a ostatných úkonoch. Scény dopĺňajú detailnejšie miestnosti, rastliny, vetvy, lístie a terén. Oheň používa shader riadený fázou prehrávača.

[Skutočné balenie](screenshots/v1.10/go-bag.png), [prvá pomoc](screenshots/v1.10/adult-cpr.png) a [oheň](screenshots/v1.10/campfire.png) zachytávajú renderer v prehliadači s testovacími adaptérmi. [Návrhový obrázok](design/graphics-target-concept.png) zostáva cieľom umeleckého smerovania; nie je záznamom aplikácie. Ide o tréningové ilustrácie s animovanou kostrou, bez pohybovej snímky reálneho zásahu či fyzikálnej simulácie.

## Lokálne zdroje a licencie

- `assets/models/responder.glb` (približne 3,34 MB) obsahuje geometriu, kostru a všetky textúry. Model vznikol úpravou údajov MakeHuman uvoľnených ako CC0; pôvod, úpravy a kontrolné súčty vstupov sú v [responder-license.json](../assets/models/responder-license.json). Plný text je v [CC0-LICENSE.txt](../assets/models/CC0-LICENSE.txt). Programový kód MakeHuman sa nebalí.
- GLB je súčasťou repozitára. Bežné spustenie ani zostavenie nevyžaduje jeho opätovné vytvorenie. Vývojový `scripts/build-human.py --source /cesta/k/vstupom` používa Python, NumPy a Pillow; očakávané mená vstupov a ich kontrolné súčty sú v uvedenom súbore pôvodu.
- `npm run graphics:build` vloží GLB aj Three.js 0.187.0 do `src/simulation/graphics-runtime.json`. Tento vygenerovaný súbor je tiež uložený v repozitári. Po zmene rendereru, scén alebo modelu ho treba obnoviť. Licencia Three.js je v `licenses/three.txt`.
- Modely, textúry, svetelné prostredie a vykresľovací kód sa načítavajú lokálne. Nie je potrebný CDN ani vzdialený HDR alebo model. Dvadsaťštyri WebP náhľadov je zachytených zo skutočného rendereru; zatvorené vysvetlenia nezakladajú WebView ani časovač.
- `react-native-webview` 14.0.1 zodpovedá lokálnemu manifestu Expo SDK 58. Expo Go musí podporovať túto verziu SDK. Aktualizácia projektu vyžaduje `npm ci`.

## Pohyb a výkon

Pôvodný prehrávač riadi spustenie, pauzu, krok a jeho trvanie. GPU renderer používa monotónny `MotionClock` a `requestAnimationFrame`: medzi približne 10 správami prehrávača za sekundu dopočítava polohu v aktuálnom kroku. Nezávisí teda od pôvodného limitu softvérového 3D na približne 15 prekreslení za sekundu. Sám neprepína krok ani titulok a nezačne bez výslovného stavu prehrávania.

Pauza a zmena kroku prijmú presnú fázu od ovládača. Skrytie dokumentu zastaví cyklus; návrat čaká na čerstvú správu. Zmena kroku zachováva GPU kontext a načítaný model. Pri pozastavení, obmedzenom pohybe alebo dosiahnutí konca kroku sa ďalšie animačné zábery neplánujú.

Modely a materiály sa opakovane používajú. GPU cesta prenáša opis postavy bez vytvárania jej softvérových plôch v každom zábere. Prostredia používajú zdieľané inštancie listov a ďalších opakovaných prvkov. Pomer vykresľovacích pixelov je pri pohybe najviac 1 a pri pauze najviac 2; mapa tieňov sa pri pohybe obnovuje približne 10-krát za sekundu.

To sú implementačné opatrenia, nie dôkaz dosiahnutého mobilného výkonu. Cloudový Chromium s procesorovým SwiftShaderom pri kontrole nameral približne **6,67 záberu za sekundu**. Tento výsledok nezaručuje plynulosť a neudáva výkon telefónu. Android/iPhone GPU, čas prvého načítania, zahrievanie a spotrebu batérie treba zmerať na zariadení.

## Izolácia a náhradné zobrazenie

HTML povoľuje `connect-src blob:` iba pre pribalené obrazové dáta glTF. HTTP(S) spojenia v dokumente ostávajú zakázané. Natívny komponent odmieta navigáciu mimo `about:blank`; nemá prístup k lokálnym súborom, zdieľaným cookies ani DOM úložisku. Most prenáša opis scény, fázu, stav prehrávania, kameru a vzhľad, bez údajov domácnosti.

Kým sa nepotvrdí načítanie modelu a prvý dokončený záber, zostáva viditeľná miestna kresba. Pri chybe WebGL, shaderu, modelu či webového procesu alebo po 8-sekundovom časovom limite sa použije softvérové 3D. Pôvodné 2D schémy zostávajú na výber. Odchod z natívnej obrazovky odstráni WebView. Pri odpojení sa uvoľňujú geometrie, materiály, textúry, kostry, odbery a vlastné GPU zdroje.

## Overenie a zostavenie

Kontrola vykreslila všetkých 135 krokov, vytvorila 24 náhľadov a overila pohyb medzi správami mosta, presnú pauzu, zachovanie kontextu pri zmene kroku a arabské RTL na malom displeji. Nenašla chyby JavaScriptu ani externé HTTP požiadavky. Presný report je v [screenshots/v1.10/review.json](screenshots/v1.10/review.json). Automatické testy navyše kontrolujú časovanie, statické stavy, pozadie, lokálnosť GLB, normalizované váhy kostry, protokol a návrat na náhradnú kresbu.

Samostatný Android build zatiaľ blokuje sieťové odmietnutie oficiálneho zdroja `repo.reactnative.dev`. Uložený návrh povolenia domény treba uplatniť v nastaveniach cloudového prostredia a následne dokončiť celé natívne zostavenie. [Postup pre preview APK](ANDROID_PREVIEW_BUILD.md) odlišuje skutočný APK od exportu JavaScriptu a ZIP archívu zdrojov.

Fyzický telefón a samostatný studený offline štart ešte neboli overené. Prvá pomoc a civilná ochrana vrátane polôh postáv vyžadujú odbornú revíziu. Grafika nemení platnosť pokynov ani licenciu: platený offline režim vyžaduje platné podpísané oprávnenie. Produkčný Play Billing zatiaľ nie je pripojený.
