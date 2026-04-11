import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CreateSquirrelStore } from "../src/create-store";
import { CombineSquirrelStore } from "../src/combine-store";

interface UserState {
  name: string;
  age: number;
}

interface ThemeState {
  dark: boolean;
  color: string;
}

const makeUserStore = (init?: Partial<UserState>) =>
  CreateSquirrelStore<UserState>({ name: "Alice", age: 30, ...init });

const makeThemeStore = (init?: Partial<ThemeState>) =>
  CreateSquirrelStore<ThemeState>({ dark: false, color: "blue", ...init });

const makeCombined = () => {
  const user = makeUserStore();
  const theme = makeThemeStore();
  const combined = CombineSquirrelStore({ user, theme });
  return { user, theme, combined };
};

describe("CombineSquirrelStore", () => {
  // ── Creation ──────────────────────────────────────────────

  it("creates from plain object", () => {
    const { combined } = makeCombined();
    const snap = combined.rawValue.static;

    expect(snap.user.name).toBe("Alice");
    expect(snap.user.age).toBe(30);
    expect(snap.theme.dark).toBe(false);
    expect(snap.theme.color).toBe("blue");
  });

  it("creates from factory function", () => {
    const user = makeUserStore();
    const theme = makeThemeStore();
    const combined = CombineSquirrelStore(() => ({ user, theme }));

    expect(combined.rawValue.static.user.name).toBe("Alice");
    expect(combined.rawValue.static.theme.dark).toBe(false);
  });

  it("factory is lazy — not called until first access", () => {
    let called = false;
    const combined = CombineSquirrelStore(() => {
      called = true;
      return { user: makeUserStore(), theme: makeThemeStore() };
    });

    expect(called).toBe(false);
    combined.rawValue.static;
    expect(called).toBe(true);
  });

  it("factory is called only once", () => {
    let count = 0;
    const combined = CombineSquirrelStore(() => {
      count++;
      return { user: makeUserStore(), theme: makeThemeStore() };
    });

    combined.rawValue.static;
    combined.rawValue.static;
    combined.rawValue.static;
    expect(count).toBe(1);
  });

  it("exposes set, setAsync, rawValue, nodeValue", () => {
    const { combined } = makeCombined();
    expect(typeof combined.set).toBe("function");
    expect(typeof combined.setAsync).toBe("function");
    expect(combined.rawValue).toBeDefined();
    expect(combined.nodeValue).toBeDefined();
  });

  // ── set ──────────────────────────────────────────────────

  it("patches individual sub-store", () => {
    const { combined, user, theme } = makeCombined();

    combined.set({ user: { name: "Bob" } });

    expect(user.rawValue.static.name).toBe("Bob");
    expect(user.rawValue.static.age).toBe(30); // untouched
    expect(theme.rawValue.static.dark).toBe(false); // untouched
  });

  it("patches multiple sub-stores at once", () => {
    const { combined, user, theme } = makeCombined();

    combined.set({
      user: { age: 99 },
      theme: { dark: true },
    });

    expect(user.rawValue.static.age).toBe(99);
    expect(theme.rawValue.static.dark).toBe(true);
  });

  it("partial patch does not overwrite untouched fields", () => {
    const { combined, user } = makeCombined();

    combined.set({ user: { name: "Bob" } });

    expect(user.rawValue.static.name).toBe("Bob");
    expect(user.rawValue.static.age).toBe(30);
  });

  it("ignores undefined patch for a key", () => {
    const { combined, user } = makeCombined();
    combined.set({ user: undefined as any });
    expect(user.rawValue.static.name).toBe("Alice");
  });

  it("ignores null patch for a key", () => {
    const { combined, theme } = makeCombined();
    combined.set({ theme: null as any });
    expect(theme.rawValue.static.color).toBe("blue");
  });

  it("nonexistent store key does not throw", () => {
    const { combined } = makeCombined();
    expect(() => {
      (combined as any).set({ nonexistent: { foo: 1 } });
    }).not.toThrow();
  });

  it("empty object patch does not throw", () => {
    const { combined } = makeCombined();
    expect(() => combined.set({})).not.toThrow();
  });

  it("reflects change immediately in sub-store rawValue.static", () => {
    const { combined, user } = makeCombined();
    combined.set({ user: { name: "Charlie" } });
    expect(user.rawValue.static.name).toBe("Charlie");
  });

  it("multiple sequential set calls apply correctly", () => {
    const { combined, user } = makeCombined();
    combined.set({ user: { name: "B" } });
    combined.set({ user: { name: "C" } });
    combined.set({ user: { name: "D" } });
    expect(user.rawValue.static.name).toBe("D");
  });

  // ── setAsync ─────────────────────────────────────────────

  it("setAsync updates sub-store state immediately", async () => {
    const { combined, user } = makeCombined();

    combined.setAsync({ user: { name: "Eve" } });
    expect(user.rawValue.static.name).toBe("Eve");

    await new Promise<void>((r) => queueMicrotask(r));
  });

  it("setAsync batches notifications in sub-stores", async () => {
    const { combined, user } = makeCombined();
    const calls: string[] = [];

    user.__subscribeAll!(() => calls.push(user.rawValue.static.name));

    combined.setAsync({ user: { name: "A" } });
    combined.setAsync({ user: { name: "B" } });
    combined.setAsync({ user: { name: "C" } });

    // No notifications yet
    expect(calls).toEqual([]);

    await new Promise<void>((r) => queueMicrotask(r));

    // Only final value notified once
    expect(calls).toEqual(["C"]);
    expect(user.rawValue.static.name).toBe("C");
  });

  it("setAsync null patch is safe", async () => {
    const { combined } = makeCombined();
    combined.setAsync({ user: null as any });
    await new Promise<void>((r) => queueMicrotask(r));
    expect(combined.rawValue.static.user.name).toBe("Alice");
  });

  it("setAsync undefined patch is safe", async () => {
    const { combined } = makeCombined();
    combined.setAsync({ theme: undefined as any });
    await new Promise<void>((r) => queueMicrotask(r));
    expect(combined.rawValue.static.theme.color).toBe("blue");
  });

  it("setAsync empty object does not throw", async () => {
    const { combined } = makeCombined();
    expect(() => combined.setAsync({})).not.toThrow();
    await new Promise<void>((r) => queueMicrotask(r));
  });

  it("setAsync batching resets after microtask", async () => {
    const { combined, user } = makeCombined();
    const calls: string[] = [];

    user.__subscribeAll!(() => calls.push(user.rawValue.static.name));

    combined.setAsync({ user: { name: "First" } });
    await new Promise<void>((r) => queueMicrotask(r));

    combined.setAsync({ user: { name: "Second" } });
    await new Promise<void>((r) => queueMicrotask(r));

    expect(calls).toEqual(["First", "Second"]);
  });

  it("setAsync patches multiple sub-stores", async () => {
    const { combined, user, theme } = makeCombined();

    combined.setAsync({ user: { age: 50 }, theme: { color: "red" } });
    await new Promise<void>((r) => queueMicrotask(r));

    expect(user.rawValue.static.age).toBe(50);
    expect(theme.rawValue.static.color).toBe("red");
  });

  // ── rawValue.static ──────────────────────────────────────

  it("returns full snapshot of all sub-stores", () => {
    const { combined } = makeCombined();
    expect(combined.rawValue.static).toEqual({
      user: { name: "Alice", age: 30 },
      theme: { dark: false, color: "blue" },
    });
  });

  it("reflects sub-store mutations via sub-store rawValue.static", () => {
    const { combined, user } = makeCombined();
    user.set({ name: "Zara" });
    expect(user.rawValue.static.name).toBe("Zara");
  });

  it("returns stable snapshot reference when nothing changed", () => {
    const { combined } = makeCombined();
    const snap1 = combined.rawValue.static;
    const snap2 = combined.rawValue.static;
    expect(snap1).toBe(snap2);
  });

  it("snapshot cache is invalidated after sub-store change with active subscriber", () => {
    const { combined, user } = makeCombined();

    // Activate subscriber by rendering reactive component
    function App() {
      const state = combined.rawValue.reactive;
      return <span data-testid="name">{state.user.name}</span>;
    }

    render(<App />);

    act(() => {
      user.set({ name: "Invalidated" });
    });

    // After subscriber triggers cache rebuild
    expect(combined.rawValue.static.user.name).toBe("Invalidated");
  });

  // ── rawValue.reactive ────────────────────────────────────

  it("re-renders component on sub-store change", () => {
    const { combined, user } = makeCombined();
    const renders: string[] = [];

    function App() {
      const state = combined.rawValue.reactive;
      renders.push(state.user.name);
      return <span data-testid="name">{state.user.name}</span>;
    }

    render(<App />);
    expect(screen.getByTestId("name")).toHaveTextContent("Alice");

    act(() => {
      user.set({ name: "Updated" });
    });

    expect(screen.getByTestId("name")).toHaveTextContent("Updated");
    expect(renders).toEqual(["Alice", "Updated"]);
  });

  it("re-renders when any sub-store changes", () => {
    const { combined, theme } = makeCombined();

    function App() {
      const state = combined.rawValue.reactive;
      return <span data-testid="color">{state.theme.color}</span>;
    }

    render(<App />);
    expect(screen.getByTestId("color")).toHaveTextContent("blue");

    act(() => {
      theme.set({ color: "red" });
    });

    expect(screen.getByTestId("color")).toHaveTextContent("red");
  });

  it("re-renders both user and theme changes", () => {
    const { combined, user, theme } = makeCombined();
    const renders: string[] = [];

    function App() {
      const state = combined.rawValue.reactive;
      renders.push(`${state.user.name}-${state.theme.color}`);
      return (
        <span data-testid="out">
          {state.user.name}-{state.theme.color}
        </span>
      );
    }

    render(<App />);

    act(() => {
      user.set({ name: "X" });
    });

    act(() => {
      theme.set({ color: "green" });
    });

    expect(renders).toEqual(["Alice-blue", "X-blue", "X-green"]);
    expect(screen.getByTestId("out")).toHaveTextContent("X-green");
  });

  it("multiple components share reactive state", () => {
    const { combined, user } = makeCombined();

    function CompA() {
      const state = combined.rawValue.reactive;
      return <span data-testid="a">{state.user.name}</span>;
    }

    function CompB() {
      const state = combined.rawValue.reactive;
      return <span data-testid="b">{state.user.age}</span>;
    }

    render(
      <>
        <CompA />
        <CompB />
      </>,
    );

    expect(screen.getByTestId("a")).toHaveTextContent("Alice");
    expect(screen.getByTestId("b")).toHaveTextContent("30");

    act(() => {
      user.set({ name: "Bob", age: 25 });
    });

    expect(screen.getByTestId("a")).toHaveTextContent("Bob");
    expect(screen.getByTestId("b")).toHaveTextContent("25");
  });

  // ── nodeValue ────────────────────────────────────────────

  it("nodeValue.<store>(transform) renders derived value", () => {
    const { combined } = makeCombined();

    function App() {
      return (
        <div>
          <span data-testid="name">
            {combined.nodeValue.user((s) => s.name)}
          </span>
          <span data-testid="dark">
            {combined.nodeValue.theme((s) => (s.dark ? "yes" : "no"))}
          </span>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId("name")).toHaveTextContent("Alice");
    expect(screen.getByTestId("dark")).toHaveTextContent("no");
  });

  it("nodeValue.<store>(transform) re-renders on change", () => {
    const { combined, user } = makeCombined();

    function App() {
      return (
        <span data-testid="name">{combined.nodeValue.user((s) => s.name)}</span>
      );
    }

    render(<App />);
    expect(screen.getByTestId("name")).toHaveTextContent("Alice");

    act(() => {
      user.set({ name: "Bob" });
    });

    expect(screen.getByTestId("name")).toHaveTextContent("Bob");
  });

  it("nodeValue.<store>.field renders individual field", () => {
    const { combined } = makeCombined();

    function App() {
      return <span data-testid="age">{combined.nodeValue.user.age}</span>;
    }

    render(<App />);
    expect(screen.getByTestId("age")).toHaveTextContent("30");
  });

  it("nodeValue.<store>.field re-renders on change", () => {
    const { combined, user } = makeCombined();

    function App() {
      return <span data-testid="age">{combined.nodeValue.user.age}</span>;
    }

    render(<App />);
    expect(screen.getByTestId("age")).toHaveTextContent("30");

    act(() => {
      user.set({ age: 99 });
    });

    expect(screen.getByTestId("age")).toHaveTextContent("99");
  });

  it("nodeValue(transform) renders cross-store derived value", () => {
    const { combined } = makeCombined();

    function App() {
      return (
        <span data-testid="out">
          {combined.nodeValue((s) => `${s.user.name} prefers ${s.theme.color}`)}
        </span>
      );
    }

    render(<App />);
    expect(screen.getByTestId("out")).toHaveTextContent("Alice prefers blue");
  });

  it("nodeValue(transform) re-renders on user change", () => {
    const { combined, user } = makeCombined();

    function App() {
      return (
        <span data-testid="out">
          {combined.nodeValue((s) => `${s.user.name}-${s.theme.color}`)}
        </span>
      );
    }

    render(<App />);
    expect(screen.getByTestId("out")).toHaveTextContent("Alice-blue");

    act(() => {
      user.set({ name: "X" });
    });

    expect(screen.getByTestId("out")).toHaveTextContent("X-blue");
  });

  it("nodeValue(transform) re-renders on theme change", () => {
    const { combined, theme } = makeCombined();

    function App() {
      return (
        <span data-testid="out">
          {combined.nodeValue((s) => `${s.user.name}-${s.theme.color}`)}
        </span>
      );
    }

    render(<App />);

    act(() => {
      theme.set({ color: "green" });
    });

    expect(screen.getByTestId("out")).toHaveTextContent("Alice-green");
  });

  it("nodeValue(transform) re-renders on both store changes", () => {
    const { combined, user, theme } = makeCombined();

    function App() {
      return (
        <span data-testid="out">
          {combined.nodeValue((s) => `${s.user.name}-${s.theme.color}`)}
        </span>
      );
    }

    render(<App />);
    expect(screen.getByTestId("out")).toHaveTextContent("Alice-blue");

    act(() => {
      user.set({ name: "X" });
    });
    expect(screen.getByTestId("out")).toHaveTextContent("X-blue");

    act(() => {
      theme.set({ color: "green" });
    });
    expect(screen.getByTestId("out")).toHaveTextContent("X-green");
  });

  it("nodeValue(transform) array renders correct element count", () => {
    const { combined } = makeCombined();

    function App() {
      return (
        <div data-testid="list">
          {combined.nodeValue((s) => [
            <span key="name">{s.user.name}</span>,
            <span key="color">{s.theme.color}</span>,
          ])}
        </div>
      );
    }

    const { container } = render(<App />);
    expect(container.querySelectorAll("span")).toHaveLength(2);
  });

  it("nodeValue(transform) boolean derived value", () => {
    const { combined } = makeCombined();

    function App() {
      return (
        <span data-testid="out">
          {combined.nodeValue((s) => (s.theme.dark ? "dark" : "light"))}
        </span>
      );
    }

    render(<App />);
    expect(screen.getByTestId("out")).toHaveTextContent("light");
  });

  it("nodeValue(transform) numeric derived value", () => {
    const { combined } = makeCombined();

    function App() {
      return (
        <span data-testid="out">
          {combined.nodeValue((s) => String(s.user.age * 2))}
        </span>
      );
    }

    render(<App />);
    expect(screen.getByTestId("out")).toHaveTextContent("60");
  });

  // ── Single sub-store ─────────────────────────────────────

  it("works with a single sub-store", () => {
    const user = makeUserStore();
    const combined = CombineSquirrelStore({ user });

    expect(combined.rawValue.static.user.name).toBe("Alice");
    combined.set({ user: { name: "Solo" } });
    expect(user.rawValue.static.name).toBe("Solo");
  });

  it("single sub-store reactive updates work", () => {
    const user = makeUserStore();
    const combined = CombineSquirrelStore({ user });

    function App() {
      const state = combined.rawValue.reactive;
      return <span data-testid="name">{state.user.name}</span>;
    }

    render(<App />);
    expect(screen.getByTestId("name")).toHaveTextContent("Alice");

    act(() => {
      combined.set({ user: { name: "Solo" } });
    });

    expect(screen.getByTestId("name")).toHaveTextContent("Solo");
  });

  // ── Three sub-stores ─────────────────────────────────────

  it("works with three sub-stores", () => {
    const a = CreateSquirrelStore({ x: 1 });
    const b = CreateSquirrelStore({ y: 2 });
    const c = CreateSquirrelStore({ z: 3 });
    const combined = CombineSquirrelStore({ a, b, c });

    expect(combined.rawValue.static.a.x).toBe(1);
    expect(combined.rawValue.static.b.y).toBe(2);
    expect(combined.rawValue.static.c.z).toBe(3);

    combined.set({ b: { y: 99 } });
    expect(b.rawValue.static.y).toBe(99);
  });

  // ── Factory + access pattern ──────────────────────────────

  it("factory delays resolution until nodeValue is accessed in render", () => {
    let resolved = false;
    const combined = CombineSquirrelStore(() => {
      resolved = true;
      return { user: makeUserStore(), theme: makeThemeStore() };
    });

    expect(resolved).toBe(false);

    function App() {
      return <span data-testid="age">{combined.nodeValue.user.age}</span>;
    }

    render(<App />);
    expect(resolved).toBe(true);
    expect(screen.getByTestId("age")).toHaveTextContent("30");
  });

  it("factory delays resolution until rawValue.reactive is accessed", () => {
    let resolved = false;
    const combined = CombineSquirrelStore(() => {
      resolved = true;
      return { user: makeUserStore(), theme: makeThemeStore() };
    });

    expect(resolved).toBe(false);

    function App() {
      const state = combined.rawValue.reactive;
      return <span data-testid="name">{state.user.name}</span>;
    }

    render(<App />);
    expect(resolved).toBe(true);
    expect(screen.getByTestId("name")).toHaveTextContent("Alice");
  });

  // ── Unmount safety ───────────────────────────────────────

  it("unmounting reactive component does not throw on subsequent set", () => {
    const { combined, user } = makeCombined();

    function App({ show }: { show: boolean }) {
      if (!show) return null;
      const state = combined.rawValue.reactive;
      return <span>{state.user.name}</span>;
    }

    const { rerender } = render(<App show={true} />);
    rerender(<App show={false} />);

    act(() => {
      user.set({ name: "after-unmount" });
    });

    expect(user.rawValue.static.name).toBe("after-unmount");
  });

  it("unmounting nodeValue component does not throw on subsequent set", () => {
    const { combined, user } = makeCombined();

    function App({ show }: { show: boolean }) {
      if (!show) return null;
      return <span>{combined.nodeValue.user((s) => s.name)}</span>;
    }

    const { rerender } = render(<App show={true} />);
    rerender(<App show={false} />);

    act(() => {
      user.set({ name: "after-unmount" });
    });

    expect(user.rawValue.static.name).toBe("after-unmount");
  });
});
