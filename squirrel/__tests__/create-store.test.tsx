import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CreateSquirrelStore } from "../src/create-store";

interface CounterState {
  count: number;
  label: string;
}

const makeStore = (init?: Partial<CounterState>) =>
  CreateSquirrelStore<CounterState>({ count: 0, label: "default", ...init });

describe("CreateSquirrelStore", () => {
  // ── Creation ──────────────────────────────────────────────

  it("creates store with initial state", () => {
    const store = makeStore();
    expect(store.rawValue.static.count).toBe(0);
    expect(store.rawValue.static.label).toBe("default");
  });

  it("isolates state between stores", () => {
    const a = makeStore({ count: 1 });
    const b = makeStore({ count: 2 });
    expect(a.rawValue.static.count).toBe(1);
    expect(b.rawValue.static.count).toBe(2);
  });

  it("exposes all expected methods", () => {
    const store = makeStore();
    expect(typeof store.set).toBe("function");
    expect(typeof store.setAsync).toBe("function");
    expect(typeof store.__subscribeAll).toBe("function");
    expect(store.rawValue).toBeDefined();
    expect(store.nodeValue).toBeDefined();
  });

  // ── set (synchronous) ────────────────────────────────────

  it("updates with object patch", () => {
    const store = makeStore();
    store.set({ count: 5 });
    expect(store.rawValue.static.count).toBe(5);
    expect(store.rawValue.static.label).toBe("default");
  });

  it("updates with function patch", () => {
    const store = makeStore({ count: 10 });
    store.set((prev) => ({ count: prev.count + 1 }));
    expect(store.rawValue.static.count).toBe(11);
  });

  it("does not mutate original init object", () => {
    const init = { count: 0, label: "original" };
    const store = CreateSquirrelStore<CounterState>({ ...init });
    store.set({ count: 99 });
    expect(init.count).toBe(0);
  });

  it("ignores null", () => {
    const store = makeStore();
    store.set(null as any);
    expect(store.rawValue.static.count).toBe(0);
  });

  it("ignores undefined", () => {
    const store = makeStore();
    store.set(undefined as any);
    expect(store.rawValue.static.count).toBe(0);
  });

  it("ignores function returning null", () => {
    const store = makeStore();
    store.set((() => null) as any);
    expect(store.rawValue.static.count).toBe(0);
  });

  it("handles empty object patch", () => {
    const store = makeStore();
    store.set({});
    expect(store.rawValue.static.count).toBe(0);
  });

  it("handles function returning empty object", () => {
    const store = makeStore();
    store.set(() => ({}));
    expect(store.rawValue.static.count).toBe(0);
  });

  it("sequential sets apply correctly", () => {
    const store = makeStore();
    store.set({ count: 1 });
    store.set({ count: 2 });
    store.set({ count: 3 });
    expect(store.rawValue.static.count).toBe(3);
  });

  it("function patch receives latest state", () => {
    const store = makeStore();
    store.set({ count: 1 });
    store.set((prev) => {
      expect(prev.count).toBe(1);
      return { count: prev.count + 10 };
    });
    expect(store.rawValue.static.count).toBe(11);
  });

  it("updates multiple keys at once", () => {
    const store = makeStore();
    store.set({ count: 100, label: "updated" });
    expect(store.rawValue.static).toEqual({ count: 100, label: "updated" });
  });

  // ── __subscribeAll ───────────────────────────────────────

  it("notifies global subscribers on set", () => {
    const store = makeStore();
    const calls: number[] = [];

    const unsub = store.__subscribeAll!(() => {
      calls.push(store.rawValue.static.count);
    });

    store.set({ count: 7 });
    expect(calls).toEqual([7]);

    unsub();
    store.set({ count: 99 });
    expect(calls).toEqual([7]);
  });

  it("unsubscribe works", () => {
    const store = makeStore();
    const fn = jest.fn();
    const unsub = store.__subscribeAll!(fn);

    store.set({ count: 1 });
    expect(fn).toHaveBeenCalledTimes(1);

    unsub();
    store.set({ count: 2 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("supports multiple subscribers", () => {
    const store = makeStore();
    const a = jest.fn();
    const b = jest.fn();

    store.__subscribeAll!(a);
    store.__subscribeAll!(b);

    store.set({ count: 1 });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  // ── setAsync (batched) ───────────────────────────────────

  it("batches multiple calls into single notification", async () => {
    const store = makeStore();
    const calls: number[] = [];

    store.__subscribeAll!(() => {
      calls.push(store.rawValue.static.count);
    });

    store.setAsync({ count: 1 });
    store.setAsync({ count: 2 });
    store.setAsync({ count: 3 });

    expect(calls).toEqual([]);

    await new Promise<void>((r) => queueMicrotask(r));

    expect(calls).toEqual([3]);
    expect(store.rawValue.static.count).toBe(3);
  });

  it("updates state immediately even though notification is deferred", () => {
    const store = makeStore();
    store.setAsync({ count: 42 });
    expect(store.rawValue.static.count).toBe(42);
  });

  it("ignores null patches", async () => {
    const store = makeStore();
    store.setAsync(null as any);
    await new Promise<void>((r) => queueMicrotask(r));
    expect(store.rawValue.static.count).toBe(0);
  });

  it("works with function patch", async () => {
    const store = makeStore({ count: 5 });
    store.setAsync((prev) => ({ count: prev.count * 2 }));
    await new Promise<void>((r) => queueMicrotask(r));
    expect(store.rawValue.static.count).toBe(10);
  });

  it("resets batching after microtask", async () => {
    const store = makeStore();
    const calls: number[] = [];
    store.__subscribeAll!(() => calls.push(store.rawValue.static.count));

    store.setAsync({ count: 1 });
    await new Promise<void>((r) => queueMicrotask(r));

    store.setAsync({ count: 2 });
    await new Promise<void>((r) => queueMicrotask(r));

    expect(calls).toEqual([1, 2]);
  });

  it("batches mixed key updates", async () => {
    const store = makeStore();
    const fn = jest.fn();
    store.__subscribeAll!(fn);

    store.setAsync({ count: 10 });
    store.setAsync({ label: "new" });

    await new Promise<void>((r) => queueMicrotask(r));

    expect(fn).toHaveBeenCalledTimes(1);
    expect(store.rawValue.static.count).toBe(10);
    expect(store.rawValue.static.label).toBe("new");
  });

  // ── nodeValue rendering ──────────────────────────────────

  it("nodeValue.<key> renders value", () => {
    const store = makeStore({ count: 7, label: "hi" });

    function App() {
      return (
        <div>
          <span data-testid="count">{store.nodeValue.count}</span>
          <span data-testid="label">{store.nodeValue.label}</span>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId("count")).toHaveTextContent("7");
    expect(screen.getByTestId("label")).toHaveTextContent("hi");
  });

  it("nodeValue.<key> re-renders on change", () => {
    const store = makeStore({ count: 0, label: "x" });

    function App() {
      return <span data-testid="count">{store.nodeValue.count}</span>;
    }

    render(<App />);
    expect(screen.getByTestId("count")).toHaveTextContent("0");

    act(() => {
      store.set({ count: 42 });
    });

    expect(screen.getByTestId("count")).toHaveTextContent("42");
  });

  it("nodeValue(transform) renders derived value", () => {
    const store = makeStore({ count: 3, label: "items" });

    function App() {
      return (
        <span data-testid="out">
          {store.nodeValue((s) => `${s.count} ${s.label}`)}
        </span>
      );
    }

    render(<App />);
    expect(screen.getByTestId("out")).toHaveTextContent("3 items");
  });

  it("nodeValue(transform) re-renders on change", () => {
    const store = makeStore({ count: 1, label: "thing" });

    function App() {
      return (
        <span data-testid="out">
          {store.nodeValue((s) => `${s.count} ${s.label}`)}
        </span>
      );
    }

    render(<App />);

    act(() => {
      store.set({ count: 5 });
    });

    expect(screen.getByTestId("out")).toHaveTextContent("5 thing");
  });

  it("nodeValue(transform) returning array gets auto-keyed", () => {
    const store = makeStore({ count: 2, label: "" });
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    function App() {
      return (
        <div data-testid="list">
          {store.nodeValue((s) =>
            Array.from({ length: s.count }, (_, i) => <span>{i}</span>),
          )}
        </div>
      );
    }

    const { container } = render(<App />);
    expect(container.querySelectorAll("span")).toHaveLength(2);
    consoleSpy.mockRestore();
  });

  // ── rawValue.static ──────────────────────────────────────

  it("returns current state without hooks", () => {
    const store = makeStore({ count: 10, label: "yo" });
    expect(store.rawValue.static.count).toBe(10);

    store.set({ count: 20 });
    expect(store.rawValue.static.count).toBe(20);
  });

  // ── rawValue.reactive ────────────────────────────────────

  it("triggers re-render on change", () => {
    const store = makeStore({ count: 0, label: "" });
    const renders: number[] = [];

    function App() {
      const state = store.rawValue.reactive;
      renders.push(state.count);
      return <span data-testid="val">{state.count}</span>;
    }

    render(<App />);
    expect(screen.getByTestId("val")).toHaveTextContent("0");

    act(() => {
      store.set({ count: 5 });
    });

    expect(screen.getByTestId("val")).toHaveTextContent("5");
    expect(renders).toEqual([0, 5]);
  });

  // ── Unmount safety ───────────────────────────────────────

  it("unmounting with nodeValue does not throw", () => {
    const store = makeStore({ count: 1, label: "" });

    function App({ show }: { show: boolean }) {
      return show ? <div>{store.nodeValue.count}</div> : null;
    }

    const { rerender } = render(<App show={true} />);
    rerender(<App show={false} />);

    act(() => {
      store.set({ count: 99 });
    });
    expect(store.rawValue.static.count).toBe(99);
  });

  it("unmounting with reactive does not throw", () => {
    const store = makeStore({ count: 0, label: "" });

    function App({ show }: { show: boolean }) {
      if (!show) return null;
      const state = store.rawValue.reactive;
      return <span>{state.count}</span>;
    }

    const { rerender } = render(<App show={true} />);
    rerender(<App show={false} />);

    act(() => {
      store.set({ count: 50 });
    });
    expect(store.rawValue.static.count).toBe(50);
  });
});
