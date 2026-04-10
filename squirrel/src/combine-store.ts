import {
  createElement,
  Fragment,
  type ReactNode,
  useSyncExternalStore,
} from "react";
import {
  CombinedNodeValueProxy,
  CombinedRawValueAccess,
  CombinedRawValueState,
  CombinedSquirrelInstance,
  ExtractState,
  StoreMap,
} from "./types";
import { processOutput } from "./utils";

export function CombineSquirrelStore<T extends StoreMap>(
  storesOrFactory: T | (() => T),
): CombinedSquirrelInstance<T> {
  let resolvedStores: T | null = null;

  let cachedSnapshot: CombinedRawValueState<T> | null = null;

  const resolveStores = (): T => {
    if (!resolvedStores) {
      resolvedStores =
        typeof storesOrFactory === "function"
          ? (storesOrFactory as () => T)()
          : storesOrFactory;
    }
    return resolvedStores;
  };

  const buildSnapshot = (): CombinedRawValueState<T> => {
    const stores = resolveStores();
    const res: any = {};
    for (const k in stores) {
      res[k] = stores[k].rawValue.static;
    }
    return res;
  };

  // ✅ FIX: Return cached snapshot (stable reference)
  const getSnapshot = (): CombinedRawValueState<T> => {
    if (cachedSnapshot === null) {
      cachedSnapshot = buildSnapshot();
    }
    return cachedSnapshot;
  };

  const getServerSnapshot = (): CombinedRawValueState<T> => {
    return getSnapshot();
  };

  const subscribeCombined = (callback: () => void): (() => void) => {
    const stores = resolveStores();
    const cleanups: Array<() => void> = [];

    for (const k in stores) {
      const unsub = stores[k].__subscribeAll?.(() => {
        // Invalidate and rebuild cache BEFORE notifying React
        cachedSnapshot = buildSnapshot();
        callback();
      });
      if (unsub) cleanups.push(unsub);
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  };

  const useReactiveCombinedRaw = (): CombinedRawValueState<T> =>
    useSyncExternalStore(subscribeCombined, getSnapshot, getServerSnapshot);

  const CombinedLeaf = ({
    transform,
  }: {
    transform: (s: CombinedRawValueState<T>) => ReactNode;
  }) => {
    const snapshot = useReactiveCombinedRaw();
    return createElement(Fragment, null, processOutput(transform(snapshot)));
  };

  const createCombinedNodeValueProxy = (): CombinedNodeValueProxy<T> => {
    const baseFn = (transform: (s: CombinedRawValueState<T>) => ReactNode) =>
      createElement(CombinedLeaf, { transform });

    return new Proxy(baseFn, {
      get: (target, prop: string) => {
        if (prop in target) return (target as any)[prop];
        return resolveStores()[prop as keyof T]?.nodeValue;
      },
    }) as any;
  };

  const createCombinedRawValueAccess = (): CombinedRawValueAccess<T> => ({
    get static() {
      return getSnapshot(); // ✅ Use cached snapshot
    },
    get reactive() {
      return useReactiveCombinedRaw();
    },
  });

  const instance = {
    get nodeValue() {
      return createCombinedNodeValueProxy();
    },

    get rawValue() {
      return createCombinedRawValueAccess();
    },

    set: (patches: { [K in keyof T]?: Partial<ExtractState<T[K]>> }) => {
      const stores = resolveStores();

      for (const k in patches) {
        if (stores[k] && patches[k] != null) {
          stores[k].set(patches[k] as any);
        }
      }
    },

    setAsync: (patches: { [K in keyof T]?: Partial<ExtractState<T[K]>> }) => {
      const stores = resolveStores();

      for (const k in patches) {
        if (stores[k] && patches[k] != null) {
          stores[k].setAsync(patches[k] as any);
        }
      }
    },
  } satisfies CombinedSquirrelInstance<T>;

  return instance;
}
