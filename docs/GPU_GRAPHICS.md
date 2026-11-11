# BE READY 1.9 — kvalitnejšie 3D vykresľovanie

Aktívne scény teraz predvolene kreslí WebGL cez Three.js v lokálnom WebView. Majú hladké modely, zaoblené hrany, svetlo z viacerých smerov, mäkké tiene, materiály dreva a jemnú textúru oblečenia. Postavy majú upravené proporcie hláv, detaily tvárí, uší, rúk, golierov a vreciek. Oheň používa priehľadný shader ovládaný fázou pôvodného prehrávača. Kamera zobrazuje väčší záber úkonu.

Ide o štylizované vlastné 3D modely. [Návrhový obrázok](design/graphics-target-concept.png) je ilustráciou želaného umeleckého smeru, nie záznamom aplikácie. Presná fotorealistická kvalita tohto obrázka vyžaduje detailné rigované modely a ich animácie; v tejto verzii takéto skenované modely nie sú. Skutočné zobrazenie dokumentujú snímky v `screenshots/v1.9`.

## Lokálne zdroje a kompatibilita

- `react-native-webview` 14.0.1 zodpovedá pribalenému manifestu Expo SDK 58. Samostatný vlastný natívny modul nevznikol; nový balík treba nainštalovať cez `npm ci`. Expo Go musí podporovať SDK 58.
- Three.js 0.187.0 a jeho vlastný renderer sa počas vývoja zložia cez `npm run graphics:build` do `src/simulation/graphics-runtime.json`. Súbor je súčasťou repozitára aj natívneho balíka. Pri úprave geometrie alebo rendereru ho treba znovu vytvoriť.
- Žiadny CDN, HDR súbor, vzdialený model ani sieťová textúra. Svetelné prostredie, drevo a tkanina sa vytvoria lokálne. Licencia Three.js je v `licenses/three.txt`.
- Zatvorené vysvetlenia používajú 24 malých WebP náhľadov, zachytených zo skutočného GPU rendereru v oboch vzhľadoch; nezakladajú WebView ani animačný cyklus. Spolu majú približne 250 KiB.
- HTML má CSP s `connect-src 'none'`. Natívny komponent odmieta navigáciu mimo `about:blank`, nemá prístup k lokálnym súborom, zdieľaným cookies ani DOM úložisku. Posiela len opis scény, fázu, kameru a vzhľad; osobné údaje domácnosti sa doň neposielajú.

## Výkon, ovládanie a bezpečný návrat

Modely sa zostavujú zo zdieľaných primitív. GPU geometria a materiály sa opakovane používajú; pri prehrávaní sa menia transformácie. Vykreslenie spúšťa správa od pôvodného prehrávača alebo ovládanie kamery. Neexistuje samostatný voľne bežiaci herný časovač.

Rozlíšenie je obmedzené na dvojnásobok logických pixelov a tieňová mapa má 1 024 × 1 024. Pri chybe vytvorenia WebGL, strate kontextu, chybe shaderu alebo páde webového procesu sa zachová softvérové 3D. Kým sa nepotvrdí prvý dokončený záber, zostáva viditeľná miestna kresba. Ak sa prvý záber nedokončí do 8 sekúnd, zobrazí sa miestna náhrada. Pôvodné 2D schémy zostávajú dostupné.

Odchod z natívnej obrazovky odstráni WebView, aby za navigáciou nezostávali ďalšie GPU kontexty. Návrat čaká na nový kontext. Pri odpojení sa čistia časovače, odbery, materiály a vlastné GPU zdroje. Scéna rešpektuje pauzu, obmedzený pohyb a pôvodné zastavenie prehrávania na pozadí.

## Hranice overenia

Automatické testy kontrolujú protokol, ohraničenie kamery, zdieľanie primitív vo všetkých krokoch, spustenie po pripravenosti, zamietnutie cudzej navigácie, chyby, časový limit a odstránenie WebView pri odchode. Softvérové 3D a ovládanie sa naďalej testujú samostatne.

Prehliadačové QA používa ten istý vložený dokument ako natívne WebView, s reálnym WebGL a adaptérom natívnych služieb. Neoveruje fyzický Android/iPhone, jeho ovládač GPU, teplotu, spotrebu batérie ani kompatibilitu konkrétne nainštalovanej verzie Expo Go. Tieto skúšky zostávajú potrebné. Postupy prvej pomoci a civilnej ochrany stále potrebujú odbornú revíziu; krajšie kreslenie nemení odbornú platnosť pokynov.

Modely sú lokálne, ale platený offline prístup naďalej určuje existujúce podpísané oprávnenie. Zmena rendereru neúčtuje platbu ani nevydáva licenciu.
