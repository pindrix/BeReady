import type { GlyphName } from "../components/tutorial-scene";
export type DiagramMode = "move" | "avoid" | "inspect" | "compare" | "shelter";
export type DiagramStep = {
  left: GlyphName;
  right: GlyphName;
  detail?: GlyphName;
  mode: DiagramMode;
};
const step = (
  left: GlyphName,
  right: GlyphName,
  mode: DiagramMode = "move",
  detail?: GlyphName,
): DiagramStep => ({ left, right, mode, detail });
/** Stage-for-stage semantic diagrams. Arrows illustrate concepts, never a safe real-world route. */
export const instructionalScenes: Record<string, DiagramStep[]> = {
  flood: [
    step("radio", "guidance", "inspect", "map"),
    step("person", "waves", "avoid", "house"),
    step("person", "house", "shelter", "waves"),
    step("bottle", "waves", "avoid", "guidance"),
  ],
  fire: [
    step("person", "door", "move"),
    step("crouch", "door", "shelter", "flame"),
    step("phone", "house", "compare", "guidance"),
    step("person", "door", "shelter", "phone"),
  ],
  alert: [
    step("radio", "guidance", "inspect"),
    step("person", "house", "shelter", "guidance"),
    step("guidance", "house", "compare", "radio"),
  ],
  chemical: [
    step("person", "chemical", "avoid"),
    step("person", "house", "shelter", "guidance"),
    step("guidance", "house", "inspect", "map"),
    step("phone", "medicine", "compare", "guidance"),
  ],
  evacuation: [
    step("guidance", "map", "inspect", "phone"),
    step("documents", "bag", "move", "person"),
    step("pet", "bag", "compare", "bottle"),
    step("guidance", "house", "inspect"),
  ],
  "safe-cooking": [
    step("food", "guidance", "inspect", "person"),
    step("hygiene", "food", "move", "jug"),
    step("food", "fridge", "inspect", "clock"),
    step("house", "generator", "avoid", "guidance"),
  ],
  "first-aid": [
    step("person", "flame", "avoid", "phone"),
    step("phone", "contact", "move", "pin"),
    step("phone", "guidance", "inspect", "medicine"),
    step("person", "person", "compare", "phone"),
  ],
  heat: [
    step("person", "sun", "avoid", "clock"),
    step("bottle", "person", "move", "medicine"),
    step("person", "contact", "compare", "sun"),
    step("phone", "person", "move", "medicine"),
  ],
  storm: [
    step("radio", "map", "inspect", "storm"),
    step("person", "house", "shelter", "storm"),
    step("radio", "guidance", "inspect", "clock"),
  ],
  winter: [
    step("shirt", "person", "move", "house"),
    step("house", "generator", "avoid", "guidance"),
    step("person", "house", "shelter", "contact"),
    step("phone", "medicine", "move", "person"),
  ],
  pets: [
    step("contact", "pet", "compare", "documents"),
    step("bottle", "pet", "move", "food"),
    step("contact", "house", "compare", "guidance"),
    step("pet", "bag", "move", "person"),
  ],
  "digital-kit": [
    step("contact", "documents", "move", "medicine"),
    step("documents", "lock", "move", "phone"),
    step("phone", "documents", "compare", "pin"),
    step("storage", "documents", "move", "calendar"),
  ],
  hiking: [
    step("map", "guidance", "inspect", "storm"),
    step("contact", "clock", "compare", "map"),
    step("bottle", "bag", "move", "map"),
    step("person", "storm", "avoid", "phone"),
  ],
  "support-needs": [
    step("person", "medicine", "compare", "plan"),
    step("contact", "contact", "compare", "phone"),
    step("battery", "guidance", "inspect", "medicine"),
    step("plan", "bag", "move", "person"),
  ],
};
