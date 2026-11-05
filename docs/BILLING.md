# READY — 14-dňová skúška a ročná licencia

## Produktové pravidlá

Používateľom zvolený model je **14 dní bezplatnej online skúšky**, potom **jedna platba 10 USD za 12 mesiacov používania**. **Offline funkcie vrátane offline návodov sa sprístupnia až po zaplatení a overení licencie.** Nejde o doživotnú kúpu ani automaticky obnovované predplatné. Po skončení roka sa používateľ sám rozhodne pre nový nákup. Predaj v konkrétnom obchode musí zobraziť jeho skutočnú lokalizovanú cenu a daňové údaje; hardcoded 10 USD je cieľový produktový model, nie garantovaná konečná cena každej krajiny.

Skúška začína prvým vytvorením lokálneho inštalačného záznamu, nie registráciou účtu. Trvá presne `14 × 24 hodín`. Cieľ licencie je jeden kalendárny rok. Pomocný výpočet zachováva UTC čas a 29. február sa v nasledujúcom neprestupnom roku zmení na 28. februára. Pri reálnom nákupe je však rozhodujúci overený `expiryTime` z Google Play vrátane dobitia či úpravy obdobia; klient nesmie prepísať platný čas obchodu vlastným odhadom. Platnosť je interval so začiatkom vrátane a koncom bez zahrnutia posledného okamihu. Rovnaký čas presne o rok už znamená vypršanie.

Online skúška umožňuje chránené nástroje iba pri potvrdenom online pripojení. Pri offline alebo zatiaľ neznámom pripojení vyžadujú overenú platnú licenciu. Tiesňové vytáčanie a čítanie/export vlastných údajov zostávajú mimo plateného zámku. Toto nie je bezplatné odomknutie offline knižnice; prístup do nej je podľa používateľovho upresnenia platený.

## Stav tejto vývojovej verzie

**Skutočný nákup nie je pripojený.** Repozitár neobsahuje natívny nákupný SDK, produkty App Store/Google Play, overovací server ani produkčný verejný kľúč pre podpísané oprávnenia. Nemôže prijímať platby, obnovovať reálny nákup alebo tvrdiť, že používateľ zaplatil.

Doménová vrstva a lokálne meranie skúšky sú implementované a testované. Pri `billingConfigured: false` môže stav skúšky zobraziť aj uplynutie 14 dní, ale aplikácia ponechá online nástroje dostupné vo vývojovom náhľade. Offline prístup tým nikdy neodomkne. Používateľ nesmie uviaznuť za zamknutím, keď chýba možnosť skutočne zaplatiť. UI musí tento vývojový režim zreteľne pomenovať. Až produkčne pripojená a otestovaná natívna platba môže zapnúť vynucovanie licencie.

Neexistuje tlačidlo „označiť ako zaplatené“, číselný lokálny aktivačný kód ani odomknutie cez importovanú zálohu. Testovací verifier existuje iba v automatických testoch.

## Dátová a overovacia hranica

- `src/domain/license.ts`: produktové konštanty, validácia časov, kalendárny rok, vyhodnotenie skúšky, zmena hodín a rozhranie overovania dokladu.
- `src/db/license-store.ts`: samostatná tabuľka `device_installation(id, started_at, last_seen_at)`. Identifikátor je `install`. Jeden atómový SQL upsert vytvorí začiatok iba raz a posledný pozorovaný čas posúva iba dopredu.
- Tabuľka sa nezúčastňuje `readState`, `replaceState` ani prenosnej JSON zálohy domácnosti. Import staršej či novej domácnosti ju neprepíše. Neobsahuje platený príznak, číslo karty, token obchodu ani osobné údaje.
- `verifyEntitlement(receipt, verifier, now)` prijme výsledok iba z dôveryhodného store/server verifiera. Overí produkt `ready_year_access`, prepaid základný plán `annual-prepaid`, dokončený nákup (nie pending), identifikátor transakcie, neodvolaný stav a platné časové obdobie podľa obchodu. Výsledok je nemenný runtime-brandovaný `VerifiedEntitlement`.
- `evaluateFeatureAccess` oddeľuje online skúšku od plateného offline oprávnenia. Stav `unknown` konzervatívne nie je potvrdené online pripojenie. Rozsah `essential` slúži iba explicitne vybraným tiesňovým a dátovým akciám.
- `evaluateLicense` odmieta ručne vytvorený objekt, importovaný JSON, obyčajný Boolean aj JSON kópiu pôvodného runtime výsledku. Tento runtime brand nie je kryptografia a nenahrádza overenie obchodu; zabraňuje náhodnému obídeniu hranice v aplikačnom kóde.
- Budúci verifier musí overiť podpis/pôvod a platnosť dokladu **pred** vrátením `StoreVerification`. Verifier, ktorý iba číta klientom zadaný dátum alebo `verified: true`, je neplatná implementácia.

