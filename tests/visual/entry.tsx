import SimulationFixture from "./simulation";
import { AppearancePicker } from "../../src/components/appearance-picker";
import { setAppearance } from "../../src/state/appearance";
import Inventory from "../../src/app/(tabs)/inventory";
import Plan from "../../src/app/(tabs)/plan";
import { ExplanationCard } from "../../src/components/explanation";
import {
  explanations,
  type ExplanationTopic,
} from "../../src/data/explanations";
import { Screen as Frame } from "../../src/components/ui";
import Guide from "../../src/app/guide";
import Now from "../../src/app/now";
import { Welcome } from "../../src/components/welcome";
import { setCountryCode } from "../../src/state/region";
/** Screenshot fixture, not the production app entrypoint or a native-runtime test. */
import Animations from "../../src/app/animations";
import { setLocale } from "../../src/i18n";
import { isLocale } from "../../src/i18n/locales";
import FieldKit from "../../src/app/field-kit";
import Scenarios from "../../src/app/scenarios";
import Plus from "../../src/app/plus";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./mocks/state";
import Home from "../../src/app/(tabs)/index";
import Academy from "../../src/app/(tabs)/help";
import Missions from "../../src/app/missions";
const params = new URLSearchParams(window.location.search),
  name = params.get("screen") ?? "home",
  locale = params.get("locale") ?? "sk";
function ExplanationPreview() {
  const topic = params.get("topic") ?? "coverage";
  return (
    <Frame title="BE READY">
      <ExplanationCard
        topic={(topic in explanations ? topic : "coverage") as ExplanationTopic}
      />
    </Frame>
  );
}
function AppearancePreview() {
  return (
    <Frame title="BE READY">
      <AppearancePicker />
    </Frame>
  );
}
const screens = {
  simulation: SimulationFixture,
  appearance: AppearancePreview,
  inventory: Inventory,
  plan: Plan,
  home: Home,
  explain: ExplanationPreview,
  academy: Academy,
  missions: Missions,
  kit: FieldKit,
  scenarios: Scenarios,
  plus: Plus,
  animations: Animations,
  guide: Guide,
  welcome: Welcome,
  now: Now,
};
const Screen = screens[name as keyof typeof screens] ?? Home;
async function start() {
  await setAppearance(
    params.get("appearance") === "atlas" ? "atlas" : "aurora",
  );
  await setCountryCode(params.get("country") ?? "SK");
  if (isLocale(locale)) await setLocale(locale);
  createRoot(document.getElementById("root")!).render(
    <StoreProvider>
      <Screen />
    </StoreProvider>,
  );
}
void start();
