import { CreateSquirrelStore } from "squirrel";
import { allCounters } from "./sharedLogic";

export const storeB = CreateSquirrelStore({ countB: 0 });

export default function ComponentB() {
  console.log("%cRENDER: Component B", "color: blue");
  const { get, set } = allCounters;

  return (
    <div style={{ border: "2px solid blue", padding: "10px" }}>
      <h3>Comp B (Local: {get().nodeValue.B.countB})</h3>
      <button
        onClick={() => set({ C: { countC: get().rawValue.static.C.countC + 1 } })}
      >
        Update C (+1)
      </button>
    </div>
  );
}
