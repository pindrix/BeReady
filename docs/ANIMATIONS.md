# Animované návody READY

READY obsahuje desať lokálnych animovaných ukážok: evakuačný batoh, skladovanie pitnej vody, výpadok elektriny, rodinný komunikačný plán, resuscitáciu dospelého, silné krvácanie, popáleniny a bezpečnosť pri ohni v prírode, civilnú prípravu na vojnový konflikt a jadrový výbuch/spad. Nie sú to videozáznamy ani obsah z YouTube. Scény vykresľuje aplikácia z vlastných grafických prvkov, takže prehrávanie nepotrebuje stream, sťahovanie videa ani prístup k sieti.

Texty, poradie a počet krokov prvých štyroch ukážok pochádzajú priamo z príslušných návodov v `src/data/academy.ts`. Používajú preto tie isté existujúce preklady. Aktualizácia textu pôvodného návodu sa prenesie aj do jeho animovanej ukážky. Štyri praktické ukážky majú samostatné texty a odkazy na zdroje v `src/data/practical-tutorials.ts`. Priame overenie týchto zdrojov počas tejto úpravy blokoval prístup servera; metadáta preto neuvádzajú živé overenie. Obrázok je názorná ilustrácia; nenahrádza výcvik, certifikovaný kurz, konkrétne miestne pokyny ani odporúčanie zdrojovej organizácie.

## Ovládanie a prístupnosť

Prehrávač umožňuje zastavenie, opakovanie a vedomý výber predchádzajúceho alebo nasledujúceho kroku. Používateľ má mať dostatok času na prečítanie textu. Rozhranie rešpektuje systémové nastavenie obmedzenia pohybu a sprístupňuje aj statickú podobu scény. Text kroku ostáva dostupný aj bez animácie.

Trvanie jednotlivých krokov je technické trvanie ilustrácie. Nie je to odporúčaný čas na skutočné balenie, manipuláciu s vodou, riešenie výpadku, prvú pomoc ani tiesňovú komunikáciu. Koniec prehrávania neoznačuje zvládnutie zručnosti a nemení stav checklistov. Pri bezprostrednom ohrození zdravia treba volať tiesňovú linku a riadiť sa operátorom; ukážka nie je pokyn odkladať privolanie pomoci kvôli prehrávaniu.

## Použitie bez internetu a licencia

Model aj scény sú súčasťou balíka aplikácie. Použitie bez internetu podlieha existujúcej kontrole prístupu READY: offline funkcie sú dostupné až po overení platnej zaplatenej licencie. Štrnásťdňová skúšobná verzia používa online prístup. Animované návody nepridávajú vlastnú platobnú bránu, skúšobnú lehotu ani obchádzku tejto kontroly. Reálne platby vyžadujú samostatne nakonfigurovanú existujúcu distribučnú a licenčnú infraštruktúru.

## Model a overenie

`src/data/tutorials.ts` mapuje stabilné identifikátory návodov na druhy scén. `src/domain/tutorials.ts` počíta čas prehrávania a presuny medzi krokmi bez sieťových volaní. Čas pred začiatkom aj za koncom sa ohraničí. Presná vnútorná hranica patrí nasledujúcemu kroku; koniec celej ukážky zostáva na poslednom kroku s dokončenou ilustráciou. Nečíselné a nekonečné hodnoty sa odmietnu.

`tests/tutorials.test.ts` kontroluje väzbu na zdrojové návody, ich kompletné texty, hranice scén, priebeh pri rôznych trvaniach aj neplatné časové údaje. Samotný model neurčuje automatické spustenie, pokračovanie krokov ani správanie pri obmedzení pohybu; tieto pravidlá zabezpečuje obrazovka prehrávača.

Od verzie 1.4 je popis aktuálneho kroku bezprostredne pod scénou v spoločnej karte, pred ovládaním. Nie je potrebné hľadať zodpovedajúci text pod časovou osou a upozorneniami.

Civilné animácie v `src/components/civil-scene.tsx` obsahujú 11 odlišných scén a využívajú už preložené celé návody. Každý krok trvá ilustračne 10 sekúnd; odporúčanie zostať v úkryte prvých 24 hodín z textu nie je časovač prehrávača. Rovnaké pravidlá pauzy, zmeny kroku, pozadia a obmedzenia pohybu platia aj pre tieto scény.
