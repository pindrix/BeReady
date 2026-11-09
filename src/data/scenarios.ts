import type { AcademyArtKind } from "./academy";
export type ScenarioChoice = {
  id: string;
  label: string;
  detail: string;
  next: string;
};
export type ScenarioQuestion = {
  kind: "question";
  title: string;
  body: string;
  choices: ScenarioChoice[];
};
export type ScenarioOutcome = {
  kind: "outcome";
  title: string;
  body: string;
  actions: string[];
  guideId: string;
  urgent: boolean;
};
export type Scenario = {
  id: string;
  title: string;
  summary: string;
  art: AcademyArtKind;
  color: string;
  duration: string;
  start: string;
  nodes: Record<string, ScenarioQuestion | ScenarioOutcome>;
};
/** Bundled practice paths, never live triage, live warnings or a safety guarantee. */
export const scenarios: Scenario[] = [
  {
    id: "blackout",
    title: "Keď doma zhasne svetlo",
    summary: "Rozlíšte bezprostredné nebezpečenstvo od prípravy na výpadok.",
    art: "power",
    color: "#F0C27C",
    duration: "2–3 min",
    start: "start",
    nodes: {
      start: {
        kind: "question",
        title: "Čo sa deje okolo vás?",
        body: "Predstavte si výpadok elektriny doma. Najprv zhodnoťte viditeľné ohrozenie, nie stav batérie telefónu.",
        choices: [
          {
            id: "danger",
            label: "Dym, požiar alebo iskrenie",
            detail: "V okolí vidím známky bezprostredného nebezpečenstva.",
            next: "danger",
          },
          {
            id: "medical",
            label: "Niekto potrebuje elektrický zdravotnícky prístroj",
            detail: "Výpadok môže ovplyvniť zdravotný stav človeka.",
            next: "medical",
          },
          {
            id: "dark",
            label: "Tma bez viditeľného nebezpečenstva",
            detail: "Chcem si pripraviť najbližšie kroky.",
            next: "light",
          },
        ],
      },
      light: {
        kind: "question",
        title: "Aký zdroj svetla pripravíte?",
        body: "Cieľom je svetlo bez ďalšieho rizika v domácnosti.",
        choices: [
          {
            id: "torch",
            label: "Baterku alebo čelovku",
            detail: "Mám ju dostupnú a viem skontrolovať napájanie.",
            next: "plan",
          },
          {
            id: "flame",
            label: "Mám poruke len sviečky",
            detail: "Potrebujem nájsť bezpečnejšiu alternatívu.",
            next: "safer-light",
          },
        ],
      },
      danger: {
        kind: "outcome",
        title: "Najprv bezpečný odstup a pomoc",
        body: "Toto už nie je bežný nácvik výpadku. Pri skutočnom ohrození neodkladajte privolanie pomoci kvôli aplikácii.",
        actions: [
          "Ak sa dá bezpečne odísť, opustite ohrozené miesto. Nevracajte sa po veci.",
          "Nedotýkajte sa poškodených elektrických zariadení. Z bezpečného miesta volajte 112 alebo 150.",
          "Riaďte sa operátorom a pokynmi záchranných zložiek.",
        ],
        guideId: "fire",
        urgent: true,
      },
      medical: {
        kind: "outcome",
        title: "Zdravotné potreby majú prednosť",
        body: "Postup závisí od prístroja a individuálneho zdravotného plánu. BE READY nevie posúdiť zostávajúci čas ani zdravotné riziko.",
        actions: [
          "Použite vopred dohodnutý záložný plán a pokyny k prístroju.",
          "Ak môže byť zdravie bezprostredne ohrozené, volajte 155 alebo 112. Pri pochybnostiach konzultujte zdravotnícku pomoc.",
          "Pre ďalšiu prípravu zapíšte záložné napájanie a kontakty podľa odporúčania poskytovateľa zdravotnej starostlivosti.",
        ],
        guideId: "support-needs",
        urgent: true,
      },
      plan: {
        kind: "outcome",
        title: "Pripravte si pokojný plán na prvé hodiny",
        body: "Bez viditeľného ohrozenia sa sústreďte na dostupnú výbavu a spoľahlivé informácie.",
        actions: [
          "Skontrolujte baterku, rádio, powerbanku a potrebné káble.",
          "Chladničku a mrazničku otvárajte čo najmenej. Sledujte oficiálne informácie.",
          "Generátor, gril ani spaľovacie zariadenie nepoužívajte v byte, garáži alebo inom uzavretom priestore.",
        ],
        guideId: "blackout",
        urgent: false,
      },
      "safer-light": {
        kind: "outcome",
        title: "Doplňte svetlo bez otvoreného ohňa",
        body: "Tento výsledok nie je odporúčanie improvizovať so spaľovacím zariadením. Vyberte vhodné batériové svetlo.",
        actions: [
          "Nájdite baterku, čelovku alebo bezpečné batériové svietidlo a skontrolujte ich.",
          "Otvorený oheň zvyšuje riziko požiaru. Zariaďte domácnosti dostupné svetlo bez plameňa.",
          "Pridajte svetlo a vhodné batérie do zoznamu výbavy. Telefónu šetrite energiu pre spojenie.",
        ],
        guideId: "blackout",
        urgent: false,
      },
    },
  },
  {
    id: "leave-home",
    title: "Musíme odísť z domu",
    summary: "Rozhodnite sa podľa oficiálnych pokynov a dohody domácnosti.",
    art: "bag",
    color: "#D8B6E8",
    duration: "2 min",
    start: "start",
    nodes: {
      start: {
        kind: "question",
        title: "Máte pokyn na evakuáciu?",
        body: "Pokyny zodpovedných úradov a bezprostredná situácia majú prednosť pred domácim zoznamom.",
        choices: [
          {
            id: "ordered",
            label: "Áno, evakuácia je nariadená",
            detail: "Úrady určili ďalší postup alebo miesto.",
            next: "leave",
          },
          {
            id: "danger",
            label: "Vidím bezprostredné ohrozenie",
            detail: "Bezpečný odchod alebo pomoc nemôžu čakať.",
            next: "danger",
          },
          {
            id: "practice",
            label: "Nie, teraz iba pripravujeme plán",
            detail: "Chceme si vopred rozdeliť úlohy.",
            next: "meeting",
          },
        ],
      },
      meeting: {
        kind: "question",
        title: "Viete, kde sa stretnete?",
        body: "Myslite aj na situáciu, keď sa nedovoláte všetkým členom domácnosti.",
        choices: [
          {
            id: "agreed",
            label: "Máme miesto aj záložnú dohodu",
            detail: "Všetci vedia, ako sa podľa situácie rozhodnúť.",
            next: "rehearse",
          },
          {
            id: "missing",
            label: "Ešte sa potrebujeme dohodnúť",
            detail: "Miesto alebo kontaktná osoba nie sú jasné.",
            next: "agree",
          },
        ],
      },
      leave: {
        kind: "outcome",
        title: "Postupujte podľa nariadenej evakuácie",
        body: "Zoznam vecí nesmie oddialiť potrebný odchod.",
        actions: [
          "Nasledujte určenú trasu a cieľ. Nevoľte skratku cez ohrozené územie.",
          "Vezmite dostupné doklady, potrebné lieky, telefón a pripravený batoh, ak to neodkladá bezpečný odchod.",
          "Pomôžte ľuďom, ktorí potrebujú podporu, a riaďte sa organizáciou evakuácie.",
        ],
        guideId: "evacuation",
        urgent: true,
      },
      danger: {
        kind: "outcome",
        title: "Bezpečný odchod má prednosť",
        body: "BE READY nedokáže na diaľku rozhodnúť, či je trasa priechodná. Pri ohrození postupujte podľa záchranných zložiek.",
        actions: [
          "Ak je to bezpečné, vzdiaľte sa z ohrozeného miesta. Nezdržiavajte sa balením.",
          "Z bezpečného miesta volajte 112 a popíšte situáciu aj presnú polohu.",
          "Do ohrozeného miesta sa nevracajte bez povolenia zodpovedných orgánov.",
        ],
        guideId: "evacuation",
        urgent: true,
      },
      rehearse: {
        kind: "outcome",
        title: "Vyskúšajte dohodu nanečisto",
        body: "Dobrá dohoda je zrozumiteľná aj bez telefónu a bez tejto aplikácie.",
        actions: [
          "Prejdite si miesto stretnutia, záložnú možnosť a kontaktnú osobu.",
          "Dôležité údaje si zapíšte aj na papier a skontrolujte potreby detí, seniorov či zvierat.",
          "Pozrite si batoh a rozdeľte úlohy. Cvičenie nepripravujte ako skutočné tiesňové volanie.",
        ],
        guideId: "communication",
        urgent: false,
      },
      agree: {
        kind: "outcome",
        title: "Dohodnite jeden jasný rodinný plán",
        body: "Začnite jednoduchou dohodou, ktorú vie zopakovať každý člen domácnosti.",
        actions: [
          "Určite kontaktnú osobu, miesto v okolí domova a záložné miesto mimo bezprostredného okolia.",
          "Zapíšte dohodu do Plánu a na papier. Miesto vždy prispôsobte aktuálnym pokynom úradov.",
          "Pripravte rodinnú núdzovú kartu a skontrolujte ju spoločne.",
        ],
        guideId: "communication",
        urgent: false,
      },
    },
  },
  {
    id: "water-warning",
    title: "Voda nie je samozrejmosť",
    summary: "Skladovanie pitnej vody a reakcia na upozornenie dodávateľa.",
    art: "water",
    color: "#9BCFE1",
    duration: "2 min",
    start: "start",
    nodes: {
      start: {
        kind: "question",
        title: "Prečo riešite pitnú vodu?",
        body: "Vzhľad, vôňa alebo chuť nedokazujú bezpečnosť vody.",
        choices: [
          {
            id: "warning",
            label: "Máme oficiálny zákaz alebo upozornenie",
            detail: "Dodávateľ či úrad oznámil problém s vodou.",
            next: "official",
          },
          {
            id: "suspicious",
            label: "Voda je podozrivá alebo nepoznám jej pôvod",
            detail: "Nemám potvrdené, že je vhodná na pitie.",
            next: "unknown",
          },
          {
            id: "reserve",
            label: "Chcem vytvoriť rezervu domácnosti",
            detail: "Teraz plánujem v bezpečných podmienkach.",
            next: "source",
          },
        ],
      },
      source: {
        kind: "question",
        title: "Akú rezervu pripravujete?",
        body: "Vyberte nádoby a pokyny vhodné pre pitnú vodu.",
        choices: [
          {
            id: "bottled",
            label: "Originálne uzavretú pitnú vodu",
            detail: "Viem skontrolovať obal a skladovanie.",
            next: "bottled",
          },
          {
            id: "filled",
            label: "Vlastné plnenie do nádob",
            detail: "Potrebujem zvoliť vhodné nádoby a označenie.",
            next: "containers",
          },
        ],
      },
      official: {
        kind: "outcome",
        title: "Rozhoduje konkrétne upozornenie",
        body: "Univerzálna rada o prevarení nemusí riešiť dané znečistenie. BE READY neurčuje kvalitu miestnej vody.",
        actions: [
          "Dodržte presné pokyny dodávateľa a úradu verejného zdravotníctva vrátane obmedzení použitia.",
          "Používajte nimi odporúčaný bezpečný zdroj alebo náhradné zásobovanie.",
          "Nevychádzajte z domnienky, že varenie odstráni všetky chemické alebo rádioaktívne látky.",
        ],
        guideId: "water-storage",
        urgent: false,
      },
      unknown: {
        kind: "outcome",
        title: "Neznámy zdroj neoznačujte za pitný",
        body: "Číra voda ani improvizovaný filter nie sú potvrdením bezpečnosti.",
        actions: [
          "Na pitie a prípravu jedla zvoľte potvrdený bezpečný zdroj podľa dostupných oficiálnych pokynov.",
          "Informujte sa u dodávateľa alebo príslušného úradu. Pri zdravotných ťažkostiach vyhľadajte zdravotnícku pomoc.",
          "Podozrivú vodu nezapočítavajte do rezervy pitnej vody len preto, že vyzerá čisto.",
        ],
        guideId: "water-storage",
        urgent: false,
      },
      bottled: {
        kind: "outcome",
        title: "Zásobu evidujte a pravidelne kontrolujte",
        body: "Voda má slúžiť domácnosti, nie iba vytvárať pekné číslo v aplikácii.",
        actions: [
          "Skladujte podľa obalu, mimo slnka a chemikálií. Skontrolujte neporušenosť uzáverov.",
          "Do zásob zadajte skutočné množstvo v litroch alebo mililitroch a dátum na obale.",
          "Rezervu prispôsobte domácnosti, zdravotným potrebám, počasiu a zvieratám.",
        ],
        guideId: "water-storage",
        urgent: false,
      },
      containers: {
        kind: "outcome",
        title: "Použite nádoby určené na vodu a potraviny",
        body: "Obaly po chemikáliách sa na pitnú vodu nehodia ani po opláchnutí.",
        actions: [
          "Vyberte čisté nádoby určené na pitnú vodu alebo potraviny a dodržte pokyny k čisteniu a plneniu.",
          "Označte pôvod vody a dátum naplnenia. Skladujte ju v chlade a tme mimo chemikálií.",
          "Pravidelne kontrolujte stav a obmieňanie podľa odporúčaní k vode a nádobám.",
        ],
        guideId: "water-storage",
        urgent: false,
      },
    },
  },
  {
    id: "storm-outside",
    title: "Búrka nás zastihla vonku",
    summary: "Nacvičte si voľbu úkrytu a sledovanie oficiálnych informácií.",
    art: "outdoor",
    color: "#A9C2DF",
    duration: "2 min",
    start: "start",
    nodes: {
      start: {
        kind: "question",
        title: "Kde sa počas búrky nachádzate?",
        body: "Toto je prípravný nácvik. Pri skutočnom ohrození riaďte postup miestnymi pokynmi a možnosťami bezpečného presunu.",
        choices: [
          {
            id: "outside",
            label: "Vonku, mimo pevnej budovy",
            detail: "Potrebujem zvážiť dostupné možnosti ukrytia.",
            next: "shelter",
          },
          {
            id: "inside",
            label: "V pevnej uzavretej budove",
            detail: "Chcem znížiť ďalšie riziká a zostať informovaný.",
            next: "inside",
          },
        ],
      },
      shelter: {
        kind: "question",
        title: "Aké ukrytie máte na dosah?",
        body: "Otvorený prístrešok alebo osamelý strom nie sú náhradou bezpečného ukrytia.",
        choices: [
          {
            id: "building",
            label: "Pevnú uzavretú budovu",
            detail: "Môžem sa do nej bezpečne presunúť.",
            next: "building",
          },
          {
            id: "limited",
            label: "Len strom, stan či otvorený prístrešok",
            detail: "Nemám poruke spoľahlivé ukrytie.",
            next: "limited",
          },
        ],
      },
      inside: {
        kind: "outcome",
        title: "Zostaňte chránení a sledujte situáciu",
        body: "Ani ukrytie nie je dôvod ignorovať ďalšie varovania.",
        actions: [
          "Sledujte oficiálne výstrahy a nevychádzajte len kvôli pozorovaniu búrky.",
          "Držte sa ďalej od okien a dodržte pokyny pre používanie zariadení počas búrky.",
          "Ak je budova ohrozená požiarom, povodňou alebo poškodením, riaďte sa pokynmi záchranných zložiek.",
        ],
        guideId: "storm",
        urgent: false,
      },
      building: {
        kind: "outcome",
        title: "Bezpečne sa presuňte do vhodného ukrytia",
        body: "Nevstupujte pritom do zaplavenej cesty ani iného zjavne nebezpečného miesta.",
        actions: [
          "Ak je presun bezpečný, vyhľadajte pevnú uzavretú budovu a rešpektujte miestne pokyny.",
          "Nevyhľadávajte ukrytie pod osamelým stromom ani pri vodnej ploche.",
          "Po ukrytí sledujte oficiálne informácie; návrat von prispôsobte aktuálnej situácii.",
        ],
        guideId: "storm",
        urgent: false,
      },
      limited: {
        kind: "outcome",
        title: "Táto možnosť neposkytuje spoľahlivé ukrytie",
        body: "BE READY nedokáže z vašej polohy určiť bezpečnú trasu. Nejde o navigáciu v búrke.",
        actions: [
          "Osamelý strom, stan a otvorený prístrešok nepovažujte za bezpečný úkryt pred bleskom.",
          "Hľadajte vhodné ukrytie podľa situácie bez vstupu do vody alebo iného ohrozeného priestoru.",
          "Ak sa ocitnete v bezprostrednom nebezpečenstve alebo niekto potrebuje pomoc, volajte 112 a riaďte sa operátorom.",
        ],
        guideId: "storm",
        urgent: false,
      },
    },
  },
  {
    id: "injury-help",
    title: "Niekto sa zranil",
    summary:
      "Naučte sa včas rozpoznať potrebu pomoci, nie nahradiť zdravotníka.",
    art: "medical",
    color: "#E6B8AA",
    duration: "1–2 min",
    start: "start",
    nodes: {
      start: {
        kind: "question",
        title: "Je niekto vážne ohrozený alebo si nie ste istí?",
        body: "BE READY nie je zdravotnícka triáž. Pri pochybnostiach volajte odbornú pomoc a riaďte sa operátorom.",
        choices: [
          {
            id: "serious",
            label: "Človek nereaguje, ťažko dýcha alebo silno krváca",
            detail: "Môže ísť o život ohrozujúci stav.",
            next: "emergency",
          },
          {
            id: "uncertain",
            label: "Nie som si istý závažnosťou",
            detail: "Potrebujem odbornú radu o ďalšom postupe.",
            next: "uncertain",
          },
          {
            id: "minor",
            label: "Ide o drobný úraz bez viditeľného vážneho ohrozenia",
            detail:
              "Teraz chcem preveriť pripravenosť lekárničky a plán pomoci.",
            next: "kit",
          },
        ],
      },
      emergency: {
        kind: "outcome",
        title: "Volajte 155 alebo 112",
        body: "Nestrácajte čas prechádzaním prípravného scenára. Tento text nenahrádza pokyny operátora.",
        actions: [
          "Najprv dbajte na vlastnú bezpečnosť a bezpečnosť okolia.",
          "Privolajte zdravotnícku pomoc, povedzte presné miesto a čo vidíte. Ak je s vami ďalší človek, rozdeľte si úlohy.",
          "Riaďte sa operátorom. Úkony prvej pomoci vykonávajte podľa jeho pokynov alebo absolvovaného výcviku.",
        ],
        guideId: "first-aid",
        urgent: true,
      },
      uncertain: {
        kind: "outcome",
        title: "Neistotu vyriešte odbornou pomocou",
        body: "Aplikácia nevie vyšetriť človeka ani vylúčiť zhoršovanie stavu.",
        actions: [
          "Pri možnom závažnom stave kontaktujte 155 alebo 112 a pravdivo popíšte situáciu.",
          "Sledujte človeka, zaistite bezpečie a neodkladajte pomoc pri zhoršovaní stavu.",
          "Nepodávajte lieky alebo nerobte odborné zákroky len podľa všeobecného internetového návodu.",
        ],
        guideId: "first-aid",
        urgent: true,
      },
      kit: {
        kind: "outcome",
        title: "Pripravte si výbavu a kontakt na pomoc",
        body: "Táto vetva je kontrola pripravenosti, nie potvrdenie, že je človek zdravotne v poriadku.",
        actions: [
          "Skontrolujte dostupnosť čistej a doplnenej lekárničky a návodu k jej obsahu.",
          "Prvú pomoc poskytujte podľa osvojeného výcviku. Pri pochybnostiach alebo zhoršovaní vyhľadajte zdravotnícku pomoc.",
          "Pre domácnosť je užitočný praktický kurz prvej pomoci; mobilná aplikácia ho nenahrádza.",
        ],
        guideId: "first-aid",
        urgent: false,
      },
    },
  },
];
