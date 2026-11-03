export type Mission = {
  id: string;
  title: string;
  eyebrow: string;
  time: string;
  icon:
    | "water-outline"
    | "flashlight-outline"
    | "bag-handle-outline"
    | "people-outline"
    | "nutrition-outline"
    | "walk-outline"
    | "cloud-download-outline";
  color: string;
  summary: string;
  steps: string[];
  action: {
    label: string;
    route: "/inventory" | "/plan" | "/settings" | "/shopping";
  };
  quiz: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
};

export const missions: Mission[] = [
  {
    id: "water",
    title: "Spoznajte svoju vodnú rezervu",
    eyebrow: "MALÝ KROK 01",
    time: "5 min",
    icon: "water-outline",
    color: "#3C91C9",
    summary:
      "Zistite, koľko pitnej vody doma skutočne máte. Dnes stačí začať presným prehľadom.",
    steps: [
      "Spočítajte pitnú vodu a skontrolujte stav obalov aj údaje výrobcu.",
      "V Zásobách zapíšte množstvo v litroch alebo mililitroch do kategórie Pitná voda.",
      "Porovnajte dni vody s cieľom domácnosti. Hodnota v profile je orientačná; prispôsobte ju svojim potrebám.",
    ],
    action: { label: "Zaevidovať pitnú vodu", route: "/inventory" },
    quiz: {
      question: "Čo sa automaticky počíta do dní pitnej vody?",
      options: [
        "Všetka tekutina v domácnosti",
        "Iba pitná voda evidovaná v l alebo ml",
        "Aj odhad vody v potravinách",
      ],
      correct: 1,
      explanation:
        "READY počíta iba evidovanú pitnú vodu v l/ml. Vodu v jedle, technickú vodu ani neznáme tekutiny automaticky nepripočítava.",
    },
  },
  {
    id: "light",
    title: "Posvieťte si na pripravenosť",
    eyebrow: "MALÝ KROK 02",
    time: "3 min",
    icon: "flashlight-outline",
    color: "#C18A3D",
    summary:
      "Funkčné svetlo, ktoré v tme nájdete, je užitočnejšie než zoznam výbavy v hlave.",
    steps: [
      "Vyskúšajte baterku alebo čelovku a skontrolujte náhradné batérie.",
      "Uložte svetlo na dostupné miesto, ktoré poznajú členovia domácnosti.",
      "Skontrolujte powerbanku a bezpečné nabíjanie. Zásobu alebo chýbajúce batérie si zapíšte.",
    ],
    action: { label: "Otvoriť nákupný zoznam", route: "/shopping" },
    quiz: {
      question: "Čo je vhodná prvá voľba svetla pri výpadku elektriny?",
      options: [
        "Baterka alebo čelovka",
        "Otvorený plameň pri závesoch",
        "Gril v uzavretej miestnosti",
      ],
      correct: 0,
      explanation:
        "Baterka alebo čelovka poskytne svetlo bez otvoreného ohňa. Spaľovacie zariadenia v uzavretých priestoroch môžu spôsobiť požiar aj otravu oxidom uhoľnatým.",
    },
  },
  {
    id: "bag",
    title: "Pripravte si základ batoha",
    eyebrow: "MALÝ KROK 03",
    time: "15 min",
    icon: "bag-handle-outline",
    color: "#518D76",
    summary:
      "Začnite vecami, ktoré vaša domácnosť reálne potrebuje. Dokonalý batoh nemusí vzniknúť za jeden deň.",
    steps: [
      "Vyberte dostupnú tašku a skontrolujte evakuačný checklist v Pláne.",
      "Pripravte doklady alebo kópie, osobné lieky podľa predpisu, vodu, svetlo a kontakty na papieri.",
      "Doplňte potreby detí, zvierat a ľudí, ktorí potrebujú pomoc. Hmotnosť prispôsobte svojim možnostiam.",
    ],
    action: { label: "Otvoriť evakuačný checklist", route: "/plan" },
    quiz: {
      question: "Čo má určovať obsah batoha?",
      options: [
        "Čo najvyššia hmotnosť",
        "Potreby domácnosti, možnosti presunu a pokyny úradov",
        "Iba univerzálny zoznam na internete",
      ],
      correct: 1,
      explanation:
        "Zoznam je východisko. Obsah prispôsobte konkrétnym osobám, zdravotným potrebám, zvieratám a bezpečnému presunu.",
    },
  },
  {
    id: "contacts",
    title: "Dohodnite si spojenie",
    eyebrow: "MALÝ KROK 04",
    time: "5 min",
    icon: "people-outline",
    color: "#8A74AE",
    summary:
      "Jedna spoločná dohoda môže ušetriť veľa neistoty. Zapíšte kontakty aj miesto stretnutia.",
    steps: [
      "Dohodnite hlavné a záložné miesto stretnutia podľa miestnych podmienok.",
      "Ručne uložte kontakty blízkych a vytvorte aj papierovú kópiu.",
      "Povedzte ostatným, kde plán nájdu. Zápis v aplikácii žiadnu správu automaticky neodošle.",
    ],
    action: { label: "Doplniť kontakty a miesto", route: "/plan" },
    quiz: {
      question:
        "Odošle READY uložený kontakt alebo miesto stretnutia blízkym automaticky?",
      options: [
        "Áno, vždy",
        "Nie, údaje zostávajú lokálne",
        "Iba počas výpadku elektriny",
      ],
      correct: 1,
      explanation:
        "READY údaje automaticky neposiela. Dohodu treba odkomunikovať; zdieľanie karty otvoríte iba vlastným krokom.",
    },
  },
  {
    id: "labels",
    title: "Prečítajte tri etikety",
    eyebrow: "MALÝ KROK 05",
    time: "7 min",
    icon: "nutrition-outline",
    color: "#D17D61",
    summary:
      "Presné množstvá a jednotky majú väčšiu hodnotu než optimistický odhad zásob.",
    steps: [
      "Vyberte tri potraviny a zapíšte ich množstvo aj dátum uvedený na obale.",
      "Energiu zadávajte na zvolenú jednotku. Pri kcal/100 g a evidencii v kg treba hodnotu vynásobiť desiatimi.",
      "Ak energiu nepoznáte, nechajte pole prázdne. Rozlišujte „spotrebujte do“ a minimálnu trvanlivosť.",
    ],
    action: { label: "Skontrolovať evidenciu zásob", route: "/inventory" },
    quiz: {
      question: "Obal uvádza 350 kcal/100 g. Koľko zadáte pri jednotke kg?",
      options: ["350 kcal/kg", "3 500 kcal/kg", "35 kcal/kg"],
      correct: 1,
      explanation:
        "Kilogram obsahuje desať porcií po 100 g, preto 350 × 10 = 3 500 kcal/kg. Kalórie však nie sú zárukou vyváženej výživy.",
    },
  },
  {
    id: "drill",
    title: "Vyskúšajte pokojný nácvik",
    eyebrow: "MALÝ KROK 06",
    time: "10 min",
    icon: "walk-outline",
    color: "#5B8CA0",
    summary:
      "Prejdite si doma jednoduchú modelovú situáciu. Bez nebezpečných pokusov a bez tiesňových volaní.",
    steps: [
      "Spoločne si povedzte, kde je svetlo, lekárnička a pripravená taška.",
      "Prejdite si bezpečný odchod z domácnosti a zohľadnite osoby potrebujúce pomoc. Neblokujte únikové cesty.",
      "Dohodnite jednu vec, ktorú zlepšíte. Skutočné núdzové linky pri cvičení nevytáčajte.",
    ],
    action: { label: "Zapísať vlastnú úlohu do Plánu", route: "/plan" },
    quiz: {
      question: "Máte pri domácom nácviku skúšobne volať 112?",
      options: [
        "Áno, aby sme si to overili",
        "Nie, tiesňová linka je pre skutočnú núdzu",
        "Áno, ak hovor rýchlo ukončíme",
      ],
      correct: 1,
      explanation:
        "Tiesňové linky neblokujte skúšobnými hovormi. Postup si precvičte slovne a pozrite si potvrdenie vytáčania bez uskutočnenia hovoru.",
    },
  },
  {
    id: "backup",
    title: "Uložte si plán aj mimo aplikácie",
    eyebrow: "MALÝ KROK 07",
    time: "5 min",
    icon: "cloud-download-outline",
    color: "#687CB0",
    summary:
      "Záloha a papierová karta pomôžu, keď vymeníte telefón alebo sa vybije batéria.",
    steps: [
      "V Nastaveniach exportujte JSON zálohu a overte, že sa skutočne uložila na vybrané miesto.",
      "Záloha obsahuje osobné kontakty a miesto stretnutia, nie je šifrovaná. Chráňte ju pred cudzím prístupom.",
      "Pripravte stručnú papierovú kópiu dôležitých kontaktov a dohody. Zálohu aktualizujte po podstatnej zmene.",
    ],
    action: { label: "Otvoriť zálohy v Nastaveniach", route: "/settings" },
    quiz: {
      question: "Čo platí pre JSON zálohu READY?",
      options: [
        "Je vždy automaticky bezpečne zašifrovaná",
        "Obsahuje lokálne údaje a treba ju uložiť dôveryhodne",
        "Nahrádza nabitý telefón a papierový plán",
      ],
      correct: 1,
      explanation:
        "JSON nie je šifrovaný. Obsahuje vaše údaje, preto zvoľte dôveryhodné miesto a zdieľajte ho iba vedome.",
    },
  },
];
