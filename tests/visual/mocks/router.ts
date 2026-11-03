type Destination =
  string | { pathname: string; params?: Record<string, string> };
export const router = {
  push: (destination: Destination) => {
    const path =
      typeof destination === "string" ? destination : destination.pathname;
    const known: Record<string, string> = {
      "/": "home",
      "/help": "academy",
      "/missions": "missions",
    };
    if (known[path]) window.location.search = `?screen=${known[path]}`;
    else document.documentElement.dataset.fixtureNavigation = path;
  },
  back: () => window.history.back(),
};
export function useLocalSearchParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}
