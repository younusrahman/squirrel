import { ReactNode } from "react";
import { SquirrelStoreInstance } from "./store";

/** 1. Helper to extract the State T from our Singleton Functions */
type StoreGetter<T extends object> = () => SquirrelStoreInstance<T>;
type StateOfGetter<G> = G extends StoreGetter<infer S> ? S : never;

/** 2. The Combined Store Interface */
interface CombinedStore<M extends Record<string, StoreGetter<any>>> {
  get: () => {
    raw: { readonly [K in keyof M]: Readonly<StateOfGetter<M[K]>> };
    Ui: { [K in keyof M]: { [P in keyof StateOfGetter<M[K]>]: ReactNode } };
  };
  set: (patches: { [K in keyof M]?: Partial<StateOfGetter<M[K]>> }) => void;
  setAsync: (patches: {
    [K in keyof M]?: Partial<StateOfGetter<M[K]>>;
  }) => void;
}

export function CombineSquirrelStore<
  M extends Record<string, StoreGetter<any>>,
>(stores: M): () => CombinedStore<M> {
  // We return a "Master Lazy Singleton"
  let _masterInstance: CombinedStore<M> | null = null;

  return function useCombined(): CombinedStore<M> {
    if (!_masterInstance) {
      const keys = Object.keys(stores) as Array<keyof M>;

      // Initialize sub-store instances
      const instances = keys.reduce(
        (acc, key) => {
          acc[key] = stores[key]();
          return acc;
        },
        {} as { [K in keyof M]: SquirrelStoreInstance<StateOfGetter<M[K]>> },
      );

      _masterInstance = {
        get: () => ({
          raw: new Proxy({} as any, {
            get: (_, key: string) => instances[key as keyof M]?.get().raw,
          }),
          Ui: new Proxy({} as any, {
            get: (_, key: string) => instances[key as keyof M]?.get().Ui,
          }),
        }),
        set: (patches) => {
          (Object.keys(patches) as Array<keyof M>).forEach((key) => {
            const patch = patches[key];
            if (patch) instances[key].set(patch);
          });
        },
        setAsync: (patches) => {
          (Object.keys(patches) as Array<keyof M>).forEach((key) => {
            const patch = patches[key];
            if (patch) instances[key].setAsync(patch);
          });
        },
      };
    }
    return _masterInstance;
  };
}
