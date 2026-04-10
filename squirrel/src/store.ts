import {
  useLayoutEffect,
  useState,
  createElement,
  Fragment,
  isValidElement,
  cloneElement,
  Children,
  type ReactNode,
  useSyncExternalStore,
} from "react";

// --- 1. TYPE SYSTEM ---
type ExtractState<T> = T extends SquirrelStoreInstance<infer S> ? S : never;

type CombinedRawValueState<T> = { [K in keyof T]: ExtractState<T[K]> };

type NodeValueProxy<T> = {
  readonly [K in keyof T]: ReactNode;
} & ((transform: (state: T) => ReactNode) => ReactNode);

type RawValueAccess<T> = {
  readonly static: Readonly<T>;
  readonly reactive: Readonly<T>;
};

type CombinedNodeValueProxy<T> = {
  readonly [K in keyof T]: NodeValueProxy<ExtractState<T[K]>>;
} & ((transform: (state: CombinedRawValueState<T>) => ReactNode) => ReactNode);

type CombinedRawValueAccess<T> = {
  readonly static: CombinedRawValueState<T>;
  readonly reactive: CombinedRawValueState<T>;
};

export interface SquirrelStoreInstance<T> {
  readonly nodeValue: NodeValueProxy<T>;
  readonly rawValue: RawValueAccess<T>;
  set: (next: Partial<T> | ((prev: T) => Partial<T>)) => void;
  setAsync: (next: Partial<T> | ((prev: T) => Partial<T>)) => void;
  __subscribeAll?: (callback: () => void) => () => void;
}

export interface CombinedSquirrelInstance<T> {
  readonly nodeValue: CombinedNodeValueProxy<T>;
  readonly rawValue: CombinedRawValueAccess<T>;
  set: (patches: { [K in keyof T]?: Partial<ExtractState<T[K]>> }) => void;
  setAsync: (patches: { [K in keyof T]?: Partial<ExtractState<T[K]>> }) => void;
}

type UpdateFn = (latestState: any) => void;
type StoreMap = Record<string, SquirrelStoreInstance<any>>;

// --- 2. UTILS ---

function processOutput(node: ReactNode): ReactNode {
  if (Array.isArray(node)) {
    return Children.map(node, (child, index) => {
      if (isValidElement(child) && child.key === null) {
        return cloneElement(child, { key: `sq-${index}` } as any);
      }
      return child;
    });
  }
  return node;
}

// --- 3. INTERNAL ENGINE ---

function InternalSquirrelEngine<T extends object>(
  initialState: T,
): SquirrelStoreInstance<T> {
  let state: T = { ...initialState };
  let pendingPatches: Partial<T> = {};
  let isBatching = false;

  const subscribers = new Map<keyof T, Set<UpdateFn>>();
  const globalSubscribers = new Set<() => void>();

  const getSnapshot = (): Readonly<T> => state;
  const getServerSnapshot = (): Readonly<T> => state;

  const subscribeAll = (callback: () => void): (() => void) => {
    globalSubscribers.add(callback);
    return () => {
      globalSubscribers.delete(callback);
    };
  };

  const notify = (key: keyof T) => {
    subscribers.get(key)?.forEach((update) => update(state));
  };

  const notifyAll = () => {
    globalSubscribers.forEach((fn) => fn());
  };

  const useReactiveRaw = (): Readonly<T> =>
    useSyncExternalStore(subscribeAll, getSnapshot, getServerSnapshot);

  const SquirrelLeaf = ({
    transform,
    manualKeys,
  }: {
    transform: (s: T) => ReactNode;
    manualKeys?: (keyof T)[];
  }) => {
    const [view, setView] = useState<ReactNode>(null);

    useLayoutEffect(() => {
      const touchedKeys = new Set<keyof T>(manualKeys ?? []);

      const tracker = new Proxy(state, {
        get(target, prop) {
          touchedKeys.add(prop as keyof T);
          return (target as any)[prop];
        },
      });

      const updateView = (latest: T) => {
        setView(processOutput(transform(latest)));
      };

      updateView(tracker as T);

      touchedKeys.forEach((k) => {
        if (!subscribers.has(k)) subscribers.set(k, new Set());
        subscribers.get(k)!.add(updateView);
      });

      return () => {
        touchedKeys.forEach((k) => subscribers.get(k)?.delete(updateView));
      };
    }, [transform, manualKeys]);

    return createElement(Fragment, null, view);
  };

  const createNodeValueProxy = (): NodeValueProxy<T> => {
    const baseFn = (transform: (s: T) => ReactNode) =>
      createElement(SquirrelLeaf, { transform });

    return new Proxy(baseFn, {
      get: (target, prop: string) => {
        if (prop in target) return (target as any)[prop];
        return createElement(SquirrelLeaf, {
          transform: (s: any) => s[prop],
          manualKeys: [prop as keyof T],
        });
      },
    }) as any;
  };

  const createRawValueAccess = (): RawValueAccess<T> => ({
    get static() {
      return state as Readonly<T>;
    },
    get reactive() {
      return useReactiveRaw();
    },
  });

  const instance = {
    get nodeValue() {
      return createNodeValueProxy();
    },

    get rawValue() {
      return createRawValueAccess();
    },

    set: (next: Partial<T> | ((prev: T) => Partial<T>)) => {
      const patches = typeof next === "function" ? next(state) : next;
      if (!patches || typeof patches !== "object") return;

      state = { ...state, ...patches };
      Object.keys(patches).forEach((k) => notify(k as keyof T));
      notifyAll();
    },

    setAsync: (next: Partial<T> | ((prev: T) => Partial<T>)) => {
      const patches = typeof next === "function" ? next(state) : next;
      if (!patches || typeof patches !== "object") return;

      state = { ...state, ...patches };
      pendingPatches = { ...pendingPatches, ...patches };

      if (!isBatching) {
        isBatching = true;
        queueMicrotask(() => {
          const final = { ...pendingPatches };
          pendingPatches = {};
          isBatching = false;

          Object.keys(final).forEach((k) => notify(k as keyof T));
          notifyAll();
        });
      }
    },

    __subscribeAll: subscribeAll,
  } satisfies SquirrelStoreInstance<T>;

  return instance;
}

// --- 4. PUBLIC API ---

export function CreateSquirrelStore<T extends object>(
  initialState: T,
): SquirrelStoreInstance<T> {
  return InternalSquirrelEngine<T>(initialState);
}

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
