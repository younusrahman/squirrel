import { useLayoutEffect, useRef, createElement, ReactNode } from "react";

// 1. The Master Interface: This is what ensures get().Ui.name is type-safe
export interface SquirrelStoreInstance<T> {
  get: {
    (): { Ui: { [K in keyof T]: ReactNode }; raw: Readonly<T> };
    <K extends keyof T>(key: K, transform: (val: T[K]) => ReactNode): ReactNode;
  };
  set: (next: Partial<T> | ((prev: T) => Partial<T>)) => void;
  setAsync: (next: Partial<T> | ((prev: T) => Partial<T>)) => void;
}

type UpdateFn<V> = (newVal: V) => void;

function InternalSquirrelEngine<T extends object>(
  initialState: T,
): () => SquirrelStoreInstance<T> {
  let state: T = { ...initialState };
  let pendingPatches: Partial<T> = {};
  let isBatching = false;
  const subscribers = new Map<keyof T, Set<UpdateFn<any>>>();

  const notify = <K extends keyof T>(key: K, value: T[K]) => {
    const followers = subscribers.get(key);
    if (followers) followers.forEach((update) => update(value));
  };

  const SquirrelLeaf = ({
    prop,
    transform,
  }: {
    prop: keyof T;
    transform?: (v: any) => ReactNode;
  }) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    useLayoutEffect(() => {
      const element = spanRef.current;
      if (!element) return;
      const updateDom: UpdateFn<any> = (newVal) => {
        const result = transform ? transform(newVal) : newVal;
        element.textContent = String(result);
      };
      updateDom(state[prop]);
      if (!subscribers.has(prop)) subscribers.set(prop, new Set());
      subscribers.get(prop)!.add(updateDom);
      return () => {
        subscribers.get(prop)?.delete(updateDom);
      };
    }, [prop, transform]);
    return createElement("span", { ref: spanRef });
  };

  return function useSquirrel(): SquirrelStoreInstance<T> {
    return {
      get: function <K extends keyof T>(
        key?: K,
        transform?: (v: T[K]) => ReactNode,
      ): any {
        if (key !== undefined && transform !== undefined) {
          return createElement(SquirrelLeaf, {
            prop: key,
            transform: transform as any,
          });
        }
        return {
          Ui: new Proxy({} as any, {
            get: (_, prop: string) =>
              createElement(SquirrelLeaf, { prop: prop as keyof T }),
          }),
          raw: state,
        };
      },
      set: (next) => {
        const patches =
          typeof next === "function" ? (next as any)(state) : next;
        state = { ...state, ...patches };
        Object.keys(patches).forEach((k) =>
          notify(k as keyof T, state[k as keyof T]),
        );
      },
      setAsync: (next) => {
        const patches =
          typeof next === "function" ? (next as any)(state) : next;
        state = { ...state, ...patches };
        pendingPatches = { ...pendingPatches, ...patches };
        if (!isBatching) {
          isBatching = true;
          queueMicrotask(() => {
            const final = { ...pendingPatches };
            pendingPatches = {};
            isBatching = false;
            Object.keys(final).forEach((k) =>
              notify(k as keyof T, state[k as keyof T]),
            );
          });
        }
      },
    };
  };
}

export function CreateSquirrelStore<T extends object>(
  initialState: T,
): () => SquirrelStoreInstance<T> {
  let _instance: (() => SquirrelStoreInstance<T>) | null = null;
  return function (): SquirrelStoreInstance<T> {
    if (!_instance) {
      _instance = InternalSquirrelEngine<T>(initialState);
    }
    return _instance();
  };
}
