import { CreateSquirrelStore, CombineSquirrelStore } from "squirrel";

// ============================================================================
// SINGLE STORES
// ============================================================================

export const userStore = CreateSquirrelStore({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  age: 25,
  isOnline: true,
});

export const counterStore = CreateSquirrelStore({
  count: 0,
  step: 1,
  lastUpdated: Date.now(),
});

export const settingsStore = CreateSquirrelStore({
  theme: "dark" as "dark" | "light",
  fontSize: 14,
  notifications: true,
});

// ============================================================================
// COMBINED STORES
// ============================================================================

// EAGER: Stores resolved immediately
export const appStore = CombineSquirrelStore({
  user: userStore,
  counter: counterStore,
  settings: settingsStore,
});

// LAZY: Stores resolved on first access (for circular imports)
export const lazyAppStore = CombineSquirrelStore(() => ({
  user: userStore,
  counter: counterStore,
}));
