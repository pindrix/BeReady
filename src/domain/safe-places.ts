import type { SafePlace } from "../types/model";
export function safePlacesView(places: SafePlace[]) {
  return {
    empty: places.length === 0,
    places: places.map((place) => ({
      ...place,
      label:
        "Údaj z importovanej zálohy — READY negarantuje aktuálnosť ani prístupnosť.",
    })),
  };
}
