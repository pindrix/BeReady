import { useEffect } from "react";
type Destination =
  string | { pathname: string; params?: Record<string, string> };
export const router = {
  canGoBack: () => true,
  replace: () => {},
  push: (destination: Destination) => {
    const path =
      typeof destination === "string" ? destination : destination.pathname;
    const known: Record<string, string> = {
      "/": "home",
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
export function useLocalSearchParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

export function useFocusEffect(effect: () => void | (() => void)) {
  useEffect(effect, [effect]);
}
