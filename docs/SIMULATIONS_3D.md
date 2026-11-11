# BE READY — štýlizované 3D postupy

Od verzie 1.9 je predvolený GPU renderer, opísaný v [GPU_GRAPHICS.md](GPU_GRAPHICS.md). Nižšie je základ zavedený vo verzii 1.8, ktorý zostáva dostupný ako softvérová náhrada.

Všetkých 24 animovaných návodov (101 krokov) a 12 vysvetlení funkcií (34 krokov) má predvolený 3D pohľad. Postavičky, otvorené miestnosti, nábytok a predmety sú vytvorené z lokálnej geometrie. Súčasťou sú balenie batoha, voda, blackout, komunikácia, prvá pomoc, oheň a civilná ochrana vrátane jadrového výbuchu. Názvy a popisy krokov sa naďalej preberajú z pôvodných textov, hneď pod scénou.

## Ovládanie

- Prehrať / Pozastaviť / ručný krok riadi pôvodný prehrávač. Prepnutie kroku v čítanom návode začne pozastavenou scénou.
- Šípky otáčajú kameru; −/+ menia priblíženie. Stredné tlačidlo obnoví pohľad. Kamera nemení krok, údaje ani prehrávanie.
- Prepínač 3D / 2D ponecháva pôvodné ilustrované schémy dostupné. Pri chybe kreslenia sa automaticky zobrazí 2D.
- Režim obmedzeného pohybu používa statický záber a ponecháva ručné ovládanie. Odchod z obrazovky alebo prepnutie aplikácie do pozadia zastaví pôvodný prehrávač.
- Zatvorené vysvetlenia zobrazujú statický 3D náhľad bez časovača alebo odberu animačných hodnôt.

Kamera má obmedzený rozsah, aby zostal otvorený rez miestnosťou čitateľný. Popisy a tlačidlá kamery podporujú všetkých 21 jazykov. Aurora Command a Field Atlas používajú odlišný podklad a materiál miestností.

## Rozsah a hranice

Ide o štylizované 3D tréningové ilustrácie, nie fyzikálny simulátor následkov nehody, šírenia radiácie, požiaru alebo liečby. Nejde o fotorealistické modely ľudí. Niektoré kroky vedome ukazujú rovnakú polohu (napríklad pokračovanie v tlaku či resuscitácii), pretože ide o pokračovanie toho istého úkonu.

Zachované sú pôvodné bezpečnostné upozornenia, zdroje, výber krajiny a potvrdenie tiesňového vytáčania. Rýchlosť kresleného pohybu nie je tempo stláčania hrudníka, čas ošetrenia, bezpečný čas na opustenie úkrytu ani údaj o vychladnutí ohniska. AED krok zobrazuje pomocníka mimo kontaktu s človekom; text a obrázky konkrétneho prístroja určujú umiestnenie elektród. Postupy prvej pomoci aj civilnej ochrany vrátane nových polôh postavičiek potrebujú pred verejným vydaním odbornú revíziu.

3D nepridáva nové licenčné oprávnenie. Modely sú lokálne; platený offline režim sa naďalej odomyká iba platným podpísaným oprávnením. Zmena pohľadu nič neúčtuje.

## Implementácia a výkon

`src/simulation/geometry.ts` obsahuje XYZ vrcholy, transformácie, perspektívnu kameru, normály, smerové osvetlenie a triedenie plôch. `world.ts` zostavuje kĺbové postavy a predmety. `scenes.ts` mapuje jednotlivé kroky; všeobecné návody a vysvetlenia používajú pôvodné sémantické mapovanie predmetov a úkonov.

Konečný obraz sa kreslí cez existujúci `react-native-svg`. Nepribudol GL modul, Three.js, externé textúry ani sieťové sťahovanie modelov. Ide o softvérové 3D, pri ktorom sa otvorené steny, podlaha a tiene kreslia v pozadí a predmety sa triedia podľa hĺbky. Tento postup nie je plnohodnotný GPU renderer so z-bufferom; zložité prieniky povrchov môžu mať vizuálne nepresnosti.

Aktívna scéna odoberá hodnotu existujúceho prehrávača a obmedzuje prekreslenie približne na 15 záberov za sekundu. Nemá nezávislý herný cyklus ani automaticky sa otáčajúcu kameru. Jednoduché modely majú menej než 1 000 plôch na scénu; susedné plochy rovnakého materiálu sa zoskupujú. Pri odpojení sa odber odstráni. Plynulosť, teplotu zariadenia a spotrebu batérie treba ešte zmerať na fyzickom Android/iPhone, najmä na slabších telefónoch.

## Overenie

Jednotkové testy prechádzajú všetkých 101 krokov v troch fázach a oboch vzhľadoch, všetkých 34 vysvetlení, konečnosť súradníc, ohraničenie počtu plôch, poradie kreslenia, perspektívu, otočenie a priblíženie. Komponentové testy overujú ovládanie kamery, ovládanie existujúcou animačnou hodnotou, čistenie odberov, statické náhľady a automatický návrat do 2D pri chybe.

Prehliadačové snímky v `docs/screenshots/v1.8` sú zo skutočného kreslenia s adaptérom natívnych služieb. Nenahrádzajú natívne zobrazenie, skúšku samostatného offline buildu ani odborné schválenie postupov.
