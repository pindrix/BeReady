import { useEffect, useSyncExternalStore } from "react";
type Destination =
  string | { pathname: string; params?: Record<string, string> };
export const router = {
  setParams: (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) params.delete(key);
      else params.set(key, value);
    }
    window.history.replaceState(null, "", "?" + params);
    window.dispatchEvent(new Event("fixture-route-params"));
  },
  canGoBack: () => true,
  replace: () => {},
  push: (destination: Destination) => {
    const path =
      typeof destination === "string" ? destination : destination.pathname;
    const known: Record<string, string> = {
      "/": "home",
      "/inventory": "inventory",
      "/plan": "plan",
      "/settings": "appearance",
      "/help": "academy",
      "/missions": "missions",
      "/animations": "animations",
    };
    if (known[path]) {
      const params = new URLSearchParams(window.location.search);
      params.set("screen", known[path]);
      params.delete("id");
      if (typeof destination !== "string")
        for (const [key, value] of Object.entries(destination.params ?? {}))
          params.set(key, value);
      window.location.search = params.toString();
    } else document.documentElement.dataset.fixtureNavigation = path;
  },
  back: () => window.history.back(),
};
const subscribeQuery = (listener: () => void) => {
  window.addEventListener("fixture-route-params", listener);
  return () => window.removeEventListener("fixture-route-params", listener);
};
export function useLocalSearchParams() {
  const search = useSyncExternalStore(
    subscribeQuery,
    () => window.location.search,
  );
  return Object.fromEntries(new URLSearchParams(search));
}

export function useFocusEffect(effect: () => void | (() => void)) {
  useEffect(effect, [effect]);
}
