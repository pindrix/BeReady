import { civilProtectionGuides } from "./civil-protection";
import { guides } from "./content";
import type { Checklist } from "../types/model";

export type AcademyCategory = "Príprava" | "Doma" | "Vonku" | "Prvá pomoc";
export type AcademyArtKind =
  "power" | "water" | "bag" | "home" | "medical" | "radio" | "outdoor" | "food";
export type AcademyGuide = {
  id: string;
  title: string;
  category: AcademyCategory;
  eyebrow: string;
  summary: string;
  art: AcademyArtKind;
  color: string;
  minutes: number;
  steps: { title: string; body: string }[];
  takeaway: string;
  source: string;
  sourceName: string;
  reviewed: string;
};
const legacy: Record<
  string,
  Pick<
    AcademyGuide,
    "category" | "eyebrow" | "summary" | "art" | "color" | "takeaway"
  >
> = {
  blackout: {
    category: "Doma",
    eyebrow: "KEĎ ZHASNE SVETLO",
    summary: "Svetlo, energia a pokojný plán na prvé hodiny bez elektriny.",
    art: "power",
    color: "#F3BE67",
    takeaway:
      "Spaľovacie zariadenia a generátory nepatria do uzavretých priestorov.",
  },
  flood: {
    category: "Doma",
    eyebrow: "BEZPEČNÝ PRESUN",
    summary:
      "Pripravte sa včas. Povodňová voda môže skrývať prúd aj poškodenú cestu.",
    art: "water",
    color: "#83C9E8",
    takeaway: "Do zaplavenej cesty nevstupujte pešo ani autom.",
  },
  fire: {
    category: "Doma",
    eyebrow: "PRVÉ ROZHODNUTIA",
    summary:
      "Voľná úniková cesta, bezpečný odchod a správne privolanie pomoci.",
    art: "home",
    color: "#EE9C83",
    takeaway: "Veci sa dajú nahradiť. Do horiacej budovy sa nevracajte.",
  },
  alert: {
    category: "Doma",
    eyebrow: "OVERENÉ INFORMÁCIE",
    summary: "Kde hľadať pokyny, keď počujete sirénu alebo dostanete výstrahu.",
    art: "radio",
    color: "#B4ADEA",
    takeaway: "READY neposiela živé výstrahy. Rozhodujú pokyny úradov.",
  },
  chemical: {
    category: "Doma",
    eyebrow: "UKRYTIE A POKYNY",
    summary:
      "Nepribližujte sa k úniku. Ďalší postup závisí od konkrétnej látky.",
    art: "home",
    color: "#A9C8A4",
    takeaway:
      "Smer presunu a miesto ukrytia neurčujte podľa všeobecnej internetovej rady.",
  },
  evacuation: {
    category: "Príprava",
    eyebrow: "PLÁN NA ODCHOD",
    summary:
      "Čo vziať, koho kontaktovať a ako odísť podľa oficiálnych pokynov.",
    art: "bag",
    color: "#BFC7EB",
    takeaway: "Nariadenú evakuáciu neodkladajte kvôli baleniu vecí.",
  },
};
const baseGuides: AcademyGuide[] = guides.map((g) => ({
  ...g,
  ...legacy[g.id],
  minutes: 3,
  sourceName: g.source.includes("minv.sk")
    ? "Ministerstvo vnútra SR"
    : "Ready.gov / FEMA",
  steps: g.steps.map((body, i) => ({ title: `Krok ${i + 1}`, body })),
}));
const reviewed = "2026-11-03";
export const academyGuides: AcademyGuide[] = [
  ...baseGuides,
  ...civilProtectionGuides,
  {
    id: "go-bag",
    title: "Batoh na prvých 72 hodín",
    category: "Príprava",
    eyebrow: "ZBAĽTE SI POKOJ",
    summary:
      "Prehľadná výbava pre odchod z domu. Prispôsobte ju ľuďom, nie obrázku na internete.",
    art: "bag",
    color: "#E8BA8A",
    minutes: 4,
    source: "https://www.ready.gov/kit",
    sourceName: "Ready.gov / FEMA",
    reviewed,
    takeaway:
      "Batoh má byť prenosný. Základná výbava nie je dôvod odložiť okamžitý bezpečný odchod.",
    steps: [
      {
        title: "Začnite tým osobným",
        body: "Pripravte potrebné lieky, zoznam liekov a dávkovania, doklady alebo ich bezpečné kópie, náhradné okuliare a kontakty na papieri. Berte do úvahy deti, seniorov a zdravotné potreby.",
      },
      {
        title: "Voda a jedlo",
        body: "Zvoľte prenosnú pitnú vodu a trvanlivé jedlo, ktoré viete pripraviť alebo zjesť v danej situácii. Celkovú zásobu domácnosti plánujte oddelene; ťažký batoh nesmie brániť presunu.",
      },
      {
        title: "Svetlo a spojenie",
        body: "Pridajte baterku, rádio, vhodné batérie, nabitú powerbanku a kábel. Jednu sadu kontaktov uložte na papier, aby ste sa nespoliehali iba na telefón.",
      },
      {
        title: "Pohodlie a hygiena",
        body: "Zabaľte primeranú vrstvu oblečenia, ochranu pred dažďom, hygienické potreby a jednoduchú lekárničku. Zvážte potreby zvierat a podmienky ročného obdobia.",
      },
      {
        title: "Vyskúšajte ho",
        body: "Batoh označte, uložte na dostupné miesto a skúste ho krátko niesť. Pravidelne kontrolujte lieky, batérie a dátumy. Dohodnite si, kto berie čo.",
      },
    ],
  },
  {
    id: "water-storage",
    title: "Pitná voda bez improvizácie",
    category: "Príprava",
    eyebrow: "ZÁKLAD DOMÁCNOSTI",
    summary: "Ako evidovať, skladovať a pravidelne obmieňať pitnú vodu.",
    art: "water",
    color: "#91CDE2",
    minutes: 4,
    source: "https://www.ready.gov/water",
    sourceName: "Ready.gov / FEMA",
    reviewed,
    takeaway:
      "Varenie neodstráni všetky chemické alebo rádioaktívne znečistenia. Pri pochybnostiach používajte odporúčaný bezpečný zdroj.",
    steps: [
      {
        title: "Začnite bezpečným zdrojom",
        body: "Najjednoduchšia rezerva je originálne uzavretá pitná voda. Sledujte pokyny na obale a odporúčania miestnych úradov. Množstvo prispôsobte domácnosti, teplu, zdravotným potrebám a zvieratám.",
      },
      {
        title: "Vyberte správne nádoby",
        body: "Na vlastné plnenie používajte čisté nádoby určené na potraviny a vodu. Nikdy nepoužívajte obaly po chemikáliách. Označte dátum naplnenia a pôvod vody.",
      },
      {
        title: "Skladujte s rozumom",
        body: "Vodu držte v chlade, tme a mimo chemikálií, palív alebo priameho slnka. Uzávery nechajte chránené pred znečistením. Dodržujte pokyny výrobcu nádoby a vody.",
      },
      {
        title: "Obmieňajte a zapisujte",
        body: "Skontrolujte obaly a dátumy. Poškodené alebo podozrivé zásoby nepovažujte automaticky za pitné. Do Zásob zapíšte len pitnú vodu v litroch alebo mililitroch.",
      },
      {
        title: "Pri výstrahe neodhadujte",
        body: "Ak je voda z vodovodu označená za nevhodnú na pitie, riaďte sa konkrétnymi pokynmi dodávateľa a úradu verejného zdravotníctva. Číry vzhľad vody nie je dôkaz bezpečnosti.",
      },
    ],
  },
  {
    id: "safe-cooking",
    title: "Jedlo, keď sa nedá variť",
    category: "Príprava",
    eyebrow: "JEDNODUCHÝ JEDÁLNIČEK",
    summary:
      "Praktická rezerva bez závislosti od sporáka a bez rizikového varenia v interiéri.",
    art: "food",
    color: "#CED69D",
    minutes: 3,
    source: "https://www.ready.gov/food",
    sourceName: "Ready.gov / FEMA",
    reviewed,
    takeaway:
      "Gril ani vonkajší varič nepoužívajte vo vnútri. Zásoba kalórií sama osebe nie je vyvážený jedálniček.",
    steps: [
      {
        title: "Vyberte jedlo na priamu konzumáciu",
        body: "Zohľadnite alergie, diéty, deti a obmedzenia domácnosti. Vyberajte bežne používané výrobky, ktoré podľa obalu nevyžadujú varenie a majú vhodné skladovanie.",
      },
      {
        title: "Myslite na otvorenie a hygienu",
        body: "Pripravte ručný otvárač, čistý príbor, nádoby a hygienické potreby. Rozdeľte rezervu na praktické porcie; po otvorení dodržte pokyny na uchovanie potraviny.",
      },
      {
        title: "Nespoliehajte sa na chuť",
        body: "Pri výpadku chladenia sa riaďte bezpečnostnými pokynmi k času a teplote. Potraviny neskúšajte ochutnávaním na overenie bezpečnosti. Podozrivý výrobok nekonzumujte.",
      },
      {
        title: "Výbava patrí na správne miesto",
        body: "Používajte len zariadenie určené výrobcom pre dané miesto a podmienky. Grily a vonkajšie variče nepatria do bytu, pivnice ani garáže. Palivá skladujte bezpečne podľa výrobcu.",
      },
    ],
  },
  {
    id: "communication",
    title: "Rodina v spojení",
    category: "Príprava",
    eyebrow: "PLÁN AJ BEZ SIGNÁLU",
    summary:
      "Jeden dohodnutý kontakt a dve miesta stretnutia môžu znížiť chaos.",
    art: "radio",
    color: "#C2B6E7",
    minutes: 3,
    source: "https://www.ready.gov/plan",
    sourceName: "Ready.gov / FEMA",
    reviewed,
    takeaway:
      "READY vaše kontakty automaticky nekontaktuje a nezdieľa vašu polohu.",
    steps: [
      {
        title: "Dohodnite kontaktnú osobu",
        body: "Vyberte blízku osobu, ktorej môžete podať krátku správu. Dohodnite si, kto kontaktuje koho, ak ste od seba. Dôležité čísla zapíšte aj na papier.",
      },
      {
        title: "Určite dve miesta",
        body: "Dohodnite miesto v okolí domova a záložné miesto mimo bezprostredného okolia. Uistite sa, že všetci rozumejú, kedy sa má použiť ktoré miesto. Miesto nikdy nevoľte v rozpore s pokynmi úradov.",
      },
      {
        title: "Pošlite stručnú informáciu",
        body: "Ak je to možné, použite krátku textovú správu namiesto dlhého hovoru. Nezahlcujte siete opakovaným volaním. Pri bezprostrednom ohrození volajte tiesňovú linku.",
      },
      {
        title: "Vyskúšajte plán nanečisto",
        body: "Zapíšte miesto a kontakty do sekcie Plán. Skontrolujte nabitie powerbanky a dohodnite pravidelnú spoločnú kontrolu údajov.",
      },
    ],
  },
  {
    id: "first-aid",
    title: "Prvé minúty pri úraze",
    category: "Prvá pomoc",
    eyebrow: "BEZPEČIE → POMOC → POKYNY",
    summary:
      "Všímajte si okolie, privolajte pomoc a postupujte podľa operátora.",
    art: "medical",
    color: "#E9ACA6",
    minutes: 3,
    source: "https://www.redcross.org/take-a-class/first-aid",
    sourceName: "American Red Cross",
    reviewed,
    takeaway:
      "Text nenahrádza kurz prvej pomoci. Pri ohrození života volajte 112 alebo 155 a riaďte sa operátorom.",
    steps: [
      {
        title: "Najprv bezpečné miesto",
        body: "Pred priblížením zhodnoťte premávku, elektrinu, oheň, dym alebo iné riziko. Nevystavujte seba ani ďalších ľudí nebezpečenstvu. Ak miesto nie je bezpečné, privolajte záchranné zložky.",
      },
      {
        title: "Zavolajte pomoc",
        body: "Pri vážnom úraze alebo poruche vedomia volajte 112 alebo 155. Povedzte presné miesto, čo sa stalo, počet zranených a ich stav. Ak môžete, zapnite hlasitý odposluch.",
      },
      {
        title: "Sledujte pokyny operátora",
        body: "Operátor vám pomôže zhodnotiť vedomie a dýchanie a dá pokyny k potrebným úkonom. Nečakajte na návod z videa. Ak ste svedkami, požiadajte konkrétnu osobu o pomoc alebo prinesenie AED.",
      },
      {
        title: "Zostaňte pri človeku",
        body: "Ak je to bezpečné, zostaňte so zraneným, upokojujte ho a sledujte zmeny. Dodržujte pokyny operátora až do príchodu pomoci. Pripravte prístup pre záchranárov.",
      },
    ],
  },
  {
    id: "heat",
    title: "Horúčava: spomaľte včas",
    category: "Vonku",
    eyebrow: "LETNÁ PRIPRAVENOSŤ",
    summary: "Tieň, pitná voda a pozornosť k deťom, starším ľuďom a zvieratám.",
    art: "water",
    color: "#EBC27D",
    minutes: 3,
    source: "https://www.ready.gov/heat",
    sourceName: "Ready.gov / FEMA",
    reviewed,
    takeaway:
      "Zmätenosť, kolaps alebo porucha vedomia pri horúčave sú dôvodom okamžite privolať odbornú pomoc.",
    steps: [
      {
        title: "Plánujte chladnejšie hodiny",
        body: "Náročnú aktivitu presuňte na chladnejšiu časť dňa, ak to môžete ovplyvniť. Vyhľadávajte tieň a primerane chladné priestory. Sledujte oficiálne výstrahy pred horúčavou.",
      },
      {
        title: "Majte dostupnú pitnú vodu",
        body: "Pite primerane potrebám a podmienkam. Pri zdravotných obmedzeniach príjmu tekutín rešpektujte individuálne pokyny lekára. Nečakajte iba na pocit smädu u osôb, ktoré potrebujú pomoc.",
      },
      {
        title: "Skontrolujte blízkych",
        body: "Venujte pozornosť deťom, seniorom a chronicky chorým. Nikoho ani zviera nenechávajte v zaparkovanom aute, ani na krátko.",
      },
      {
        title: "Pri vážnych príznakoch volajte",
        body: "Pri kolapse, zmätenosti, poruche vedomia alebo podozrení na závažné prehriatie volajte 112 alebo 155. Presuňte sa do bezpečného chladnejšieho prostredia, ak je to možné, a riaďte sa operátorom.",
      },
    ],
  },
  {
    id: "storm",
    title: "Búrka bez zbytočného rizika",
    category: "Vonku",
    eyebrow: "POČASIE SA MENÍ",
    summary: "Rozpoznajte čas na návrat a vyhľadajte vhodné ukrytie.",
    art: "outdoor",
    color: "#AEBFE1",
    minutes: 3,
    source: "https://www.ready.gov/thunderstorms-lightning",
    sourceName: "Ready.gov / FEMA",
    reviewed,
    takeaway:
      "Osamelý strom ani otvorený turistický prístrešok nie sú spoľahlivé ukrytie pred bleskom.",
    steps: [
      {
        title: "Pozrite výstrahy pred odchodom",
        body: "Pred cestou sledujte predpoveď a výstrahy. Zvážte možnosť bezpečne sa vrátiť alebo ukryť. V horách môže vhodný úkryt chýbať; plán prispôsobte vopred.",
      },
      {
        title: "Pri hromoch hľadajte bezpečie",
        body: "Vyhľadajte vhodnú uzavretú budovu alebo uzavreté vozidlo podľa situácie. Nezostávajte na otvorenom priestranstve, pri vode alebo pod osamelým stromom.",
      },
      {
        title: "Počkajte na bezpečný návrat",
        body: "Nevracajte sa k aktivite iba preto, že dážď zoslabol. Sledujte oficiálne odporúčania a vývoj búrky. Vyhnite sa popadaným vodičom a poškodeným stromom.",
      },
    ],
  },
  {
    id: "winter",
    title: "Zima a výpadok kúrenia",
    category: "Doma",
    eyebrow: "TEPLO BEZ RIZIKA",
    summary: "Vrstvy, vhodný priestor a bezpečná záložná možnosť vykurovania.",
    art: "home",
    color: "#B0D5DD",
    minutes: 3,
    source: "https://www.ready.gov/winter-weather",
    sourceName: "Ready.gov / FEMA",
    reviewed,
    takeaway: "Rúra, gril alebo generátor nie sú náhradné kúrenie v byte.",
    steps: [
      {
        title: "Udržte teplo rozumne",
        body: "Oblečte si suché vrstvy a použite prikrývky. Zvážte pobyt v jednej vhodnej miestnosti a obmedzte zbytočné úniky tepla bez blokovania potrebného vetrania a únikových ciest.",
      },
      {
        title: "Nepoužívajte improvizované kúrenie",
        body: "Používajte iba zariadenie určené výrobcom na vykurovanie daného priestoru. Dodržte odstupy od horľavín a požiadavky na vetranie. Gril, rúru ani generátor na vykurovanie nepoužívajte.",
      },
      {
        title: "Skontrolujte potreby domácnosti",
        body: "Sledujte deti, seniorov a ľudí so zdravotnými potrebami. Ak prostredie nedokážete bezpečne udržať, zistite možnosti presunu na vykurované miesto podľa pokynov obce.",
      },
      {
        title: "Pri ohrození zdravia privolajte pomoc",
        body: "Pri zmätenosti, výraznej ospalosti, poruche vedomia alebo podozrení na otravu oxidom uhoľnatým sa dostaňte do bezpečia a volajte 112 alebo 155. Riaďte sa operátorom.",
      },
    ],
  },
  {
    id: "pets",
    title: "Plán aj pre zvieratá",
    category: "Príprava",
    eyebrow: "CELÁ DOMÁCNOSŤ",
    summary: "Prepravka, krmivo, lieky a kontakt, ktorý pomôže pri odchode.",
    art: "bag",
    color: "#C3CBA2",
    minutes: 3,
    source: "https://www.ready.gov/pets",
    sourceName: "Ready.gov / FEMA",
    reviewed,
    takeaway:
      "Možnosť prijatia zvieraťa v cieľovom mieste si overte vopred. Aplikácia ju negarantuje.",
    steps: [
      {
        title: "Pripravte identifikáciu",
        body: "Skontrolujte aktuálne kontakty pri identifikácii zvieraťa. Pripravte fotografiu, potrebné veterinárne záznamy a zoznam liekov. Kópie majte dostupné aj bez internetu.",
      },
      {
        title: "Zbaľte základné potreby",
        body: "Pripravte krmivo, pitnú vodu, misky, vhodnú prepravku alebo vôdzku, hygienické potreby a lieky podľa veterinára. Zohľadnite hmotnosť pri transporte.",
      },
      {
        title: "Dohodnite záložnú pomoc",
        body: "Dohodnite sa s dôveryhodnou osobou, ktorá vie pomôcť, ak nie ste doma. Overte pravidlá cieľového ubytovania alebo evakuačného miesta.",
      },
      {
        title: "Nacvičte bezpečný presun",
        body: "Zoznámte zviera s prepravkou a uložením výbavy. Pri skutočnej udalosti sa riaďte pokynmi záchranných zložiek a nevracajte sa do nebezpečia.",
      },
    ],
  },
  {
    id: "digital-kit",
    title: "Doklady a kontakty po ruke",
    category: "Príprava",
    eyebrow: "MALÁ ZÁLOHA, VEĽKÝ ROZDIEL",
    summary: "Papierový zoznam a bezpečne uložené kópie dôležitých údajov.",
    art: "radio",
    color: "#C1B8DC",
    minutes: 3,
    source: "https://www.ready.gov/financial-preparedness",
    sourceName: "Ready.gov / FEMA",
    reviewed,
    takeaway: "Záloha READY nie je šifrovaná. Chráňte ju ako osobné údaje.",
    steps: [
      {
        title: "Vyberte dôležité informácie",
        body: "Spíšte kontakty, základné zdravotné informácie potrebné pri pomoci a prehľad dôležitých dokumentov. Zhromažďujte len údaje, ktoré skutočne potrebujete.",
      },
      {
        title: "Urobte bezpečné kópie",
        body: "Kópie uchovajte na vhodnom chránenom mieste. Pri digitálnych dokumentoch používajte ochranu zariadenia a dôveryhodné zabezpečené úložisko. Nezdieľajte verejne citlivé údaje.",
      },
      {
        title: "Majte aj papierovú možnosť",
        body: "Najdôležitejšie kontakty vytlačte alebo napíšte. Telefón sa môže vybiť, poškodiť alebo stratiť. Do rodinného plánu pridajte dohodnuté miesto stretnutia.",
      },
      {
        title: "Zálohujte READY",
        body: "V Nastaveniach vytvorte JSON zálohu. Obsahuje aj kontakty a miesto stretnutia, preto ju uložte bezpečne. Po zmene údajov zálohu obnovte novým exportom.",
      },
    ],
  },
  {
    id: "hiking",
    title: "Na výlet s plánom návratu",
    category: "Vonku",
    eyebrow: "PRIPRAVENÍ AJ MIMO DOMU",
    summary: "Trasa, počasie a kontakt, ktorý vie, kedy sa máte vrátiť.",
    art: "outdoor",
    color: "#ACCBB8",
    minutes: 3,
    source: "https://hzs.sk/",
    sourceName: "Horská záchranná služba",
    reviewed,
    takeaway:
      "Tento návod nie je navigácia ani aktuálna informácia o podmienkach na trase.",
    steps: [
      {
        title: "Vyberte primeranú trasu",
        body: "Zohľadnite kondíciu, skúsenosti, denný čas, ročné obdobie a počasie. Aktuálne obmedzenia a výstrahy overte z oficiálnych zdrojov pred odchodom.",
      },
      {
        title: "Oznámte plán návratu",
        body: "Dôveryhodnej osobe povedzte trasu a čas očakávaného návratu. Dohodnite si, čo má urobiť, ak sa neozvete. Dôležité kontakty si pripravte pred cestou.",
      },
      {
        title: "Zbaľte výbavu podľa podmienok",
        body: "Majte pitnú vodu, primerané jedlo, svetlo, ochranu pred počasím a nabitý telefón. Pripravte si mapu dostupnú bez internetu a vedzte, ako ju používať.",
      },
      {
        title: "Zmeňte plán včas",
        body: "Pri zhoršení počasia, neistote o trase alebo únave sa bezpečne vráťte alebo zvoľte vhodný postup podľa situácie. Pri núdzi volajte 112 a oznámte čo najpresnejšiu polohu.",
      },
    ],
  },
  {
    id: "support-needs",
    title: "Keď niekto potrebuje viac pomoci",
    category: "Príprava",
    eyebrow: "PLÁN PRE KAŽDÉHO",
    summary:
      "Lieky, pomôcky, presun a dohodnutá podpora bez zbytočných predpokladov.",
    art: "medical",
    color: "#DDC5A6",
    minutes: 3,
    source: "https://www.ready.gov/disability",
    sourceName: "Ready.gov / FEMA",
    reviewed,
    takeaway:
      "Zdravotné potreby a rezervy liekov konzultujte s ošetrujúcim odborníkom.",
    steps: [
      {
        title: "Spíšte konkrétne potreby",
        body: "S človekom, ktorého sa plán týka, prejdite lieky, zdravotné pomôcky, komunikáciu, prístupnosť a pomoc pri presune. Nepredpokladajte, čo dokáže alebo potrebuje.",
      },
      {
        title: "Dohodnite pomocníkov",
        body: "Dohodnite aspoň jednu dôveryhodnú osobu a záložný kontakt. Jasne si povedzte, kto pomôže, ako sa spojíte a čo sa stane, keď vypadne telefón.",
      },
      {
        title: "Pripravte záložné možnosti",
        body: "Pri pomôckach závislých od elektriny si s poskytovateľom a zdravotníkom pripravte individuálny bezpečný plán. Zistite potreby nabíjania, zásob a presunu.",
      },
      {
        title: "Vyskúšajte dostupnosť plánu",
        body: "Majte plán v čitateľnej alebo inak prístupnej forme. Overte, že potrebné veci dokáže daný človek alebo dohodnutý pomocník rýchlo nájsť a preniesť.",
      },
    ],
  },
];
export const academyCategories = [
  "Všetko",
  "Príprava",
  "Doma",
  "Vonku",
  "Prvá pomoc",
  "Uložené",
] as const;
export type AcademyFilter = (typeof academyCategories)[number];
export function searchAcademy(
  query: string,
  category: AcademyFilter = "Všetko",
  savedIds: readonly string[] = [],
): AcademyGuide[] {
  const term = query.trim().toLocaleLowerCase("sk-SK");
  return academyGuides.filter(
    (g) =>
      (category === "Všetko" ||
        (category === "Uložené"
          ? savedIds.includes(g.id)
          : g.category === category)) &&
      `${g.title} ${g.summary} ${g.category}`
        .toLocaleLowerCase("sk-SK")
        .includes(term),
  );
}
export function guideBookmark(guide: AcademyGuide, done: boolean): Checklist {
  return {
    id: `bookmark-${guide.id}`,
    name: `Uložený návod: ${guide.title}`,
    topic: "ukrytie",
    done,
  };
}
export function savedGuideIds(checklists: readonly Checklist[]): string[] {
  const saved = new Set(
    checklists.filter((item) => item.done).map((item) => item.id),
  );
  return academyGuides
    .filter((guide) => saved.has(`bookmark-${guide.id}`))
    .map((guide) => guide.id);
}
export type VideoTopic = {
  id: string;
  title: string;
  summary: string;
  organization: string;
  query: string;
  language: string;
  art: AcademyArtKind;
  color: string;
};
export const videoTopics: VideoTopic[] = [
  {
    id: "first-aid",
    title: "Prvá pomoc v praxi",
    summary: "Vyhľadajte ukážky od organizácie, ktorá učí prvú pomoc.",
    organization: "Slovenský Červený kríž",
    query: "Slovenský Červený kríž prvá pomoc",
    language: "Slovenčina",
    art: "medical",
    color: "#E9ACA6",
  },
  {
    id: "cpr",
    title: "Resuscitácia a AED",
    summary: "Nácvik sa učí na kurze. V núdzi sa riaďte operátorom 155 / 112.",
    organization: "Slovenský Červený kríž",
    query: "Slovenský Červený kríž resuscitácia AED",
    language: "Slovenčina",
    art: "medical",
    color: "#E5B8AC",
  },
  {
    id: "bag",
    title: "Čo do evakuačného batoha",
    summary: "Nájdite ukážky výbavy a porovnajte ich s potrebami domácnosti.",
    organization: "FEMA / Ready.gov",
    query: "FEMA Ready emergency supply kit",
    language: "Angličtina",
    art: "bag",
    color: "#E5BD89",
  },
  {
    id: "water",
    title: "Voda a domáce zásoby",
    summary: "Pozrite si prípravu zásoby vody podľa oficiálnych zdrojov.",
    organization: "FEMA / Ready.gov",
    query: "FEMA Ready emergency water storage",
    language: "Angličtina",
    art: "water",
    color: "#A3CFE2",
  },
  {
    id: "fire",
    title: "Požiar a bezpečný únik",
    summary: "Vyhľadajte prevenciu požiarov a ukážky bezpečného postupu.",
    organization: "Hasičský a záchranný zbor",
    query: "Hasičský a záchranný zbor požiar prevencia evakuácia",
    language: "Slovenčina",
    art: "home",
    color: "#E7AE91",
  },
  {
    id: "mountains",
    title: "Bezpečne do hôr",
    summary: "Príprava výletu, výbava a rozhodovanie podľa podmienok.",
    organization: "Horská záchranná služba",
    query: "Horská záchranná služba bezpečnosť v horách",
    language: "Slovenčina",
    art: "outdoor",
    color: "#B0CDB7",
  },
  {
    id: "blackout",
    title: "Domácnosť bez elektriny",
    summary: "Plánovanie energie a zásob pri výpadku elektriny.",
    organization: "FEMA / Ready.gov",
    query: "FEMA Ready power outage preparedness generator safety",
    language: "Angličtina",
    art: "power",
    color: "#E6C185",
  },
  {
    id: "family",
    title: "Rodinný núdzový plán",
    summary: "Ako si dohodnúť kontakty, stretnutie a postup pri odlúčení.",
    organization: "American Red Cross",
    query: "American Red Cross family emergency communication plan",
    language: "Angličtina",
    art: "radio",
    color: "#C4B9DE",
  },
];
export function youtubeSearchUrl(query: string): string {
  if (!query.trim()) throw new Error("Chýba téma vyhľadávania.");
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`;
}
