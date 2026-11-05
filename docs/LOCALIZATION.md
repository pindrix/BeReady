# READY — 21 jazykov

Aplikácia obsahuje slovenčinu a ďalších 20 jazykov: angličtinu, mandarínsku čínštinu (zjednodušené písmo), hindčinu, španielčinu, arabčinu, francúzštinu, bengálčinu, portugalčinu, ruštinu, indonézštinu, nemčinu, taliančinu, poľštinu, ukrajinčinu, češtinu, maďarčinu, holandčinu, rumunčinu, gréčtinu a švédčinu. Ide o používateľom vybranú kombináciu veľmi rozšírených a európskych jazykov, nie garantovaný aktuálny rebríček počtu hovoriacich.

## Používanie

Výber je v onboardingu a Nastaveniach. Názvy jazykov sa zobrazujú v ich vlastnom písme. Preferencia sa ukladá do samostatnej tabuľky `ready_preferences` a nemení obsah domácnosti. Obnovenie JSON zálohy jazyk neresetuje. Všetky slovníky sú pribalené; aplikácia neposiela texty na prekladové API a na samotný preklad nepotrebuje internet. Prístup k chráneným offline funkciám však podľa licenčného modelu vyžaduje overenú zaplatenú licenciu.

Arabčina používa smer RTL pre rozloženie obrazoviek, texty, formuláre a spoločné smerové ikony. Natívne systémové dialógy a navigáciu je potrebné overiť na skutočnom arabskom zariadení. Vstupné čísla podporujú arabské, perzské, hindské a bengálske číslice; údaje sa ukladajú ako čísla nezávislé od jazyka.

## Hranice prekladu

- Slovníky `src/i18n/locales/*.json` prekladajú rozhranie, pribalené návody, scenáre a vysvetlenia. Ide o pracovné jazykové verzie vytvorené počas vývoja, nie certifikované odborné preklady. Pred verejným vydaním musí rodený hovoriaci a odborný redaktor skontrolovať najmä núdzové a zdravotné pokyny.
- Názvy, poznámky, kontakty a miesta zadané používateľom zostávajú osobnými údajmi; na ich zobrazenie sa používa `translate={false}`. Preklad nikdy neprepisuje databázu domácnosti.
- Tiesňové čísla zostávajú pre **Slovensko**, bez ohľadu na jazyk. Aplikácia nemá geolokalizovanú databázu tiesňových čísel pre celý svet.
- Odkazy vedú na pôvodné oficiálne stránky. YouTube je externá online služba; preklad rozhrania neprekladá cudzie video ani nemení dostupnosť jeho titulkov.
- Neznámy text sa zachová v zdrojovej podobe. Takýto fallback sa nesmie započítať do úplnosti slovníka.

## Architektúra a overenie

`catalog.json` obsahuje normalizované slovenské zdrojové texty, `catalog-meta.json` odkazuje na ich miesta. `translateText` najprv vyhľadá presný kľúč, potom bezpečné ukotvené vzory s `{0}`, `{1}`. Dosadené hodnoty sa nemenia ani neinterpretujú ako kód. Vzory s iba premennou nie sú povolené.

`LocalizedText`, `LocalizedPressable`, `LocalizedTextInput` a `LocalizedAlert` prekladajú iba pri vykreslení alebo výslovnej akcii. Čísla sa formátujú cez Intl podľa aktuálneho jazyka. Kategórie, jednotky, identifikátory, navigačné trasy a JSON schéma zostávajú stabilné.

```sh
node scripts/extract-messages.mjs
node scripts/check-translations.mjs --report
npm run typecheck
npm test
```

Kontrola pokrytia overuje neprázdne hodnoty, presnú zhodu kľúčov, zástupné premenné a podozrivo krátke preklady dlhých odsekov. Nepotvrdzuje jazykovú ani odbornú správnosť. Nové zdrojové texty vyžadujú doplnenie všetkých 20 slovníkov.

Štandardné validačné chyby Zod používajú pribalené locale balíky všetkých 21 jazykov. Explicitné aplikačné vysvetlenia používajú rovnaký slovník ako rozhranie. To nemení hodnoty vstupných polí ani serializované enumy.

Viacriadkové vizuálne nadpisy majú fallback po jednotlivých riadkoch, ak zložený JSX text nemá samostatný kľúč. Osobné hodnoty v podnadpise Domova sa zostavujú oddelene od prekladaných popisov. V RTL sa číselné pomery izolujú ako LTR, aby sa význam napr.3/10 pri vykreslení neprevrátil.
