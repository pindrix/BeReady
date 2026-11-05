/** Screenshot fixture, not the production app entrypoint or a native-runtime test. */
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
const screens = {
  home: Home,
  academy: Academy,
  missions: Missions,
  kit: FieldKit,
  scenarios: Scenarios,
  plus: Plus,
};
const Screen = screens[name as keyof typeof screens] ?? Home;
async function start() {
  if (isLocale(locale)) await setLocale(locale);
  createRoot(document.getElementById("root")!).render(
    <StoreProvider>
      <Screen />
    </StoreProvider>,
  );
}
void start();
