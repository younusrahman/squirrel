import { CreateSquirrelStore } from "squirrel";
import { allCounters } from "./sharedLogic";

export const storeA = CreateSquirrelStore({ countA: 0 });

export default function ComponentA() {
  console.log("%cRENDER: Component A", "color: green");
  const { get, set } = allCounters();
  return (
    <div style={{ border: "2px solid green", padding: "10px" }}>
      {storeA()
        .get()
        .nodeValue((val) => val.countA)}
      <h3>Comp A (Local: {get().nodeValue.A.countA})</h3>
      <button
        onClick={() => set({ B: { countB: get().rawValue.B.countB + 1 } })}
      >
        Update B (+1)
      </button>
      <button onClick={() => set({ E: { status: "Loading" } })}>
        Update E (+1)
      </button>
    </div>
  );
}
