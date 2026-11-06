# Overenie READY

## Automatické overenie v cloude

- TypeScript strict: bez chýb.
- ESLint: bez chýb a upozornení po úprave testovacieho setupu.
- Doménové a databázové testy: 97 úspešných, 0 preskočených.
- React Native komponentové testy: 71 úspešných, 0 preskočených.
- Metro server: spustený, lokálny HTTP stav a Android manifest READY/SDK 58 overené. Server bol po kontrole zastavený.
- Export Android + iOS cez Metro/Hermes: úspešný. Nie je to APK/IPA ani dôkaz spustenia na telefóne.
- Expo kompatibilita: verzie sedia s lokálnym manifestom Expo SDK 58. Online kontrola Expo API bola blokovaná; podpora aktuálne distribuovaného Expo Go sa musí potvrdiť na telefóne.

Databázové testy používajú **skutočnú SQLite** z Node 24 a rovnaké SQL/repozitárové funkcie ako aplikácia. Kontrolujú CRUD, seed iba raz, trvanie všetkých dát po zatvorení/otvorení súboru, export/import, zamietnutie chybných údajov a rollback po SQL chybe uprostred importu. Nie sú náhradou za overenie natívneho `expo-sqlite` na zariadení.

Komponentové testy renderujú skutočné React Native obrazovky cez Expo Jest preset; natívne služby a store sú nahradené testovacími adaptérmi. Kontrolujú validáciu onboardingu, oddelené metriky a neznáme kcal na Domove, formulár novej zásoby, vyhľadávanie a potvrdenie mazania, prázdnu obrazovku krytov a potvrdenie vytáčania. Nepredstierajú systémové zdieľanie ani vytáčanie skutočného čísla.

## Rozšírenie 1.1

Automatické testy navyše overujú obsah, vyhľadávanie a záložky Akadémie, neznáme ID zo starších importov, explicitné YouTube vyhľadávacie odkazy, postup medzi krokmi návodu, výpočty a zvrátenie pokroku misií, správne/chybné odpovede kvízu, import kompatibilného stavu, súkromie zdieľanej karty a núdzový dialóg bez požiadavky na profil.

Vizuálny QA harness vykreslil skutočné komponenty Home, Academy a Missions s výslovne oddelenými testovacími dátami v Chromium: 390 a 320 px, svetlý a tmavý režim. Snímky sú v `docs/screenshots`, podrobnosti v `review.json`. Horizontálne police filtrov sa posúvajú zámerne; dekoratívne presahy zostávajú orezané. Tieto snímky **nie sú** dôkazom natívneho renderovania, SQLite ani systémových dialógov na telefóne.

## Ručný scenár pre Android aj iPhone — zatiaľ nevykonaný

1. Spustite projekt podľa README. Vytvorte profil s 2 osobami, 2 200 kcal/osoba/deň a 3,8 l/osoba/deň.
2. Pridajte jedlo 1 bal. s 8 800 kcal/bal. a bez dátumu. Pridajte 22 800 ml pitnej vody bez kcal a dátumu. Pridajte tretiu potravinu s neznámou energiou.
3. Domov má ukázať 2 dni jedla, 3 dni vody a upozornenie na neznámu energiu.
4. Zmeňte množstvo jedla na 2 bal. Krytie má byť 4 dni. Vymažte tretiu položku cez potvrdenie. Vyhľadávanie a kategórie musia filtrovať skutočné zásoby.
5. Skúste záporné množstvo, 0 osôb, neplatný dátum 2026-02-30 a vodu v ks. Údaje sa nesmú uložiť. Čiarka v čísle 3,8 musí fungovať.
6. Jedlu nastavte včerajší dátum. Musí zostať viditeľné, ale jedlo na Domove sa nesmie započítavať. Pre minimálnu trvanlivosť má byť vysvetlenie kontroly stavu bez automatického tvrdenia o nebezpečnosti.
7. Zmeňte cieľ a počet osôb. Domov aj deficity sa musia prepočítať. Vytvorte nákupný návrh, upravte množstvo, označte kúpené, pridajte vlastnú položku a jednu vymažte. Označenie kúpeného nesmie potichu zvýšiť zásoby.
8. Odškrtnite úlohu, pridajte a premenujte vlastnú, zmeňte miesto stretnutia, pridajte a upravte kontakt.
9. Aplikáciu úplne ukončite (nie iba minimalizujte) a znovu otvorte. Onboarding sa nesmie opakovať; profil, zásoby, nákupy, úlohy, kontakty a miesto stretnutia musia zostať.
10. Otvorte pôvodné scenáre aj nové návody Akadémie, prejdite kroky dopredu/dozadu, uložte záložku a overte ju po reštarte. Sekcia krytov musí byť prázdna. Pri 112 iba overte zobrazenie potvrdzovacieho dialógu a zrušte ho; netestujte tiesňové volanie.
11. Exportujte JSON do súborov. Zmeňte údaje, importujte zálohu a najprv zrušte potvrdenie — nič sa nesmie zmeniť. Import zopakujte a potvrďte — obnoví sa pôvodný stav. Overte aj po reštarte.
12. Skúste chybný JSON, neplatnú verziu a duplicitné ID. Import musí zlyhať bez poškodenia aktuálnych údajov. Skúste zrušenie výberu súboru a zdieľania.
13. Zapnite tmavý režim a väčšie systémové písmo, skontrolujte malý displej, klávesnicu, rolovanie a čítačku obrazovky.

