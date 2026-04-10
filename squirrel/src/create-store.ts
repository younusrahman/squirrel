import { useSyncExternalStore, ReactNode, useState, useLayoutEffect, createElement } from "react";
import { Fragment } from "react/jsx-runtime";
import { SquirrelStoreInstance, UpdateFn, NodeValueProxy, RawValueAccess } from "./types";
import { processOutput } from "./utils";

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

export function CreateSquirrelStore<T extends object>(
  initialState: T,
): SquirrelStoreInstance<T> {
  return InternalSquirrelEngine<T>(initialState);
}