### Offline po nákupe

V produkcii sa má lokálne uchovať podpísaný balík oprávnenia (napr. cez Keychain/Keystore vhodný pre použité SDK). Pri studenom štarte bez internetu ho musí samostatný dôveryhodný verifier overiť proti pribalenému verejnému kľúču a platnému obdobiu. Do zálohy domácnosti nepatrí. Pribalené návody a ilustrácie sú v balíku aplikácie aj pred nákupom; UI zámok nie je šifrovanie ani ochrana pred extrakciou obsahu. Samotný serializovaný `VerifiedEntitlement` nesmie byť považovaný za overený; po načítaní je potrebné znovu skontrolovať podpísaný doklad.

Sieť je potrebná na nákup, bezpečnú obnovu na novom zariadení a obnovu informácií o vrátení platby či odvolaní. Offline prevádzka nemôže okamžite zistiť refundáciu alebo revokáciu. Tento kompromis treba rozhodnúť pri produkčnej politike a vysvetliť používateľovi bez sľubu absolútnej ochrany. Aplikácia nikdy nesmie posielať kontakty domácnosti ako súčasť platobného overenia.

## Čo treba pripraviť pred produkčnou platbou

1. Používateľ potvrdil **Google Play Console**. Odporúčaná prvá integrácia je preto Android/Google Play; prístup k Apple účtu zatiaľ nebol potvrdený. Samotná existencia Play Console neznamená nakonfigurovaný produkt, služobné overovanie alebo udelené prístupy.
2. V Play Console vytvoriť **subscription produkt s prepaid base planom `P1Y`**, teda rok plateného prístupu bez automatického obnovenia. Navrhované identifikátory sú `ready_year_access` a `annual-prepaid`; musia zodpovedať reálnej konfigurácii. Cena podľa zadania je **10 USD** za rok, používateľovi sa však pred nákupom zobrazuje skutočná lokalizovaná cena z obchodu. Nepoužiť automaticky obnovovaný plán ani trvalý non-consumable unlock. Lokálnych 14 dní online skúšky je **mimo nákupu**, bez platobnej karty; nie je to predstieraná bezplatná ponuka prepaid plánu.
3. Nastaviť produkt/cenu, regióny, právne a daňové údaje, testovacích používateľov a testovací release. Overiť dostupnosť prepaid plánu a aktuálne pravidlá pre vybrané regióny v konzole. Prístup k účtu ani existujúce produkčné produkty neboli v tejto úlohe použité.
4. Pridať podporovaný natívny Google Play Billing SDK/bridge, obnovu nákupu a serverové overenie. Expo Go potrebný nákupný modul neobsahuje automaticky; reálne platby vyžadujú zodpovedajúci development/release build a Play testovanie.
5. Dôveryhodný verifier musí cez Play API/signed výsledok preveriť balík aplikácie, produkt, **base plan prepaid `P1Y`**, purchase token/transakciu, dokončený nákup a aktuálny stav. Pending/canceled/revoked nákup neudelí oprávnenie. Dokončiť požadované acknowledgement podľa aktuálnych pravidiel Google. Platnosť prevziať z overeného `expiryTime`; nevynucovať rovnosť s klientskym `purchasedAt + 1 rok`, pretože legitímne dobitie alebo úpravy obdobia môžu zmeniť koniec.
6. Implementovať refundácie, odvolanie, opätovné overenie, obnovenie na novom zariadení a podpísanú offline cache. Neverifikovaný textový token ani SDK Boolean „purchased“ nemôžu nahradiť overenie. Žiadne platobné prihlasovacie údaje sa nezadávajú do chatu ani neukladajú do repozitára.
7. Otestovať prvý nákup, vypršanie, obnovu a dobitie prepaid plánu, opakované kliknutie, nedokončenú platbu, zrušenie, refundáciu, reštart, odinštalovanie aj stav bez siete. Až potom nastaviť `billingConfigured: true`. Dovtedy online vývojový náhľad zostáva označený, offline prístup bez overenej licencie je zamknutý.
8. iOS pridať až po potvrdení Apple účtu a vhodného neobnovovaného modelu. Nepredstierať, že Play oprávnenie je automaticky platná iOS platba; prípadný prenos musí mať samostatne navrhnuté pravidlá.

