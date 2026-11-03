# Overenie READY

## Automatické overenie v cloude

- TypeScript strict: bez chýb.
- ESLint: bez chýb a upozornení po úprave testovacieho setupu.
- Doménové a databázové testy: 25 úspešných, 0 preskočených.
- React Native komponentové testy: 6 úspešných, 0 preskočených.
- Metro server: spustený, lokálny HTTP stav a Android manifest READY/SDK 58 overené. Server bol po kontrole zastavený.
- Export Android + iOS cez Metro/Hermes: úspešný. Nie je to APK/IPA ani dôkaz spustenia na telefóne.
- Expo kompatibilita: verzie sedia s lokálnym manifestom Expo SDK 58. Online kontrola Expo API bola blokovaná; podpora aktuálne distribuovaného Expo Go sa musí potvrdiť na telefóne.

Databázové testy používajú **skutočnú SQLite** z Node 24 a rovnaké SQL/repozitárové funkcie ako aplikácia. Kontrolujú CRUD, seed iba raz, trvanie všetkých dát po zatvorení/otvorení súboru, export/import, zamietnutie chybných údajov a rollback po SQL chybe uprostred importu. Nie sú náhradou za overenie natívneho `expo-sqlite` na zariadení.

Komponentové testy renderujú skutočné React Native obrazovky cez Expo Jest preset; natívne služby a store sú nahradené testovacími adaptérmi. Kontrolujú validáciu onboardingu, oddelené metriky a neznáme kcal na Domove, formulár novej zásoby, vyhľadávanie a potvrdenie mazania, prázdnu obrazovku krytov a potvrdenie vytáčania. Nepredstierajú systémové zdieľanie ani vytáčanie skutočného čísla.

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
10. Otvorte všetkých šesť návodov. Sekcia krytov musí byť prázdna. Pri 112 iba overte zobrazenie potvrdzovacieho dialógu a zrušte ho; netestujte tiesňové volanie.
11. Exportujte JSON do súborov. Zmeňte údaje, importujte zálohu a najprv zrušte potvrdenie — nič sa nesmie zmeniť. Import zopakujte a potvrďte — obnoví sa pôvodný stav. Overte aj po reštarte.
12. Skúste chybný JSON, neplatnú verziu a duplicitné ID. Import musí zlyhať bez poškodenia aktuálnych údajov. Skúste zrušenie výberu súboru a zdieľania.
13. Zapnite tmavý režim a väčšie systémové písmo, skontrolujte malý displej, klávesnicu, rolovanie a čítačku obrazovky.

## Offline test — rozdiel medzi Expo Go a inštalovaným buildom

- Čisté výpočty, validácie, pribalené návody a SQL integračné testy nevolajú sieť; táto časť je automaticky overená.
- Expo Go načítava vývojový bundle z Metro servera. Vypnutie siete môže prerušiť jeho spustenie; nie je to dôkaz chyby offline logiky ani dôkaz fungovania samostatného buildu.
- V už načítanom Expo Go skúste prácu bez internetu so zachovanou lokálnou Wi-Fi. Všetky lokálne akcie majú fungovať, externé odkazy nie.
- Úplný test: vytvorte a nainštalujte samostatný natívny build, vypnite Wi-Fi aj mobilné dáta, aplikáciu ukončite a spustite znova; zopakujte CRUD, checklisty, návody a lokálny export/import. **Tento test nebol v cloude vykonaný.**

Bez fyzického telefónu/emulátora neboli overené natívne dialógy súborov, dostupnosť úložísk, núdzový dialer, prístupnosť na zariadení ani natívna perzistencia po ukončení procesu. Publikovanie do obchodov ani odoslanie na GitHub neprebehlo.
