/** Screenshot fixture, not the production app entrypoint or a native-runtime test. */
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./mocks/state";
import Home from "../../src/app/(tabs)/index";
import Academy from "../../src/app/(tabs)/help";
import Missions from "../../src/app/missions";
const screen =
  new URLSearchParams(window.location.search).get("screen") ?? "home";
const Screen =
  screen === "academy" ? Academy : screen === "missions" ? Missions : Home;
createRoot(document.getElementById("root")!).render(
  <StoreProvider>
    <Screen />
  </StoreProvider>,
);
