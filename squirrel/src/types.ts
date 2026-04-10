import { type ReactNode } from "react";

export type ExtractState<T> =
  T extends SquirrelStoreInstance<infer S> ? S : never;

export type CombinedRawValueState<T> = { [K in keyof T]: ExtractState<T[K]> };

export type NodeValueProxy<T> = {
  readonly [K in keyof T]: ReactNode;
} & ((transform: (state: T) => ReactNode) => ReactNode);

export type RawValueAccess<T> = {
  readonly static: Readonly<T>;
  readonly reactive: Readonly<T>;
};

export type CombinedNodeValueProxy<T> = {
  readonly [K in keyof T]: NodeValueProxy<ExtractState<T[K]>>;
} & ((transform: (state: CombinedRawValueState<T>) => ReactNode) => ReactNode);

export type CombinedRawValueAccess<T> = {
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

export type UpdateFn = (latestState: any) => void;
export type StoreMap = Record<string, SquirrelStoreInstance<any>>;
