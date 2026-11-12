# BE READY — 3D postupy

Všetkých 24 animovaných návodov (101 krokov) a 12 vysvetlení funkcií (34 krokov) má predvolený 3D pohľad. Súčasťou sú balenie batoha, voda, blackout, komunikácia, prvá pomoc, oheň a civilná ochrana vrátane jadrového výbuchu. Názov a popis aktuálneho kroku zostávajú hneď pod scénou.

Od verzie 1.10 používa GPU cesta anatomický model s kostrou a textúrami, inverznú kinematiku a detailnejšie prostredia. Model aj vykresľovací kód sú pribalené. [GPU_GRAPHICS.md](GPU_GRAPHICS.md) opisuje aktuálny renderer, pôvod modelu, výkon a hranice overenia. Pôvodné softvérové 3D z verzie 1.8 zostáva dostupné ako náhrada pri nedostupnom WebGL.

## Ovládanie

- Prehrať, Pozastaviť a ručný krok riadi pôvodný prehrávač. Prepnutie kroku v čítanom návode začne pozastavenou scénou.
- Šípky otáčajú kameru; −/+ menia priblíženie. Stredné tlačidlo obnoví pohľad. Kamera nemení krok, údaje ani prehrávanie.
- Prepínač 3D/2D ponecháva pôvodné ilustrované schémy dostupné. Pri chybe GPU sa použije miestne softvérové 3D; pri chybe tejto kresby sa zobrazí 2D.
- Režim obmedzeného pohybu používa statický záber a ponecháva ručné ovládanie. Odchod z obrazovky alebo prepnutie aplikácie do pozadia zastaví prehrávač.
- Zatvorené vysvetlenia používajú WebP náhľad bez GPU kontextu, časovača alebo odberu animačných hodnôt.

Kamera má obmedzený rozsah. Popisy a tlačidlá podporujú 21 jazykov; Aurora Command a Field Atlas používajú odlišné palety.

## Rozsah a hranice

Ide o tréningové 3D ilustrácie. Postavy sa pohybujú podľa zadaných póz a cieľových bodov, bez fyzikálnej simulácie následkov nehody, radiácie, požiaru alebo liečby. Niektoré kroky vedome ukazujú rovnakú polohu, pretože úkon pokračuje.

Zachované sú pôvodné upozornenia, zdroje, výber krajiny a potvrdenie tiesňového vytáčania. Rýchlosť animácie nie je tempo resuscitácie, čas ošetrenia, bezpečný čas na opustenie úkrytu ani údaj o vychladnutí ohniska. AED krok zobrazuje pomocníka mimo kontaktu s človekom; text a obrázky konkrétneho prístroja určujú umiestnenie elektród. Prvá pomoc aj civilná ochrana vrátane polôh postáv potrebujú pred verejným vydaním odbornú revíziu.

3D nemení licenčné oprávnenia. Platený offline režim sa naďalej odomyká iba platným podpísaným oprávnením. Zmena pohľadu nič neúčtuje; produkčné platby zatiaľ nie sú pripojené.

## Dve cesty vykreslenia

GPU cesta (`gpu-runtime.ts`, `human-renderer.ts`, `set-dressing.ts`) kreslí cez Three.js so z-bufferom a zdieľanými materiálmi. `MotionClock` dopočítava fázu v lokálnom `requestAnimationFrame` medzi správami pôvodného prehrávača. Zmena kroku zachová načítaný model a kontext; pauza a obmedzený pohyb nevytvárajú ďalšie animačné zábery.

Softvérová náhrada používa `geometry.ts`, `world.ts` a existujúce `react-native-svg`: transformuje XYZ vrcholy, osvetlí a zoradí plochy podľa hĺbky. Jej jednoduché postavy zostávajú zostavené z geometrických primitív a zložité prieniky môžu mať vizuálne nepresnosti. Táto cesta odoberá hodnotu prehrávača a obmedzuje prekreslenie približne na 15 záberov za sekundu; nový GPU renderer týmto limitom riadený nie je.

Lokálny cyklus sám nezaručuje výkon telefónu. Pri kontrole cez procesorový SwiftShader v cloude bolo nameraných približne 6,67 záberu za sekundu. Mobilnú plynulosť, zahrievanie a batériu treba zmerať na fyzickom zariadení.

## Overenie

Jednotkové testy prechádzajú všetkých 101 krokov v troch fázach a oboch vzhľadoch, všetkých 34 vysvetlení, konečnosť súradníc, obmedzenie počtu plôch, perspektívu a kameru. Ďalšie testy kontrolujú lokálny rigovaný GLB, váhy kostry, interpoláciu, pauzu, zmenu kroku, pozadie a náhradné zobrazenie.

[Prehliadačový report 1.10](screenshots/v1.10/review.json) zahŕňa všetkých 135 krokov, načítanie skutočnej postavy, pohyb medzi správami mosta, pauzu, zachovanie kontextu a RTL. Snímky sú z toho istého vloženého dokumentu ako natívne WebView, s testovacími adaptérmi služieb. Nenahrádzajú natívny štart, skúšku telefónu, platený offline štart ani odbornú kontrolu postupov. Stav natívneho zostavenia je v [ANDROID_PREVIEW_BUILD.md](ANDROID_PREVIEW_BUILD.md).
