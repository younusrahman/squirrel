import { CreateSquirrelStore } from "squirrel";
import { allCounters } from "./sharedLogic";

export const storeC = CreateSquirrelStore({ countC: 0 });

export default function ComponentC() {
  console.log("%cRENDER: Component C", "color: red");
  const { get, set } = allCounters;

  return (
    <div style={{ border: "2px solid red", padding: "10px" }}>
      <h3>Comp C (Local: {get().nodeValue.C.countC})</h3>
      <button
        onClick={() => set({ C: { countC: get().rawValue.static.C.countC + 1 } })}
      >
        Update C (+1)
      </button>
    </div>
  );
}
