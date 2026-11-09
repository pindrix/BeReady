import { academyGuides } from "./academy";
import { nutritionNote } from "./content";
import type { DiagramStep } from "./instruction-scenes";
export type ExplanationTopic =
  | "coverage"
  | "inventory"
  | "shopping"
  | "packing"
  | "plan"
  | "backup"
  | "license"
  | "scenarios"
  | "missions"
  | "shelters"
  | "profile"
  | "offline";
export type ExplanationStep = {
  title: string;
  body: string;
  scene: DiagramStep;
};
const guide = (id: string, index: number) =>
  academyGuides.find((g) => g.id === id)!.steps[index];
const row = (
  title: string,
  body: string,
  left: DiagramStep["left"],
  right: DiagramStep["right"],
  mode: DiagramStep["mode"] = "move",
): ExplanationStep => ({ title, body, scene: { left, right, mode } });
const accurate =
  "Presné množstvá a jednotky majú väčšiu hodnotu než optimistický odhad zásob.";
export const explanations: Record<
  ExplanationTopic,
  { title: string; steps: ExplanationStep[] }
> = {
  coverage: {
    title: "Cieľ zásob v dňoch",
    steps: [
      row(
        "Vaša domácnosť",
        "Najprv nastavte počet osôb a dennú potrebu vody v profile domácnosti.",
        "person",
        "plan",
        "compare",
      ),
      row(
        "Cieľ zásob v dňoch",
        "Počet osôb × denná potreba × počet dní = cieľ zásob.",
        "calculator",
        "food",
        "compare",
      ),
      row(
        "Do cieľa chýba",
        "Cieľ mínus použiteľné zásoby = chýbajúce množstvo, najmenej nula.",
        "food",
        "calendar",
        "inspect",
      ),
    ],
  },
  inventory: {
    title: "Moje zásoby",
    steps: [
      row("Nová zásoba", accurate, "food", "documents"),
      row(
        "Dátum na obale",
        "Po minimálnej trvanlivosti nemusí byť potravina nebezpečná. Skontrolujte obal, skladovanie a stav podľa pokynov výrobcu.",
        "calendar",
        "food",
        "inspect",
      ),
      row("kcal neznáme", nutritionNote, "calculator", "guidance", "inspect"),
    ],
  },
  shopping: {
    title: "Nákupný zoznam",
    steps: [
      row(
        "Do cieľa chýba",
        "Cieľ mínus použiteľné zásoby = chýbajúce množstvo, najmenej nula.",
        "calculator",
        "food",
        "compare",
      ),
      row("Množstvo nákupu", accurate, "food", "plan"),
      row(
        "Moje zásoby",
        "Návrh používa zjednodušenú šablónu, nepozná ceny a nie je nutrične kompletný. Množstvá upravte podľa obalov a potrieb domácnosti. Nákupný zoznam sa zatiaľ nezapočítava do zásob.",
        "plan",
        "documents",
        "compare",
      ),
    ],
  },
  packing: {
    title: "Batoh na prvých 72 hodín",
    steps: [
      row(guide("go-bag", 0).title, guide("go-bag", 0).body, "medicine", "bag"),
      row(guide("go-bag", 1).title, guide("go-bag", 1).body, "bottle", "bag"),
      row(
        guide("go-bag", 4).title,
        guide("go-bag", 4).body,
        "bag",
        "person",
        "compare",
      ),
    ],
  },
  plan: {
    title: "Rodina v spojení",
    steps: [
      row(
        guide("communication", 0).title,
        guide("communication", 0).body,
        "contact",
        "phone",
      ),
      row(
        guide("communication", 1).title,
        guide("communication", 1).body,
        "pin",
        "house",
        "compare",
      ),
      row(
        guide("communication", 3).title,
        guide("communication", 3).body,
        "documents",
        "plan",
        "inspect",
      ),
    ],
  },
  backup: {
    title: "Záloha domácnosti",
    steps: [
      row(
        "Moje uložené údaje",
        "BE READY funguje bez účtu. Vaše zásoby, kontakty a plán sa ukladajú iba v tomto zariadení.",
        "person",
        "storage",
      ),
      row(
        "Exportovať JSON zálohu",
        guide("digital-kit", 3).body,
        "storage",
        "documents",
      ),
      row(
        "Záloha domácnosti",
        "Záloha BE READY nie je šifrovaná. Chráňte ju ako osobné údaje.",
        "documents",
        "guidance",
        "inspect",
      ),
    ],
  },
  license: {
    title: "Ako funguje licencia",
    steps: [
      row(
        "14 dní na vyskúšanie",
        "Počas skúšobného obdobia je pri používaní funkcií potrebný internet.",
        "clock",
        "phone",
        "compare",
      ),
      row(
        "Platby ešte nie sú pripojené",
        "Nie je to doživotná licencia ani automaticky obnovované predplatné.",
        "lock",
        "calendar",
        "compare",
      ),
      row(
        "Offline až po zaplatení",
        "Po overení zaplatenej licencie zostávajú návody, výbava a údaje v zariadení. YouTube zostáva online služba.",
        "phone",
        "lock",
        "compare",
      ),
    ],
  },
  scenarios: {
    title: "Vyskúšajte pokojný nácvik",
    steps: [
      row(
        "Rozhodnite sa",
        "Rozhodovací nácvik — nie živé vyhodnotenie núdzovej udalosti.",
        "person",
        "plan",
        "inspect",
      ),
      row(
        "Jednotlivé kroky",
        "Päť situácií. Niekoľko rozhodnutí. Pokojný nácvik v bezpečných podmienkach — aj bez internetu.",
        "map",
        "guidance",
        "compare",
      ),
      row(
        "Uložiť absolvovaný nácvik",
        "Animácia vysvetľuje princíp. Vaše údaje sa tým nemenia.",
        "plan",
        "documents",
        "compare",
      ),
    ],
  },
  missions: {
    title: "Malé misie a praktické kvízy",
    steps: [
      row(
        "Jednotlivé kroky",
        "Pripravenosť nie je pretek. Vyberte si jeden malý krok na dnes.",
        "plan",
        "person",
        "compare",
      ),
      row(
        "Vyskúšajte plán nanečisto",
        guide("communication", 3).body,
        "plan",
        "phone",
        "inspect",
      ),
      row(
        "Moje uložené údaje",
        "Animácia vysvetľuje princíp. Vaše údaje sa tým nemenia.",
        "documents",
        "storage",
        "compare",
      ),
    ],
  },
  shelters: {
    title: "Bezpečné miesta / Kryty",
    steps: [
      row(
        "Overené údaje zatiaľ nie sú dostupné.",
        "BE READY neobsahuje vstavaný adresár ani mapu krytov. Informácie o dostupných miestach a aktuálnych pokynoch získajte od obce a príslušných úradov.",
        "pin",
        "guidance",
        "inspect",
      ),
      row(
        "Bezpečné miesta / Kryty",
        "GPS sa nevyžaduje. Najbližšie miesto nemusí byť najbezpečnejšie a jeho prístupnosť nie je zaručená.",
        "house",
        "guidance",
        "inspect",
      ),
    ],
  },
  profile: {
    title: "Vaša domácnosť",
    steps: [
      row(
        "Vaša domácnosť",
        guide("support-needs", 0).body,
        "person",
        "medicine",
        "compare",
      ),
      row(
        "Cieľ zásob v dňoch",
        "Počet osôb × denná potreba × počet dní = cieľ zásob.",
        "person",
        "calculator",
        "compare",
      ),
      row("Pitná voda", guide("water-storage", 0).body, "bottle", "house"),
    ],
  },
  offline: {
    title: "Pribalené v aplikácii",
    steps: [
      row(
        "Animované postupy",
        "Animácie sa nesťahujú z internetu. Offline sú dostupné s platnou licenciou.",
        "documents",
        "phone",
        "compare",
      ),
      row(
        "Offline až po zaplatení",
        "Po overení zaplatenej licencie zostávajú návody, výbava a údaje v zariadení. YouTube zostáva online služba.",
        "phone",
        "lock",
        "compare",
      ),
    ],
  },
};
