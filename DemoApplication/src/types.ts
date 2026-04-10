// ============================================================================
// STATE TYPES
// ============================================================================

import type { SquirrelStoreInstance } from "squirrel/src/types";

// ============================================================================
// STATE TYPES
// ============================================================================

export type UserState = {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  isOnline: boolean;
};

export type CounterState = {
  count: number;
  step: number;
  lastUpdated: number;
};

export type SettingsState = {
  theme: "dark" | "light";
  fontSize: number;
  notifications: boolean;
};

// ============================================================================
// STORE MAP TYPES (for CombineSquirrelStore)
// ============================================================================

export type AppStoreMap = {
  user: SquirrelStoreInstance<UserState>;
  counter: SquirrelStoreInstance<CounterState>;
  settings: SquirrelStoreInstance<SettingsState>;
};

export type LazyAppStoreMap = {
  user: SquirrelStoreInstance<UserState>;
  counter: SquirrelStoreInstance<CounterState>;
};
