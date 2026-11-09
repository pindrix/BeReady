# BE READY — Aurora Command a Field Atlas

Verzia 1.7 realizuje vybrané smery 1 a 4. Predvolený je Aurora Command; oba sú plnohodnotné palety spoločných obrazoviek, nie samostatné aplikácie.

| Vlastnosť | Aurora Command                          | Field Atlas                               |
| --------- | --------------------------------------- | ----------------------------------------- |
| Základ    | Polnočná modrá                          | Piesková slonová kosť                     |
| Akcenty   | Mäta a ľadová modrá                     | Jantár a grafit                           |
| Karty     | Mäkké rohy, jemné svetlo a priehľadnosť | Jemná linka, teplý papier a menší polomer |
| Dom       | Priestorová osvetlená ilustrácia        | Architektonická kresba                    |
| Scény     | Studená svetlá plocha                   | Teplá technická plocha                    |

## Ovládanie a dáta

Nastavenia → Vzhľad aplikácie → Aurora Command / Field Atlas. Prepínač je dostupný aj bez platenej licencie. Voľba sa okamžite premietne do spoločných kariet, textov, tlačidiel, navigácie, stavového riadka a pozadí scén. Systémové dialógy sa riadia operačným systémom. Pri prvom otvorení sa najprv vyberá jazyk a krajina; vzhľad je predvolene Aurora.

Preferencia `appearance` v `ready_preferences` je oddelená od údajov domácnosti, krajiny, jazyka a licencie. Import domácnosti ju nemení. Neplatná uložená hodnota použije Aurora Command; databáza sa neresetuje.

Body na dome a zodpovedajúce textové tlačidlá majú skutočnú navigáciu:

- Pitná voda → Zásoby filtrované na vodu.
- Jedlo → Zásoby filtrované na jedlo.
- Rodinný plán → existujúca záložka Plán.
- Krajina → Nastavenia, kde je samostatný výber krajiny.

Používateľ môže filter zásob následne zmeniť. Zóny na dome majú 48 × 48 bodov, prístupné názvy a odozvu na stlačenie. Ilustrácia je statické lokálne WebP, nie živý 3D model, GPS ani vyhodnotenie bezpečnosti budovy. Ukazovatele jedla/vody a úloh vychádzajú z existujúcich výpočtov. Tiesňové volanie naďalej vyžaduje potvrdenie a používa vybranú krajinu.

Dve ilustrácie boli vytvorené pomocou generátora obrázkov pre tento projekt a uložené ako optimalizované WebP. Nový geometrický znak je aj v ikonách a úvodnej obrazovke. Identifikátory balíka, schéma URL, názov databázy, verzia záloh a produkt licencie sa pri zmene značky nemenia.

## Kontrola

Automatické testy overujú ukladanie preferencie, bezpečný návrat pri chybnej hodnote, nezávislosť od importu, živé prepínanie paliet, navigačné body a filter zásob. Prehliadačový QA používa skutočné komponenty cez adaptéry natívnych služieb. Snímky a rozsah sú v [screenshots/v1.7](screenshots/v1.7/review.json); nenahrádzajú skúšku fyzického Androidu/iPhonu, systémových dialógov ani offline štartu samostatného buildu.

Na telefóne overte oba vzhľady po reštarte, väčšie systémové písmo, čítačku obrazovky, spodnú navigáciu s gestami, ručné kroky animácie a popis priamo pod scénou.
