import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useSQLiteContext } from "expo-sqlite";
import { AppState } from "react-native";
import {
  readState,
  saveHousehold,
  saveEntity,
  deleteEntity,
  replaceState,
  addShopping,
} from "../db/repository";
import type {
  State,
  Household,
  EntityKey,
  Entities,
  Shopping,
} from "../types/model";
import { errorMessage } from "../types/model";
import { useEffect, useRef } from "react";

type Store = {
  data: State | null;
  error: string;
  busy: boolean;
  reload: () => Promise<void>;
  profile: (v: Household) => Promise<void>;
  save: <K extends EntityKey>(key: K, v: Entities[K]) => Promise<void>;
  remove: (key: EntityKey, id: string) => Promise<void>;
  restore: (state: State) => Promise<void>;
  addShopping: (items: Shopping[]) => Promise<void>;
  clearError: () => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext(),
    lock = useRef(false);
  const [data, setData] = useState<State | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const reload = useCallback(async () => {
    try {
      setData(await readState(db));
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [db]);
  useEffect(() => {
    let active = true;
    void readState(db)
      .then((result) => {
        if (active) {
          setData(result);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void reload();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [db, reload]);
  async function write(action: () => Promise<void>) {
    if (lock.current)
      throw new Error("Počkajte na uloženie predchádzajúcej zmeny.");
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      setData(await readState(db));
    } catch (e) {
      setError(errorMessage(e));
      throw e;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Context.Provider
      value={{
        data,
        error,
        busy,
        reload,
        clearError: () => setError(""),
        profile: (v) => write(() => saveHousehold(db, v)),
        save: (key, v) => write(() => saveEntity(db, key, v)),
        remove: (key, id) => write(() => deleteEntity(db, key, id)),
        restore: (v) => write(() => replaceState(db, v)),
        addShopping: (items) => write(() => addShopping(db, items)),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const v = useContext(Context);
  if (!v) throw new Error("Chýba databázový kontext.");
  return v;
}
