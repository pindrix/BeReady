/** Local posters captured from the actual WebGL renderer; closed cards start no GPU context. */
const posters: Record<string, Record<"aurora" | "atlas", number>> = {
  coverage: {
    aurora: require("../../assets/images/simulations/coverage-aurora.webp"),
    atlas: require("../../assets/images/simulations/coverage-atlas.webp"),
  },
  inventory: {
    aurora: require("../../assets/images/simulations/inventory-aurora.webp"),
    atlas: require("../../assets/images/simulations/inventory-atlas.webp"),
  },
  shopping: {
    aurora: require("../../assets/images/simulations/shopping-aurora.webp"),
    atlas: require("../../assets/images/simulations/shopping-atlas.webp"),
  },
  packing: {
    aurora: require("../../assets/images/simulations/packing-aurora.webp"),
    atlas: require("../../assets/images/simulations/packing-atlas.webp"),
  },
  plan: {
    aurora: require("../../assets/images/simulations/plan-aurora.webp"),
    atlas: require("../../assets/images/simulations/plan-atlas.webp"),
  },
  backup: {
    aurora: require("../../assets/images/simulations/backup-aurora.webp"),
    atlas: require("../../assets/images/simulations/backup-atlas.webp"),
  },
  license: {
    aurora: require("../../assets/images/simulations/license-aurora.webp"),
    atlas: require("../../assets/images/simulations/license-atlas.webp"),
  },
  scenarios: {
    aurora: require("../../assets/images/simulations/scenarios-aurora.webp"),
    atlas: require("../../assets/images/simulations/scenarios-atlas.webp"),
  },
  missions: {
    aurora: require("../../assets/images/simulations/missions-aurora.webp"),
    atlas: require("../../assets/images/simulations/missions-atlas.webp"),
  },
  shelters: {
    aurora: require("../../assets/images/simulations/shelters-aurora.webp"),
    atlas: require("../../assets/images/simulations/shelters-atlas.webp"),
  },
  profile: {
    aurora: require("../../assets/images/simulations/profile-aurora.webp"),
    atlas: require("../../assets/images/simulations/profile-atlas.webp"),
  },
  offline: {
    aurora: require("../../assets/images/simulations/offline-aurora.webp"),
    atlas: require("../../assets/images/simulations/offline-atlas.webp"),
  },
};
export function simulationPoster(id: string, appearance: "aurora" | "atlas") {
  return posters[id.replace(/^explanation-/, "")]?.[appearance];
}
