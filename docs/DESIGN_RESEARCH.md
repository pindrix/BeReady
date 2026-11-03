# READY — vizuálny smer a UI/UX podklady

Kontrola zdrojov: **3. november 2026**. Toto je výber aktuálne dostupnej oficiálnej dokumentácie a jej návrhová interpretácia pre READY, nie prieskum trhu ani dôkaz používateľských preferencií.

## Čo bolo skutočne overené

Dokumenty boli načítané cez povolený `raw.githubusercontent.com` z oficiálnych repozitárov. Nižšie sú čitateľné odkazy na tie isté súbory na GitHube.

| Zdroj                                                                                                                                      | Overená informácia                                                                                                                                                                               | Význam pre READY                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Material: Common buttons](https://github.com/material-components/material-components-android/blob/master/docs/components/CommonButton.md) | Sekcia **M3 Expressive** uvádza päť veľkostí XS–XL, oblé aj hranatejšie tvary, zmenu tvaru pri stlačení/výbere a konfigurácie filled, tonal, outlined, elevated a text.                          | Jedna výrazná hlavná akcia, pokojnejšie sekundárne akcie, zreteľný vybraný stav. Každé tlačidlo nemusí mať rovnakú váhu.                         |
| [Material: Button groups](https://github.com/material-components/material-components-android/blob/master/docs/components/ButtonGroup.md)   | Expressive button groups podporujú príbuzné akcie a odozvu tvarom, pohybom a šírkou; dokumentácia rozlišuje standard a connected variant.                                                        | Filtre knižnice a scenárov sa dajú čítať ako súvisiaca skupina, s jasným aktívnym výberom.                                                       |
| [Material: Cards](https://github.com/material-components/material-components-android/blob/master/docs/components/Card.md)                  | Karty majú filled, outlined a elevated variant. Predvolená elevácia filled/outlined je 0 dp a elevated 1 dp. Obsah kariet má vlastné pravidlá prístupnosti vrátane popisov významových obrázkov. | Hĺbku a rámiky používať na hierarchiu, nie na ozdobenie každej položky. Ilustrácie majú dopĺňať jasný názov.                                     |
| [React Native: Accessibility](https://github.com/facebook/react-native-website/blob/main/docs/accessibility.md)                            | Dokumentácia vysvetľuje `accessibilityRole`, `accessibilityState` a `accessibilityValue`, vrátane významu zvoleného/zakázaného stavu a číselných hodnôt.                                         | Grafický ukazovateľ potrebuje aj textový význam, jednotku, popis pre čítačku a zdroj výpočtu. Ikona sama nie je dostatočný názov akcie.          |
| [React Native: Text](https://github.com/facebook/react-native-website/blob/main/docs/text.md)                                              | `allowFontScaling` rešpektuje systémovú veľkosť textu a má predvolenú hodnotu `true`.                                                                                                            | Nezakazovať systémové zväčšenie písma. Karty a riadky majú rásť podľa obsahu, nie orezávať slovenské texty.                                      |
| [React Native: AccessibilityInfo](https://github.com/facebook/react-native-website/blob/main/docs/accessibilityinfo.md)                    | Existuje `isReduceMotionEnabled()` aj udalosť `reduceMotionChanged`; na iOS je zdokumentované aj `isReduceTransparencyEnabled()`.                                                                | Ak sa pridá animácia, rešpektovať obmedzenie pohybu. Čitateľná pevná plocha je bezpečný základ; rozmazanie a priehľadnosť nemajú byť nevyhnutné. |
| [Aktuálny README Material Components Android](https://github.com/material-components/material-components-android/blob/master/README.md)    | README uvádza oznámenie Compose-first na Google I/O 2026 a maintenance mode knižnice pre Android Views.                                                                                          | Ide o vizuálne podklady. READY zostáva v React Native; nepridáva starú natívnu Views knižnicu kvôli vzhľadu.                                     |

Prístup na [Apple Human Interface Guidelines / Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) bol zablokovaný proxy odpoveďou **403**. Aktuálne Apple HIG, „Liquid Glass“ odporúčania, trendové rebríčky ani články NN/g preto v tomto prostredí neboli overené. Súhrn sa na ne neodvoláva ako na prečítané zdroje. Niektoré predpokladané cesty súborov v Material repozitári vrátili 404; do záverov vstupujú iba úspešne načítané dokumenty uvedené vyššie.

## Návrhová interpretácia pre READY

Nasledujúce rozhodnutia sú návrhom pre tento produkt, nie citovanými požiadavkami všetkých vyššie uvedených systémov.

1. **Pokojný, výrazný domov.** Veľká uvítacia plocha s lokálnou ilustráciou domácnosti; pod ňou menšie vizuálne karty pre jedlo, vodu a evakuačné úlohy. Rozličné veľkosti tvoria prehľadnú bento kompozíciu bez toho, aby každý údaj súťažil o pozornosť.
2. **Grafika nesie informáciu.** Zásobník vody, počet dní, stavový prstenec či vyplnený meter majú jasnú jednotku a textový ekvivalent. Celkové percento nesmie vyzerať ako pravdepodobnosť prežitia alebo záruka bezpečnosti.
3. **Jedna ďalšia užitočná akcia.** Kontextový návrh podľa skutočnej evidencie: doplniť vodu, pozrieť dátumy alebo dokončiť úlohu. Nevytvárať nekonečný feed ani alarmujúce upozornenia na zvyšovanie zapojenia.
4. **Knižnica ako vizuálny sprievodca.** Ilustrované kategórie a krátke náhľady; detail vedie po jednotlivých krokoch. Dlhší text zostáva dostupný, ale nevytvára celú domovskú obrazovku. Obrázok nesmie nahradiť kritický bezpečnostný pokyn.
5. **Video je vedomá online akcia.** Video karty môžu viesť k vyhľadávaniu overiteľných organizácií na YouTube. Ak konkrétne video nebolo redakčne overené, názov, miniatúra, dĺžka a počty zhliadnutí sa nevymýšľajú. Žiadne automatické prehrávanie, skryté načítavanie alebo tvrdenie o offline dostupnosti externého videa.
6. **Učenie bez tlaku.** Malé praktické misie a otázky overujú porozumenie; dokončenie označuje používateľ. Bez súťažných rebríčkov, trestania za prerušenú sériu či bodov naznačujúcich bezpečnosť rodiny.
7. **Výrazné povrchy, striedma hĺbka.** Tmavomodrá a petrolejová zostávajú identitou, doplnené teplými podkladmi a ilustráciami. Tieň a jemné vrstvy slúžia hierarchii. Celoplošné priehľadné sklo zhoršujúce čitateľnosť nepridávať iba preto, že pôsobí moderne.
8. **Pohodlné ovládanie aj v strese.** Pre READY voliť minimálne 48 × 48 logických bodov pre dotykové akcie, ponechať priestor medzi nimi, text a ikonu kombinovať. Čísla núdzových liniek zachovať výrazné a volanie potvrdiť. Táto veľkosť je praktický návrhový cieľ; načítané dokumenty vyššie neboli použité na overenie aktuálnej konkrétnej Apple metriky 44 pt.
9. **Komerčný model bez blokovania pomoci.** Platené rozšírenia môžu neskôr zlepšiť pohodlie a organizáciu, napríklad viac profilov alebo pokročilé tlačové zostavy. Základné offline návody, núdzové kontakty a prístup k vlastným údajom nesmú byť zablokované v kríze. Nepredstierať aktívne predplatné, cenu ani platobnú integráciu.

## Kontrola lokálneho rozhrania pred prerábkou

Pri kontrole existujúcich spoločných komponentov boli prítomné minimálne 48-bodové tlačidlá, názvy formulárov, roly tlačidiel a checkboxov, zakázané stavy, prístupný progress bar a textové chyby. To sú základy, ktoré treba zachovať.

Pri nových grafických komponentoch osobitne overiť:

- ikony majú názov akcie; čisto dekoratívne ilustrácie sú skryté pred čítačkou;
- malé štatistiky sa nečítajú iba farbou; kruhový ukazovateľ má textové číslo aj jednotku;
- pri veľkom systémovom písme sa dvojstĺpcové karty môžu preusporiadať a text sa neoreže pevnou výškou;
- tmavý režim zachová kontrast textu na farebných plochách;
- interaktívne karty neobsahujú vnorené tlačidlá s nejasným poradím fokusu;
- horizontálne zoznamy majú alternatívu k neobjaviteľnému gestu;
- zmena obrazovky ani animácia nespomaľujú prístup k núdzovým informáciám.

Skutočné čítanie pomocou VoiceOver/TalkBack, veľké písmo, kontrast na displeji a správanie pri systémovom obmedzení pohybu vyžadujú kontrolu na zariadení. Kontrola zdrojového kódu a komponentové testy ich nenahrádzajú.
