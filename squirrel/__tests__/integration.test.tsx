import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CreateSquirrelStore } from "../src/create-store";
import { CombineSquirrelStore } from "../src/combine-store";

describe("Integration tests", () => {
  it("multiple components sharing store stay in sync", () => {
    const store = CreateSquirrelStore({ count: 0 });

    function Counter() {
      return <span data-testid="counter">{store.nodeValue.count}</span>;
    }

    function Display() {
      return (
        <span data-testid="display">
          {store.nodeValue((s) => `Count is ${s.count}`)}
        </span>
      );
    }

    render(
      <>
        <Counter />
        <Display />
      </>,
    );

    expect(screen.getByTestId("counter")).toHaveTextContent("0");
    expect(screen.getByTestId("display")).toHaveTextContent("Count is 0");

    act(() => {
      store.set({ count: 10 });
    });

    expect(screen.getByTestId("counter")).toHaveTextContent("10");
    expect(screen.getByTestId("display")).toHaveTextContent("Count is 10");
  });

  it("combined responds to either sub-store change", () => {
    const counter = CreateSquirrelStore({ value: 0 });
    const settings = CreateSquirrelStore({ multiplier: 2 });
    const combined = CombineSquirrelStore({ counter, settings });

    function App() {
      return (
        <span data-testid="result">
          {combined.nodeValue((s) =>
            String(s.counter.value * s.settings.multiplier),
          )}
        </span>
      );
    }

    render(<App />);
    expect(screen.getByTestId("result")).toHaveTextContent("0");

    act(() => {
      counter.set({ value: 5 });
    });
    expect(screen.getByTestId("result")).toHaveTextContent("10");

    act(() => {
      settings.set({ multiplier: 3 });
    });
    expect(screen.getByTestId("result")).toHaveTextContent("15");
  });

  it("direct and combined set both work", () => {
    const a = CreateSquirrelStore({ x: 1 });
    const b = CreateSquirrelStore({ y: 2 });
    const combined = CombineSquirrelStore({ a, b });

    function App() {
      return (
        <div>
          <span data-testid="x">{combined.nodeValue.a.x}</span>
          <span data-testid="y">{combined.nodeValue.b.y}</span>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId("x")).toHaveTextContent("1");
    expect(screen.getByTestId("y")).toHaveTextContent("2");

    act(() => {
      combined.set({ a: { x: 10 } });
    });
    expect(screen.getByTestId("x")).toHaveTextContent("10");

    act(() => {
      b.set({ y: 20 });
    });
    expect(screen.getByTestId("y")).toHaveTextContent("20");
  });

  it("setAsync resolves and updates UI", async () => {
    const store = CreateSquirrelStore({ msg: "initial" });
    const combined = CombineSquirrelStore({ store });

    function App() {
      const state = combined.rawValue.reactive;
      return <span data-testid="msg">{state.store.msg}</span>;
    }

    render(<App />);
    expect(screen.getByTestId("msg")).toHaveTextContent("initial");

    await act(async () => {
      combined.setAsync({ store: { msg: "updated" } });
      await new Promise<void>((r) => queueMicrotask(r));
    });

    expect(screen.getByTestId("msg")).toHaveTextContent("updated");
  });

  it("rapid sequential updates preserve state", () => {
    const store = CreateSquirrelStore({ a: 0, b: 0, c: 0 });

    function App() {
      return (
        <span data-testid="out">
          {store.nodeValue((s) => `${s.a}-${s.b}-${s.c}`)}
        </span>
      );
    }

    render(<App />);

    act(() => {
      store.set({ a: 1 });
      store.set({ b: 2 });
      store.set({ c: 3 });
    });

    expect(screen.getByTestId("out")).toHaveTextContent("1-2-3");
  });

  it("complex nested state works", () => {
    interface AppState {
      items: string[];
      meta: { total: number };
    }

    const store = CreateSquirrelStore<AppState>({
      items: ["a", "b"],
      meta: { total: 2 },
    });

    function App() {
      return (
        <div>
          <span data-testid="items">
            {store.nodeValue((s) => s.items.join(","))}
          </span>
          <span data-testid="total">
            {store.nodeValue((s) => String(s.meta.total))}
          </span>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId("items")).toHaveTextContent("a,b");
    expect(screen.getByTestId("total")).toHaveTextContent("2");

    act(() => {
      store.set({
        items: ["a", "b", "c"],
        meta: { total: 3 },
      });
    });

    expect(screen.getByTestId("items")).toHaveTextContent("a,b,c");
    expect(screen.getByTestId("total")).toHaveTextContent("3");
  });

  it("factory delays resolution until first access", () => {
    let resolved = false;
    const combined = CombineSquirrelStore(() => {
      resolved = true;
      return {
        s: CreateSquirrelStore({ v: 1 }),
      };
    });

    expect(resolved).toBe(false);

    function App() {
      return <span data-testid="v">{combined.nodeValue.s.v}</span>;
    }

    render(<App />);
    expect(resolved).toBe(true);
    expect(screen.getByTestId("v")).toHaveTextContent("1");
  });
});
