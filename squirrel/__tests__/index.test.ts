import { CreateSquirrelStore, CombineSquirrelStore } from "../src/index";

describe("Public API exports", () => {
  it("exports CreateSquirrelStore", () => {
    expect(CreateSquirrelStore).toBeDefined();
    expect(typeof CreateSquirrelStore).toBe("function");
  });

  it("exports CombineSquirrelStore", () => {
    expect(CombineSquirrelStore).toBeDefined();
    expect(typeof CombineSquirrelStore).toBe("function");
  });

  it("CreateSquirrelStore returns valid instance", () => {
    const store = CreateSquirrelStore({ x: 1 });
    expect(store.rawValue).toBeDefined();
    expect(store.nodeValue).toBeDefined();
    expect(typeof store.set).toBe("function");
    expect(typeof store.setAsync).toBe("function");
    expect(typeof store.__subscribeAll).toBe("function");
  });

  it("CombineSquirrelStore returns valid instance", () => {
    const a = CreateSquirrelStore({ val: 1 });
    const combined = CombineSquirrelStore({ a });

    expect(combined.rawValue).toBeDefined();
    expect(combined.nodeValue).toBeDefined();
    expect(typeof combined.set).toBe("function");
    expect(typeof combined.setAsync).toBe("function");
  });
});
