# Monetizácia READY — zvolený model

Aktuálne zadanie nahrádza pôvodný všeobecný návrh Plus:14 dní bezplatného skúšania s internetom, potom jednorazová platba10 USD za 12 mesiacov licencie. Žiadne automatické obnovenie. Offline nástroje a pribalené návody sa sprístupnia až po zaplatení a overení.

## Predajný model

- Počas skúšky sa nevyžaduje platobná karta a nič sa automaticky neúčtuje.
- Ročná licencia nie je doživotná kúpa. Po uplynutí roka sa používateľ rozhodne pre ďalší nákup.
- Google Play: odporúčaný produkt `ready_year_access` s prepaid base planom `annual-prepaid` na P1Y, podľa skutočnej dostupnosti a pravidiel obchodu. Nepoužiť automaticky obnovovaný plán ani trvalé odomknutie.
  -10 USD je zadaná základná cena. Pred potvrdením musí obchod zobraziť skutočnú cenu v miestnej mene a dane; text aplikácie nesmie predstierať, že ide o živú cenovú ponuku.
- Jazykové balíky sú pribalené. Za jednotlivé jazyky sa v tejto verzii osobitne neplatí.
- Tiesňové vytáčanie, čítanie vlastných dát a ich export zostávajú dostupné. Po skončení licencie sa osobné dáta automaticky nemažú.

## Čo už funguje a čo chýba

Politika trial/online/offline, obrazovka licencie, oddelená evidencia inštalácie, kontrola podpisu, vypršania a podpísanej offline cache sú implementované a testované. Aktuálny adaptér obchodu je explicitne nedostupný; platobné tlačidlá sú neaktívne. Vývojový náhľad môže zostať online dostupný aj po 14 dňoch, aby chýbajúci checkout neznemožnil vývoj. Offline licenciu tým nevytvára.

Reálne peniaze sa neprijímajú. Pred produkciou treba nakonfigurovať Play produkt, natívny Billing bridge, bezpečné overenie transakcie a vydanie podpísaného oprávnenia, obnovu nákupu, refundácie a testovací release. Samotný účet Google Play Console tieto kroky nenahrádza. Konkrétny postup a technické hranice sú v [BILLING.md](BILLING.md).

## Komunikácia hodnoty

Predávať praktickú organizáciu domácnosti a dostupnosť pribalených nástrojov bez siete. Netvrdiť vyššiu šancu na prežitie, garanciu bezpečnosti alebo oficiálne výstrahy. Nevytvárať falošné odpočítavanie, zľavy ani strach. Neponúkať neoverené internetové výsledky ako certifikované videá. Citlivé údaje domácnosti sa nepoužívajú na reklamu alebo cenotvorbu.

Ďalšie kurzy alebo B2B spolupráce sú budúce možnosti, nie ďalšie aktívne platené úrovne tejto verzie.