## Offline test — rozdiel medzi Expo Go a inštalovaným buildom

- Čisté výpočty, validácie, pribalené návody a SQL integračné testy nevolajú sieť; táto časť je automaticky overená.
- Expo Go načítava vývojový bundle z Metro servera. Vypnutie siete môže prerušiť jeho spustenie; nie je to dôkaz chyby offline logiky ani dôkaz fungovania samostatného buildu.
- Bez overenej zaplatenej licencie musí vývojová verzia pri strate internetu zablokovať chránené funkcie; tiesňové čísla, čítanie a export ostávajú dostupné. Bežný online náhľad nepredstiera licenciu.
- Úplný test: vytvorte a nainštalujte samostatný natívny build, najprv získajte reálne overenú testovaciu licenciu, potom vypnite Wi-Fi aj mobilné dáta, aplikáciu ukončite a spustite znova; zopakujte CRUD, checklisty, návody a lokálny export/import. **Tento test nebol v cloude vykonaný.**

Bez fyzického telefónu/emulátora neboli overené natívne dialógy súborov, dostupnosť úložísk, núdzový dialer, prístupnosť na zariadení ani natívna perzistencia po ukončení procesu. Publikovanie do obchodov neprebehlo. Stav odoslania zdrojov na GitHub sa uvádza samostatne pri odovzdaní.

## Ručné doplnenie pre 1.1 — zatiaľ nevykonané na telefóne

1. Označte misiu ako hotovú, zrušte dokončenie, skúste správnu aj nesprávnu odpoveď kvízu. Po reštarte musí zostať uložený stav misie. Odpovede kvízu sú iba lokálny stav aktuálnej obrazovky, neoznačujú misiu automaticky za hotovú.
2. Otvorte YouTube tému a potvrďte, že ide o vyhľadávanie na cudzej online službe. Bez internetu majú pribalené návody fungovať iba s platnou overenou licenciou; YouTube internet potrebuje vždy.
3. Na núdzovej karte sú osobné údaje spočiatku skryté. Zapnite ich vedome, skontrolujte textový náhľad a zdieľanie zrušte. Skutočnú tiesňovú linku netestujte.
4. Pri prvom spustení pred vyplnením profilu musí byť dostupná Rýchla pomoc. Pri chybe DB má chybová obrazovka samostatný potvrdený vstup do vytáčania 112; nejde o opravu poškodenej DB.
5. Importujte starú zálohu verzie 1. Zásoby a profil sa musia načítať; misie a záložky bez záznamov začínajú prázdne. Naopak nová záloha obsahuje aj nový pokrok.

## Rozšírenie1.2

Testy pokrývajú24 položiek batoha, voliteľné zvieratá, výpočet vody, päť acyklických vetvených scenárov a explicitné uloženie nácviku. Licenčné testy zahŕňajú14-dňovú hranicu, časové zmeny, prepaid koniec, pending/revoked doklady, offline politiku, podpis Ed25519, zásah do dátumu, nesprávny kľúč a opätovné načítanie podpísanej cache bez siete. Import domácnosti neresetuje trial, doklad ani jazyk.

