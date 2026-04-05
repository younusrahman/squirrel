import { useLayoutEffect, useRef, createElement, ReactNode } from "react";

// --- 1. TYPE SYSTEM ---

type ExtractState<T> = T extends () => SquirrelStoreInstance<infer S>
  ? S
  : never;

type CombinedRawValueState<T> = {
  [K in keyof T]: ExtractState<T[K]>;
};

type NodeValueProxy<T> = {
  readonly [K in keyof T]: ReactNode;
} & ((transform: (state: T) => ReactNode) => ReactNode);

type CombinedNodeValueProxy<T> = {
  readonly [K in keyof T]: NodeValueProxy<ExtractState<T[K]>>;
} & ((transform: (state: CombinedRawValueState<T>) => ReactNode) => ReactNode);

export interface SquirrelStoreInstance<T> {
  get: () => { nodeValue: NodeValueProxy<T>; rawValue: Readonly<T> };
  set: (next: Partial<T> | ((prev: T) => Partial<T>)) => void;
  setAsync: (next: Partial<T> | ((prev: T) => Partial<T>)) => void;
}

export interface CombinedSquirrelInstance<T> {
  get: () => {
    nodeValue: CombinedNodeValueProxy<T>;
    rawValue: CombinedRawValueState<T>;
  };
  set: (patches: { [K in keyof T]?: Partial<ExtractState<T[K]>> }) => void;
  setAsync: (patches: { [K in keyof T]?: Partial<ExtractState<T[K]>> }) => void;
}

type UpdateFn = (latestState: any) => void;

// --- 2. INTERNAL ENGINE ---

function InternalSquirrelEngine<T extends object>(
  initialState: T,
): () => SquirrelStoreInstance<T> {
  let state: T = { ...initialState };
  let pendingPatches: Partial<T> = {};
  let isBatching = false;
  const subscribers = new Map<keyof T, Set<UpdateFn>>();

  const notify = (key: keyof T) => {
    subscribers.get(key)?.forEach((update) => update(state));
  };

  /** Direct-DOM injection component */
  const SquirrelLeaf = ({
    transform,
    propsToWatch,
  }: {
    transform: (s: T) => ReactNode;
    propsToWatch?: (keyof T)[];
  }) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    useLayoutEffect(() => {
      const el = spanRef.current;
      if (!el) return;
      const updateNodeValue = (latest: T) => {
        el.textContent = String(transform(latest));
      };
      updateNodeValue(state);
      const keys = propsToWatch || (Object.keys(state) as (keyof T)[]);
      keys.forEach((k) => {
        if (!subscribers.has(k)) subscribers.set(k, new Set());
        subscribers.get(k)!.add(updateNodeValue);
      });
      return () => {
        keys.forEach((k) => subscribers.get(k)?.delete(updateNodeValue));
      };
    }, [transform, propsToWatch]);
    return createElement("span", { ref: spanRef });
  };

  const createNodeValueProxy = (): NodeValueProxy<T> => {
    const baseFn = (transform: (s: T) => ReactNode) =>
      createElement(SquirrelLeaf, { transform });
    return new Proxy(baseFn, {
      get: (target, prop: string) => {
        if (prop in target) return (target as any)[prop];
        return createElement(SquirrelLeaf, {
          transform: (s: any) => s[prop],
          propsToWatch: [prop as keyof T],
        });
      },
    }) as any;
  };

  const instance = {
    get: () => ({ nodeValue: createNodeValueProxy(), rawValue: state as Readonly<T> }),
    set: (next: any) => {
      const patches = typeof next === "function" ? next(state) : next;
      state = { ...state, ...patches };
      Object.keys(patches).forEach((k) => notify(k as keyof T));
    },
    setAsync: (next: any) => {
      const patches = typeof next === "function" ? next(state) : next;
      state = { ...state, ...patches };
      pendingPatches = { ...pendingPatches, ...patches };
      if (!isBatching) {
        isBatching = true;
        queueMicrotask(() => {
          const final = { ...pendingPatches };
          pendingPatches = {};
          isBatching = false;
          Object.keys(final).forEach((k) => notify(k as keyof T));
        });
      }
    },
  };

  return () => instance;
}

// --- 3. PUBLIC API ---

export function CreateSquirrelStore<T extends object>(
  initialState: T,
): () => SquirrelStoreInstance<T> {
  let _lazy: (() => SquirrelStoreInstance<T>) | null = null;
  return () => {
    if (!_lazy) _lazy = InternalSquirrelEngine<T>(initialState);
    return _lazy();
  };
}

export function CombineSquirrelStore<
  T extends Record<string, () => SquirrelStoreInstance<any>>,
>(getStores: () => T): () => CombinedSquirrelInstance<T> {
  let _combined: CombinedSquirrelInstance<T> | null = null;
  let _resolved: T;

  return function () {
    if (!_combined) {
      _resolved = getStores();

      const getrawValueState = () => {
        const res: any = {};
        for (const k in _resolved) res[k] = _resolved[k]().get().rawValue;
        return res;
      };

      /** Combined Leaf: Watches every property in every sub-store */
      const CombinedLeaf = ({
        transform,
      }: {
        transform: (s: any) => ReactNode;
      }) => {
        const spanRef = useRef<HTMLSpanElement>(null);
        useLayoutEffect(() => {
          const el = spanRef.current;
          if (!el) return;
          const update = () => {
            el.textContent = String(transform(getrawValueState()));
          };
          update();
          const cleanupFns: (() => void)[] = [];
          for (const k in _resolved) {
            const subStore = _resolved[k]();
            const keys = Object.keys(subStore.get().rawValue);
            // We use the sub-store's set to register a hidden listener
            subStore.set((prev: any) => {
              queueMicrotask(update);
              return prev;
            });
          }
          return () => cleanupFns.forEach((f) => f());
        }, [transform]);
        return createElement("span", { ref: spanRef });
      };

      const createCombinedProxy = (): CombinedNodeValueProxy<T> => {
        const baseFn = (transform: (s: any) => ReactNode) =>
          createElement(CombinedLeaf, { transform });
        return new Proxy(baseFn, {
          get: (target, prop: string) => {
            if (prop in target) return (target as any)[prop];
            return _resolved[prop]?.().get().nodeValue;
          },
        }) as any;
      };

      _combined = {
        get: () => ({
          nodeValue: createCombinedProxy(),
          rawValue: getrawValueState(),
        }),
        set: (p) => {
          for (const k in p) if (_resolved[k]) _resolved[k]().set(p[k] as any);
        },
        setAsync: (p) => {
          for (const k in p)
            if (_resolved[k]) _resolved[k]().setAsync(p[k] as any);
        },
      };
    }
    return _combined;
  };
}
