# Animácie vysvetľujú postup aj princíp

Všetkých 20 sprievodcov má vlastný postup v knižnici a vloženú animáciu pri aktuálnom kroku čítačky. Knižnica má 24 postupov so 101 krokmi; štyri ďalšie sú resuscitácia dospelého, krvácanie, popáleniny a oheň. Texty a poradie sa preberajú z už preložených návodov, nevzniká druhá verzia bezpečnostného pokynu. Pri zmene kroku čítačky sa ilustrácia vynuluje a zostane pozastavená.

Nový register `src/data/instruction-scenes.ts` priraďuje 54 diagramov k zvyšným 14 témam. Používa pohyb predmetu k výbave, presun človeka k úkrytu, vzdialenie sa od rizika, vizuálnu kontrolu objektu a porovnanie dvoch pojmov. Každý krok má výslovné priradenie, nie náhodný obrázok podľa kľúčového slova. Červené prečiarknutie označuje nevhodnú možnosť. Šípky nepredpovedajú reálnu trasu ani bezpečnosť miesta; presné podmienky a pokyny úradov zostávajú v texte.

`src/data/explanations.ts` obsahuje 12 koncepčných vysvetlení pre 15 pracovných obrazoviek:

| Téma                                   | Obrazovky                 |
| -------------------------------------- | ------------------------- |
| Cieľ a použiteľné zásoby               | Domov                     |
| Množstvá, dátumy a neznáme kcal        | Zásoby, formulár položky  |
| Deficit a návrh nákupu                 | Nákupný zoznam            |
| Výbava podľa potrieb                   | Baliaca stanica           |
| Kontakty a miesta stretnutia           | Plán, rodinná karta       |
| Lokálne údaje, export a ochrana súboru | Nastavenia, dátový trezor |
| Skúška a podmienky offline licencie    | Licencia                  |
| Voľba a výsledok nácviku               | Scenáre                   |
| Úlohy a uloženie pokroku               | Misie                     |
| Overenie miestnych informácií          | Kryty                     |
| Osoby a denná potreba                  | Onboarding profilu        |
| Pribalené návody a online video        | Video akadémia            |

Zatvorená karta zobrazuje iba malé ilustrácie a nevytvára prehrávač ani časovač. Otvorenie nezačne pohyb automaticky. Ovládanie rešpektuje obmedzenie pohybu, odchod z obrazovky aj pozadie aplikácie. Aktívne SVG scény sú memoizované, aby aktualizácia času 10-krát za sekundu zbytočne nevytvárala nové grafické vrstvy.

Text vysvetľuje princíp. Animácia neprepočíta ani neprepíše údaje domácnosti, neoznačí misiu za splnenú, nevytvorí zálohu a nevydá oprávnenie. Na reálne akcie zostávajú pôvodné tlačidlá a potvrdenia. Zobrazená JSON záloha sa neoznačuje za šifrovanú; licencia nepredstiera aktívne platby a kryty nezobrazujú fiktívnu mapu alebo overenú lokalitu.

Všetko sa balí lokálne, bez ďalšieho natívneho modulu a bez video streamu. Prístup do offline režimu sa naďalej riadi plateným oprávnením. Animácie nie sú klinickým kurzom, živou výstrahou ani potvrdením bezpečného návratu. Odborná revízia bezpečnostných postupov, prekladov a nových diagramov pred verejným vydaním zostáva potrebná.

Vizuálne vysvetlenie čítania/exportu vlastných údajov zostáva súčasťou vždy dostupných nastavení a dátového trezoru. Neodomyká chránenú knižnicu, nástroje ani platenú licenciu.