Lokalizačné kontroly sledujú21 jazykov, presné pokrytie zdrojových kľúčov, placeholdery, arabské RTL, okamžité prekreslenie a nedotknuté osobné vstupy. Štrukturálna úplnosť nie je odborná jazyková ani medicínska revízia. Reálne nákupy ani produkčné podpisovanie neboli vykonané.

Ručné doplnenie: na telefóne preveriť prvý štart online/offline, zmenu jazyka, RTL, balenie, scenáre, obnovenie pokroku, zamknutie bez licencie a dostupnosť exportu. Po pripojení Billingu samostatne vykonať nákup/obnovu/refundáciu a studený štart bez siete s platným podpísaným oprávnením.

Finálna jazyková vizuálna kontrola vykreslila Domov vo všetkých 21 jazykoch pri 390 px a päť doplnkových kombinácií batoha/scenárov/licencie. Výsledok:26 renderov bez chyby a bez horizontálneho pretečenia. Report je `docs/screenshots/v1.2/locales-review.json`. Ide o prehliadačové testovacie dáta, nie natívne zariadenie. Texty so zalomenými riadkami sa overujú samostatným regresným testom, pretože samotná úplnosť slovníka nezaručuje správne poskladanie JSX textu.

## Rozšírenie 1.3 — animované návody

Celkom 138 automatických testov (88 doménových/databázových a 50 komponentových). Nové kontroly overujú osem návodov a 36 krokov, presné časové hranice, seek a neplatné vstupy, bezpečnostné podmienky praktických postupov, vykreslenie základných scén, pauzu/pokračovanie, prechod medzi krokmi, opakovanie, zmenu obmedzenia pohybu, prepnutie do pozadia, stratu fokusu a vyčistenie callbackov po ukončení. Regresia zahŕňa aj počiatočný neznámy stav AppState. Kontrola slovníkov overuje 1 336 zdrojových kľúčov vo všetkých 20 ďalších jazykoch.

Prehliadačová kontrola samostatne prezrela 18 praktických scén vo svetlom režime a štyri v tmavom režime. Skutočné prehrávanie balenia bolo zachytené do GIF. Doplňujúca kontrola knižnice vo všetkých 21 jazykoch pri šírke 320 px a 12 stavov prehrávačov v slovenčine, angličtine a arabčine nenašla chyby prehliadača ani viditeľné horizontálne presahy. Dôkazy sú v `docs/screenshots/v1.3`. Ide o render skutočných komponentov cez testovacie adaptéry, nie záznam fyzického telefónu ani medicínsku certifikáciu.

Ručné doplnenie na telefóne — zatiaľ nevykonané:

1. V každom z ôsmich postupov overte pauzu, pokračovanie, výber kroku, posun časovej osi a návrat na začiatok. Nič sa nesmie spustiť bez vedomého stlačenia Prehrať.
2. Počas prehrávania prepnite aplikáciu do pozadia a opäť ju otvorte; musí zostať pozastavená. Rovnako odíďte z obrazovky a vráťte sa.
3. Zapnite systémové obmedzenie pohybu. Scény musia byť statické, texty a manuálne kroky dostupné, automatické prehrávanie vypnuté. Overte čítačku obrazovky a väčšie písmo.
4. V samostatnom builde s platným podpísaným zaplateným oprávnením vypnite sieť, aplikáciu ukončite a spustite znova; všetkých osem postupov sa musí načítať lokálne. Bez oprávnenia má existujúca ochrana offline vstup zablokovať.
5. Pri prvej pomoci overte trvalo dostupné upozornenie a vstup do Rýchlej pomoci bez vykonania tiesňového hovoru. Klinickú správnosť textu a ilustrácií musí pred verejným vydaním posúdiť kvalifikovaný odborník; automatické testy ju nepotvrdzujú.

## Rozšírenie 1.4

