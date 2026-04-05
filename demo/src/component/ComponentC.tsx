import { CreateSquirrelStore } from "squirrel";
import { allCounters } from "./sharedLogic";

export const storeC = CreateSquirrelStore({ countC: 0 });

export default function ComponentC() {
  console.log("%cRENDER: Component C", "color: red");
  const { get, setAsync } = allCounters();

  return (
    <div style={{ border: "2px solid red", padding: "10px" }}>
      <h3>Comp C (Local: {get().nodeValue.C.countC})</h3>
      <button
        onClick={() => setAsync({ D: { countD: get().rawValue.D.countD + 1 } })}
      >
        Update D (+1 Async)
      </button>
    </div>
  );
}
