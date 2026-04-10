import { CreateSquirrelStore, CombineSquirrelStore } from "squirrel";
import type { AppStoreMap, CounterState, LazyAppStoreMap, SettingsState, UserState } from "./types";

// ============================================================================
// SINGLE STORES
// ============================================================================

export const userStore = CreateSquirrelStore<UserState>({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  age: 25,
  isOnline: true,
});

export const counterStore = CreateSquirrelStore<CounterState>({
  count: 0,
  step: 1,
  lastUpdated: Date.now(),
});

export const settingsStore = CreateSquirrelStore<SettingsState>({
  theme: "dark" as "dark" | "light",
  fontSize: 14,
  notifications: true,
});

// ============================================================================
// COMBINED STORES
// ============================================================================

export const appStore = CombineSquirrelStore<AppStoreMap>({
  user: userStore,
  counter: counterStore,
  settings: settingsStore,
});

export const lazyAppStore = CombineSquirrelStore<LazyAppStoreMap>(() => ({
  user: userStore,
  counter: counterStore,
}));