145 testov: 93 doménových/databázových a 52 komponentových. Nové kontroly overujú oddelenie krajiny od jazyka, uloženie krajiny a prvého spustenia cez SQLite, nedotknuté preferencie pri importe domácnosti, zachovanie úvodných núl v 000, rôzne čísla zdravotníkov/hasičov/polície, absenciu odhadnutých čísel pri neznámej krajine, nezmenené množstvá zásob a potvrdené vytáčanie 911 pri slovenskom jazyku. Prvý štart otvára jazyk a vyžaduje explicitnú krajinu. Nové obsahové kontrakty sledujú podmienený pobyt v úkryte, oddelenie tlakovej vlny a spadu, obmedzenia jódu a varenia vody; nepotvrdzujú odbornú správnosť.

Prehliadačový QA: 24 renderov Domova, prehrávača, jadrového návodu a Rýchlej pomoci pri šírke 320/390 px v slovenčine, angličtine a arabčine s krajinou USA. Bez chýb prehliadača a viditeľného horizontálneho pretečenia. Geometria potvrdila popis do 20 px pod scénou. Samostatne zachytený prvotný jazykový výber. Dôkazy v `docs/screenshots/v1.4/review.json` a PNG sú z fixture s testovacími adaptérmi, nie z fyzického telefónu.

Na telefóne ešte overiť prvý štart, zmenu krajiny pri rovnakom jazyku, čítačku obrazovky, krajinu po reštarte a platený offline štart. Tiesňové hovory sa v testoch nevykonávajú. Verejné vydanie vyžaduje odborné preverenie civilnej ochrany a národných kontaktov; priame aktuálne webové overenie blokoval proxy HTTP 403.

## Rozšírenie 1.5

148 testov: 94 doménových/databázových a 54 komponentových. Nový modelový test overuje úplnú zhodu textov a poradia civilných animácií so zdrojovými návodmi, správne odkazy a ilustračné trvanie. Dva nové renderovacie testy prechádzajú všetkých 11 scén na začiatku aj konci a overujú rozdielne kresby a skrytie dekorácií pred čítačkou obrazovky. Existujúce časové testy zahŕňajú aj tieto dva postupy.

Vizuálny QA prechádza 11 scén pri šírke 320 px v tmavom režime a 390 px vo svetlom režime (22 stavov) a kontroluje blízkosť titulkov. GIF zaznamenáva skutočné prehrávanie v prehliadačovom fixture. Dôkazy sú v `docs/screenshots/v1.5`. Nenahrádza to kontrolu natívnej plynulosti ani klinickú či odbornú revíziu. Na telefóne ešte overiť nové scény, čítačku obrazovky a studený offline štart s platnou licenciou.

## Rozšírenie 1.6

168 testov: 97 doménových/databázových a 71 komponentových. Kontrolujú úplné animované pokrytie 20 sprievodcov, 24 jedinečných postupov a 101 krokov, zhodu textov a poradia s pôvodnými návodmi, presnú dĺžku scén každého sprievodcu a rozdielne kresby nových 54 diagramov. Nové komponentové testy overujú vedomé otvorenie vysvetlenia, počiatočné pozastavenie, ručné kroky, režim obmedzeného pohybu, zánik prehrávača po zatvorení a pauzu pri zmene kroku čítaného návodu bez zápisu do checklistu.

Vizuálny QA overil 182 stavov bez chýb prehliadača a bez viditeľného horizontálneho pretečenia. Prechádza nové scény pri 320 px v tmavom a 390 px vo svetlom režime, všetky koncepčné vysvetlenia pri 320 px a prvý/posledný krok všetkých 20 čítaných návodov. Snímky a report v `docs/screenshots/v1.6` sú renderované cez adaptéry natívnych služieb v prehliadači. Nenahrádzajú skúšku telefónu ani odbornú revíziu bezpečnostných diagramov. Samostatne sa overuje vyhľadanie anglického názvu v knižnici.

Na zariadení ešte preveriť plynulosť, zmenu textu pri krokoch, väčšie písmo, čítačku obrazovky, prepnutie do pozadia, RTL a offline štart s platnou podpísanou licenciou. Prehrávanie nevykonáva export, nákup, volanie ani zápis do databázy. Počas skúšky sa skutočné tiesňové hovory nevykonávajú.
