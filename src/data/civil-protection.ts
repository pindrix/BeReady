import type { AcademyGuide } from "./academy";
/** Civilian preparedness only. Bundled summaries, not live warnings or an all-clear. */
export const civilProtectionGuides: AcademyGuide[] = [
  {
    id: "armed-conflict",
    title: "Vojnový konflikt: príprava civilistov",
    category: "Príprava",
    eyebrow: "CIVILNÁ OCHRANA",
    summary:
      "Rodinný plán, zásoby a bezpečné ukrytie. Sledujte miestne úrady; aplikácia neposkytuje živé výstrahy.",
    art: "bag",
    color: "#C4D6F4",
    minutes: 5,
    reviewed: "2026-11-06",
    source: "https://www.icrc.org/",
    sourceName: "ICRC · Civilian safety",
    takeaway:
      "Nedotýkajte sa munície ani neznámych predmetov. Vzdiaľte sa po bezpečnej trase a oznámte miesto záchranným zložkám.",
    steps: [
      {
        title: "Pripravte rodinný plán",
        body: "Dohodnite miesto stretnutia, kontakt mimo oblasti a pomoc deťom, seniorom a zvieratám. Doklady, lieky, vodu, rádio a batoh pripravte vopred.",
      },
      {
        title: "Pri ostreľovaní sa ukryte",
        body: "Choďte do určeného krytu alebo pevnej budovy, mimo okien a vonkajších stien. Nepoužívajte výťah; pri poškodení budovy sledujte pokyny záchranárov.",
      },
      {
        title: "Evakuácia podľa úradov",
        body: "Postupujte podľa pokynov úradov, určenej trasy a cieľa. Dajte blízkym vedieť, kam idete, ak to situácia dovolí.",
      },
      {
        title: "Nevstupujte do neznámeho terénu",
        body: "Vyhýbajte sa bojom, vojenským objektom, troskám a označeným nebezpečným miestam. Nezdvíhajte muníciu ani opustené predmety; nesnažte sa ich premiestniť.",
      },
      {
        title: "Overujte informácie",
        body: "Sledujte pokyny na ukrytie alebo evakuáciu. Táto aplikácia neprijíma živé výstrahy ani nerozpoznáva signály sirén.",
      },
    ],
  },
  {
    id: "nuclear-explosion",
    title: "Jadrový výbuch a rádioaktívny spad",
    category: "Príprava",
    eyebrow: "CIVILNÁ OCHRANA",
    summary:
      "Vstúpte dovnútra, zostaňte vnútri a sledujte oficiálne pokyny. Spad nie je možné spoľahlivo rozpoznať zmyslami.",
    art: "home",
    color: "#D9CDF3",
    minutes: 5,
    reviewed: "2026-11-06",
    source: "https://www.ready.gov/nuclear-explosion",
    sourceName: "FEMA / Ready.gov · Nuclear explosion",
    takeaway:
      "Tablety jodidu draselného užite iba na pokyn zdravotných úradov. Nechránia pred všetkým žiarením a nenahrádzajú ukrytie.",
    steps: [
      {
        title: "Pri záblesku sa chráňte",
        body: "Nepozerajte do záblesku. Ak ste vonku, padnite za dostupný kryt a chráňte hlavu pred tlakovou vlnou a úlomkami.",
      },
      {
        title: "Čo najskôr do pevnej budovy",
        body: "Po prechode tlakovej vlny vstúpte do najbližšej nepoškodenej pevnej budovy. Auto ani ľahký prístrešok neposkytujú dostatočnú ochranu pred spadom.",
      },
      {
        title: "Suterén alebo stred budovy",
        body: "Choďte do suterénu alebo stredu budovy, mimo okien, vonkajších stien a strechy. Zatvorte okná a dvere; vypnite prívod vonkajšieho vzduchu, ak je to bezpečné.",
      },
      {
        title: "Odstráňte kontamináciu",
        body: "Opatrne vyzlečte vonkajšiu vrstvu odevu, vložte ju do uzavretého vrecka mimo ľudí a zvierat. Umyte sa jemne mydlom a vodou; pokožku nedrhnite a nepoužívajte kondicionér.",
      },
      {
        title: "Zostaňte vnútri a počúvajte rádio",
        body: "Prvých 24 hodín zostaňte vnútri, ak budovu neohrozuje požiar či zrútenie alebo úrady nenariadia iný postup. Nevychádzajte hľadať rodinu; sledujte oficiálne pokyny a rádio.",
      },
      {
        title: "Voda, potraviny a lieky",
        body: "Používajte uzavreté zásoby vody a potravín. Varenie rádioaktívne látky z vody neodstráni. Tablety jodidu draselného neužívajte bez pokynu zdravotných úradov; deti nevyzdvihujte z chránených zariadení, kým to úrady nenariadia.",
      },
    ],
  },
];
