import type { IconName } from "../components/visual";

export type KitModule = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
  guide: string;
  optional?: boolean;
  items: { id: string; name: string; detail: string }[];
};
/** Local editorial packing prompts, not an official kit specification or medical advice. */
export const kitModules: KitModule[] = [
  {
    id: "water",
    title: "Pitná voda",
    subtitle: "Bezpečný zdroj, prenosné balenie.",
    icon: "water-outline",
    color: "#A7D6E4",
    guide: "water-storage",
    items: [
      {
        id: "water-container",
        name: "Pitná voda v prenosnej nádobe",
        detail:
          "Zvoľte bezpečnú pitnú vodu a vhodnú potravinársku nádobu. Množstvo prispôsobte možnostiam presunu.",
      },
      {
        id: "water-check",
        name: "Skontrolovaný obal a dátum",
        detail:
          "Pozrite uzáver, stav nádoby a pokyny výrobcu. Poškodený alebo neznámy zdroj neoznačujte za pitný.",
      },
      {
        id: "water-route",
        name: "Dohodnuté doplnenie vody",
        detail:
          "Zistite si oficiálne informácie o bezpečných zdrojoch. Výpočet domácej zásoby nie je požiadavka niesť všetku vodu v batohu.",
      },
    ],
  },
  {
    id: "food",
    title: "Jedlo",
    subtitle: "Známe potraviny, jednoduchá príprava.",
    icon: "nutrition-outline",
    color: "#D3DEA5",
    guide: "safe-cooking",
    items: [
      {
        id: "food-ready",
        name: "Jedlo vhodné na priamu konzumáciu",
        detail:
          "Riaďte sa obalom, alergiami a osobnými potrebami. Uprednostnite jedlá, ktoré bežne poznáte.",
      },
      {
        id: "food-tools",
        name: "Ručný otvárač a čistý príbor",
        detail:
          "Skontrolujte, že viete jedlo otvoriť a bezpečne zjesť aj bez elektriny.",
      },
      {
        id: "food-date",
        name: "Skontrolované skladovanie a dátumy",
        detail:
          "Neplánujte potraviny, ktoré vyžadujú nedostupné chladenie. Kalórie nie sú záruka vyváženej výživy.",
      },
    ],
  },
  {
    id: "light",
    title: "Svetlo a spojenie",
    subtitle: "Vidieť, počuť a vedieť sa ozvať.",
    icon: "flashlight-outline",
    color: "#EBC68B",
    guide: "blackout",
    items: [
      {
        id: "light-torch",
        name: "Funkčná baterka alebo čelovka",
        detail:
          "Vyskúšajte zapnutie. Otvorený oheň nenahrádza bezpečné svetlo.",
      },
      {
        id: "light-power",
        name: "Nabitá powerbanka a správny kábel",
        detail:
          "Skontrolujte kompatibilitu s telefónom a stav podľa pokynov výrobcu.",
      },
      {
        id: "light-radio",
        name: "Rádio a vhodné náhradné batérie",
        detail:
          "Dohodnite si, kde budete počúvať oficiálne informácie. Uložené návody nie sú živá výstražná služba.",
      },
    ],
  },
  {
    id: "medical",
    title: "Osobné potreby",
    subtitle: "Lieky a výbava podľa vašich potrieb.",
    icon: "medkit-outline",
    color: "#E8B9AC",
    guide: "first-aid",
    items: [
      {
        id: "medical-meds",
        name: "Osobné lieky podľa predpisu",
        detail:
          "Riešte zásobu, skladovanie a prípadné chladenie s lekárom alebo lekárnikom. Nemeňte liečbu podľa aplikácie.",
      },
      {
        id: "medical-list",
        name: "Zoznam liekov a dôležitých potrieb",
        detail:
          "Pripravte čitateľný zoznam, náhradné okuliare či iné potrebné pomôcky. Chráňte osobné údaje.",
      },
      {
        id: "medical-kit",
        name: "Lekárnička s použitelným obsahom",
        detail:
          "Skontrolujte obaly a dátumy; naučte sa používať výbavu na odbornom kurze prvej pomoci.",
      },
    ],
  },
  {
    id: "documents",
    title: "Doklady a dohoda",
    subtitle: "Dôležité informácie aj na papieri.",
    icon: "documents-outline",
    color: "#B9C7E6",
    guide: "communication",
    items: [
      {
        id: "documents-id",
        name: "Doklady alebo bezpečné kópie",
        detail:
          "Uložte ich primerane chránené pred vodou a neoprávneným prístupom.",
      },
      {
        id: "documents-contacts",
        name: "Kontakty a miesto stretnutia na papieri",
        detail:
          "Dohodnite hlavné aj záložné miesto a kontaktnú osobu. Nekonajte v rozpore s evakuačnými pokynmi.",
      },
      {
        id: "documents-cash",
        name: "Dostupné platidlo a potrebné kľúče",
        detail:
          "Pripravte primerané drobné platidlo podľa vlastných možností a skontrolujte prístup ku kľúčom.",
      },
    ],
  },
  {
    id: "warmth",
    title: "Oblečenie a teplo",
    subtitle: "Podmienky sa menia, vrstvy pomôžu.",
    icon: "shirt-outline",
    color: "#D8C5DD",
    guide: "winter",
    items: [
      {
        id: "warmth-layers",
        name: "Vhodné vrstvy a náhradné ponožky",
        detail:
          "Prispôsobte ich počasiu, ročnému obdobiu a schopnostiam ľudí v domácnosti.",
      },
      {
        id: "warmth-rain",
        name: "Ochrana pred dažďom",
        detail:
          "Pripravte použiteľný pršiplášť alebo inú vhodnú ochranu a chráňte citlivé veci pred vodou.",
      },
      {
        id: "warmth-blanket",
        name: "Primeraná prikrývka a pevná obuv",
        detail:
          "Výbava má byť prenosná a praktická. Pri nariadenej evakuácii neodkladajte odchod balením.",
      },
    ],
  },
  {
    id: "hygiene",
    title: "Hygiena",
    subtitle: "Malé veci, ktoré zvyšujú pohodlie.",
    icon: "sparkles-outline",
    color: "#BBDBC8",
    guide: "go-bag",
    items: [
      {
        id: "hygiene-hands",
        name: "Potreby na hygienu rúk",
        detail:
          "Vyberte výbavu vhodnú pre domácnosť a dodržiavajte pokyny výrobcu.",
      },
      {
        id: "hygiene-personal",
        name: "Osobné hygienické potreby",
        detail:
          "Zohľadnite menštruačné potreby, deti a ďalšie individuálne požiadavky.",
      },
      {
        id: "hygiene-waste",
        name: "Vrecká na odpad a čisté pomôcky",
        detail:
          "Udržujte jedlo, pitnú vodu a znečistené veci oddelene. Miestne pokyny majú prednosť.",
      },
    ],
  },
  {
    id: "pets",
    title: "Domáce zvieratá",
    subtitle: "Aj ich výbava má svoje miesto.",
    icon: "paw-outline",
    color: "#E2C19D",
    guide: "pets",
    optional: true,
    items: [
      {
        id: "pets-food",
        name: "Voda a bežné krmivo pre zviera",
        detail:
          "Množstvo a potreby určujte podľa zvieraťa; výpočet vody pre ľudí nezahŕňa zvieratá.",
      },
      {
        id: "pets-transport",
        name: "Bezpečný presun a označenie",
        detail:
          "Pripravte vhodnú prepravku alebo výbavu na presun a kontaktné označenie.",
      },
      {
        id: "pets-records",
        name: "Potrebné záznamy a osobné lieky zvieraťa",
        detail:
          "Špecifické potreby a lieky riešte s veterinárom. Overte prijatie zvierat v cieľovom mieste.",
      },
    ],
  },
];
export const KIT_PETS_FLAG = "kit-pets-enabled";
