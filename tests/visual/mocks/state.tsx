/** Development-only fixture. Never imported by production routes or native builds. */
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  defaultHousehold,
  type State,
  type EntityKey,
  type Entities,
  type Household,
} from "../../../src/types/model";
import { initialChecklists } from "../../../src/data/content";
import { missionRecord } from "../../../src/domain/missions";
import { missions } from "../../../src/data/missions";
const fixture: State = {
  household: {
    ...defaultHousehold,
    name: "Naša domácnosť",
    people: 2,
    goal: 7,
    meeting: "Dohodnuté miesto",
  },
  inventory: [
    {
      id: "fixture-rice",
      name: "Ryža",
      category: "jedlo",
      quantity: 2,
      unit: "kg",
      kcal: 3500,
      expiry: null,
      expiryType: "trvanlivosť",
      purchased: null,
      note: "",
    },
    {
      id: "fixture-oats",
      name: "Ovsené vločky",
      category: "jedlo",
      quantity: 1,
      unit: "kg",
      kcal: 3700,
      expiry: null,
      expiryType: "trvanlivosť",
      purchased: null,
      note: "",
    },
    {
      id: "fixture-water",
      name: "Pitná voda",
      category: "voda",
      quantity: 15.2,
      unit: "l",
      kcal: null,
      expiry: null,
      expiryType: "spotreba",
      purchased: null,
      note: "",
    },
  ],
  shopping: [],
  contacts: [],
  safePlaces: [],
  checklists: [
    ...initialChecklists.map((x, i) => ({ ...x, done: i < 3 })),
    missionRecord(missions[0], true),
    missionRecord(missions[1], true),
  ],
};
type Value = {
  data: State;
  error: string;
  busy: boolean;
  save: <K extends EntityKey>(key: K, item: Entities[K]) => Promise<void>;
  profile: (p: Household) => Promise<void>;
  remove: (key: EntityKey, id: string) => Promise<void>;
  reload: () => Promise<void>;
  restore: (s: State) => Promise<void>;
  addShopping: () => Promise<void>;
  clearError: () => void;
};
const Context = createContext<Value | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(fixture);
  return (
    <Context.Provider
      value={{
        data,
        error: "",
        busy: false,
        save: async (key, item) =>
          setData((s) => ({
            ...s,
            [key]: [...s[key].filter((x) => x.id !== item.id), item],
          })),
        profile: async (household) => setData((s) => ({ ...s, household })),
        remove: async (key, id) =>
          setData((s) => ({ ...s, [key]: s[key].filter((x) => x.id !== id) })),
        reload: async () => {},
        restore: async (s) => setData(s),
        addShopping: async () => {},
        clearError: () => {},
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("Visual fixture provider required");
  return value;
}
