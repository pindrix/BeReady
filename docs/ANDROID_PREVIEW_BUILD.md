# Samostatný Android APK na skúšanie

Tento build používa **`sk.beready.preview`** a názov **BE READY**. Je oddelený od budúcej distribúcie `sk.beready.app`, takže má vlastné lokálne údaje a neprepisuje Play inštaláciu. Je podpísaný testovacím Android kľúčom vytvoreným šablónou Expo. Nie je to produkčne podpísané vydanie pre Google Play.

Používa variant **release**, ktorý obsahuje Hermes JavaScript aj pribalené obrázky/modely. Na spustenie nepotrebuje Expo Go, QR kód ani zapnutý Metro server. Prístup k chráneným funkciám a offline režimu naďalej riadi licencia aplikácie.

## Lokálne zostavenie na Linux/macOS alebo vo WSL

Potrebné sú nainštalované závislosti projektu (`npm ci`), úplné **JDK 17 a JDK 21 vrátane `javac`**, Android SDK a akceptované licencie SDK. Balíky tohto projektu používajú platformu 37.0, build tools 36/37, NDK `27.1.12297006` a CMake `3.22.1`. Premenná `ANDROID_HOME` musí ukazovať na SDK. Gradle musí nájsť oba JDK, napríklad cez `org.gradle.java.installations.paths` v používateľskom `gradle.properties`.

```sh
node scripts/build-android-preview.mjs /tmp/BE-READY-preview.apk
```

Skript vytvorí dočasnú kópiu projektu, nastaví preview identifikátor, vykoná Expo prebuild a plné `assembleRelease` pre ARM64. Originálny `app.json` ani produkčný identifikátor nemení. Výstupná cesta APK je povinná. Privátny podpisový kľúč sa nepridáva do repozitára. Dočasný projekt ostáva dostupný na diagnostiku prípadnej chyby.

ARM64 APK je určený pre bežné súčasné Android telefóny s procesorom `arm64-v8a`. Nie je určený pre iPhone ani x86 emulátor.

## Sieťové zdroje natívneho zostavenia

Používajú sa oficiálne Android/Gradle/Maven zdroje. Natívny balík React Native `0.88.1` sa pri sťahovaní z Maven Central presmeruje na **`repo.reactnative.dev`**. Tento host musí byť povolený v sieťovej politike prostredia. Samotný úspešný Expo/Hermes export nenahrádza zostavenie APK.

V cloudovom pokuse 12. 11. 2026 sa SDK, NDK, JDK a Gradle pripravili úspešne. Natívne zostavenie však pri načítaní `react-android-0.88.1-release.aar` narazilo na odmietnutie HTTP CONNECT 403 pre `repo.reactnative.dev`. Kým sa pravidlo neuplatní a úplný release build nedokončí, neexistuje overený APK na stiahnutie. ZIP so zdrojmi sa nesmie označiť ako inštalovateľná aplikácia.

## Kontrola hotového súboru

Po úspešnom zostavení overte podpis pomocou `apksigner verify --verbose`, identifikátor/verziu cez `aapt dump badging` a prítomnosť `assets/index.android.bundle` v APK. Výsledok stále potrebuje skúšku na fyzickom telefóne; prehliadačové snímky a jednotkové testy neoverujú jeho natívny štart či mobilný GPU.
