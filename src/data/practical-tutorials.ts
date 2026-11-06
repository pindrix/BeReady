import type { Tutorial } from "./tutorials";

/** Authored training summaries. External pages were inaccessible through the session policy. */
export const practicalTutorials: Tutorial[] = [
  {
    id: "adult-cpr",
    guideId: "first-aid",
    kind: "adult-cpr",
    title: "Resuscitácia dospelého",
    summary:
      "Len pre dospelého, ktorý nereaguje a nedýcha normálne. V núdzi volajte 112 alebo 155 a riaďte sa operátorom.",
    sourceUrl: "https://www.nhs.uk/conditions/first-aid/cpr/",
    sourceName: "NHS · CPR",
    sourceVerifiedOnline: false,
    warning:
      "Spomalená tréningová ilustrácia nie je metronóm ani náhrada praktického kurzu. Tento postup nie je návodom pre deti alebo dojčatá.",
    steps: [
      {
        title: "Bezpečie, reakcia a dýchanie",
        body: "Skontrolujte bezpečie a oslovte človeka. Ak nereaguje, spriechodnite dýchacie cesty záklonom hlavy a zdvihnutím brady; najviac 10 sekúnd kontrolujte normálne dýchanie.",
        durationMs: 10000,
      },
      {
        title: "Volajte a požiadajte o AED",
        body: "Ak nedýcha normálne alebo iba lapá po dychu, volajte 112/155 cez reproduktor a požiadajte niekoho o AED. Ak dýcha normálne, hrudník nestláčajte; sledujte dýchanie a riaďte sa operátorom.",
        durationMs: 10000,
      },
      {
        title: "Stláčajte stred hrudníka",
        body: "Na chrbte na pevnom podklade položte pätu dlane do stredu hrudníka na dolnú polovicu hrudnej kosti a druhú dlaň na ňu. S vystretými rukami stláčajte 100–120/min do hĺbky 5–6 cm a po každom stlačení hrudník úplne uvoľnite.",
        durationMs: 10000,
      },
      {
        title: "Pokračujte podľa svojich schopností",
        body: "Ak ste vyškolení a ochotní, striedajte 30 stlačení s 2 vdychmi. Inak nepretržite stláčajte hrudník podľa operátora; zbytočne neprerušujte pomoc.",
        durationMs: 10000,
      },
      {
        title: "Riaďte sa hlasom AED",
        body: "Zapnite AED, odkryte hrudník a elektródy prilepte na holú kožu podľa obrázkov prístroja; mokrý hrudník rýchlo osušte. Počas analýzy a výboja sa človeka nikto nedotýka. Ďalej sa riaďte prístrojom a operátorom.",
        durationMs: 10000,
      },
    ],
  },
  {
    id: "bleeding",
    guideId: "first-aid",
    kind: "bleeding",
    title: "Silné vonkajšie krvácanie",
    summary:
      "Pri silnom alebo nezastaviteľnom krvácaní ihneď volajte 112/155. Základom je priamy pevný tlak, ak je bezpečný.",
    sourceUrl: "https://www.nhs.uk/conditions/first-aid/",
    sourceName: "NHS · First aid",
    sourceVerifiedOnline: false,
    warning:
      "Ilustrácia nenahrádza kurz ani pokyny operátora. Neučí použitie škrtidla, ošetrenie vnútorného krvácania alebo odstránenie zapichnutého predmetu.",
    steps: [
      {
        title: "Privolajte pomoc a chráňte sa",
        body: "Overte bezpečie a pri silnom krvácaní volajte 112/155. Ak sú poruke rukavice alebo bariéra, použite ich bez zbytočného zdržiavania.",
        durationMs: 10000,
      },
      {
        title: "Pevný tlak na ranu",
        body: "Čistou látkou alebo krytím pevne tlačte na miesto krvácania. Zapichnutý predmet nevyťahujte a netlačte naň; tlak smerujte okolo predmetu podľa operátora.",
        durationMs: 10000,
      },
      {
        title: "Tlak neprerušujte kontrolovaním",
        body: "Pokračujte v pevnom tlaku. Ak krytie presakuje, pridajte ďalšie navrch; pôvodné nestrhávajte z rany.",
        durationMs: 10000,
      },
      {
        title: "Sledujte človeka až do pomoci",
        body: "Udržujte človeka v teple, sledujte reakciu a dýchanie a riaďte sa operátorom. Pri strate reakcie a nenormálnom dýchaní na to ihneď upozornite operátora.",
        durationMs: 10000,
      },
    ],
  },
  {
    id: "burns",
    guideId: "first-aid",
    kind: "burns",
    title: "Malé tepelné popálenie",
    summary:
      "Základný postup pri malom tepelnom popálení. Veľké, hlboké, chemické alebo elektrické poranenie potrebuje odbornú pomoc.",
    sourceUrl: "https://www.nhs.uk/conditions/burns-and-scalds/treatment/",
    sourceName: "NHS · Burns and scalds",
    sourceVerifiedOnline: false,
    warning:
      "Pri popálení tváre, problémoch s dýchaním, vdýchnutí dymu alebo vážnom poranení volajte 112/155. Elektrické a chemické poranenia táto ukážka nerieši.",
    steps: [
      {
        title: "Bezpečne zastavte pôsobenie tepla",
        body: "Vzdiaľte človeka od zdroja tepla, iba ak je to bezpečné. Odstráňte blízke šperky a voľný odev; nič prilepené ku koži nestrhávajte.",
        durationMs: 10000,
      },
      {
        title: "Chlaďte tečúcou vodou",
        body: "Popálené miesto čo najskôr chlaďte chladnou až vlažnou tečúcou vodou 20 minút. Nepoužívajte ľad, maslo ani mastné krémy.",
        durationMs: 10000,
      },
      {
        title: "Voľne prekryte a udržte teplo",
        body: "Po ochladení miesto voľne prekryte čistým nepriľnavým krytím a pľuzgiere neprepichujte. Zvyšok tela udržujte v teple, najmä u detí a starších ľudí.",
        durationMs: 10000,
      },
      {
        title: "Rozpoznajte potrebu odbornej pomoci",
        body: "Popálenie väčšie než dlaň postihnutého alebo na rukách, chodidlách, genitáliách či veľkom kĺbe nech posúdi zdravotník. Hlboké poranenie, tvár, elektrina, chemikálie či vdýchnutie dymu vyžadujú urgentnú pomoc; pri ohrození volajte 112/155.",
        durationMs: 10000,
      },
    ],
  },
  {
    id: "campfire",
    guideId: "hiking",
    kind: "campfire",
    title: "Malý oheň na povolenom ohnisku",
    summary:
      "Iba vonku na povolenom určenom ohnisku. Oheň nie je vhodná voľba pri zákaze, suchu, silnom vetre alebo bez možnosti bezpečného uhasenia.",
    sourceUrl: "https://www.nps.gov/articles/campfires.htm",
    sourceName: "National Park Service · Campfire safety",
    sourceVerifiedOnline: false,
    warning:
      "Nikdy nie v stane, budove, garáži ani na rašeline. Overte miestne pravidlá a zákazy; nepoužívajte benzín, lieh ani iné urýchľovače horenia.",
    steps: [
      {
        title: "Najprv pravidlá a podmienky",
        body: "Overte povolenie miesta, aktuálny zákaz ohňa a počasie. Pri suchu, silnom vetre alebo neistote oheň nezakladajte.",
        durationMs: 10000,
      },
      {
        title: "Pripravte miesto a vodu",
        body: "Použite určené ohnisko mimo horľavých vecí a previsnutých konárov. Majte pripravenú vodu a možnosť popol premiešať; nehorľavá plocha nesmie skrývať rašelinu či korene.",
        durationMs: 10000,
      },
      {
        title: "Malé suché drevo, žiadne palivá",
        body: "Pripravte malé množstvo suchého podpaľu a drobného dreva tak, aby medzi nimi prúdil vzduch. Zapaľujte opatrne zápalkou; neprilievajte palivá ani nezväčšujte oheň nad potrebu.",
        durationMs: 10000,
      },
      {
        title: "Dohľad po celý čas",
        body: "Od ohňa neodchádzajte a držte deti, zvieratá a voľné oblečenie bezpečne mimo plameňov. Pri zmene podmienok ho uhaste; neroznášajte horiace drevo.",
        durationMs: 10000,
      },
      {
        title: "Zalejte, premiešajte, zopakujte",
        body: "Oheň zalejte vodou, premiešajte popol a znovu zalejte, kým nezostane žiadne teplo ani uhlík. Odíďte až po úplnom vychladnutí; žeravý popol nezakrývajte iba zeminou.",
        durationMs: 10000,
      },
    ],
  },
];