Referenčné oficiálne dokumentácie na produkčné posúdenie: [Apple In-App Purchase](https://developer.apple.com/in-app-purchase/), [App Store Connect — subscriptions](https://developer.apple.com/help/app-store-connect/manage-subscriptions/overview-of-subscriptions/), [Google Play Billing](https://developer.android.com/google/play/billing), [Play Billing subscriptions](https://developer.android.com/google/play/billing/subscriptions). Tieto odkazy sú východiskom budúcej integrácie; aktuálne podmienky obchodov neboli v tejto úlohe overené živým prístupom.

## Hranice lokálneho merania času

Posledný pozorovaný čas sa ukladá monotónne. Menší spätný posun dátumu nikdy nepridá skúške ďalší čas; posun väčší ako päť minút vyvolá stav `clock-change`. Overená stále platná licencia sa hodnotí proti poslednému známemu času, aby ju malá chyba hodín automaticky neodstavila. Výrazná zmena času bez licencie však v produkčnom režime neudeľuje ďalší trial.

SQLite v zariadení nie je dôveryhodný časový server ani ochrana proti úmyselnej úprave dát. Čisté odinštalovanie môže odstrániť záznam a vytvoriť nový trial. Zmena dátumu, úprava databázy či kompletne upravená aplikácia sa nedajú spoľahlivo vylúčiť iba klientskym kódom bez dôveryhodného overenia. Predajný model nesmie sľubovať opak.

## Implementované offline overenie podpisu vo verzii 1.2

`src/domain/signed-license.ts` overuje Ed25519 podpis nad presným kanonickým JSON payloadom pomocou `@noble/curves`. Payload verzie 1 obsahuje `productId`, `basePlanId`, `transactionId`, dokončený `purchaseState`, `purchasedAt`, `expiresAt` a `revoked:false`. ASCII identifikátory a pevné poradie vlastností zabraňujú rozdielom v serializácii. Poškodený podpis, iný verejný kľúč alebo zmenený dátum sa odmietnu.

`src/db/entitlement-store.ts` ukladá až úspešne overený podpísaný doklad do samostatnej tabuľky `signed_entitlements`. Pri ďalšom štarte ho znovu overí bez siete. Tabuľka nie je súčasťou prenosnej zálohy domácnosti. Nie je to potvrdenie skutočného nákupu: dôveryhodný server musí najskôr overiť Google Play transakciu a až potom vystaviť podpis.

`EXPO_PUBLIC_LICENSE_VERIFICATION_KEY` je verejný Ed25519 kľúč v hex tvare (32 bajtov/64 hex znakov). Je určený na pribalenie do buildu, nie je tajomstvom. **Súkromný podpisový kľúč nesmie byť v aplikácii, repozitári, zálohe ani premenných s prefixom EXPO_PUBLIC.** V produkcii musí mať bezpečnú správu a plán rotácie. V repozitári nie je produkčný kľúč ani signer služba.

`src/billing/adapter.ts` je explicitne nedostupný adaptér s rozhraním pre nákup a obnovu. Provider je pripravený prijať podpísaný výsledok z budúceho natívneho nákupu, overiť a uložiť ho. Dovtedy sú platobné tlačidlá neaktívne a aplikácia nič neúčtuje. Dostupnosť nákupu sa nesmie zapnúť iba tým, že sa vyplní verejný kľúč.

Testovací súkromný kľúč existuje iba v `tests/signed-license.test.ts`; nie je importovaný produkčnými obrazovkami a nemá oprávnenie na produkčné podpisovanie. Testy overujú podpis, zásah do dátumu, nesprávny kľúč, koniec platnosti, nový verifier po načítaní cache a nezávislosť od importu domácnosti. Nevykonali žiadny skutočný nákup.
