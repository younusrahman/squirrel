import { CreateSquirrelStore } from "squirrel";
import { allCounters } from "./sharedLogic";

export const storeD = CreateSquirrelStore({ countD: 0 });

export default function ComponentD() {
  console.log("%cRENDER: Component D", "color: purple");
  const { setAsync } = allCounters;

  return (
    <div style={{ border: "2px solid purple", padding: "10px" }}>
      <h3>Comp D (Local: {allCounters.nodeValue.D.countD})</h3>
      {/* Batch update multiple siblings at once */}
      <button
        onClick={() =>
          setAsync({
            A: { countA: allCounters.rawValue.static.A.countA + 1 },
            B: { countB: allCounters.rawValue.static.B.countB + 1 },
            C: { countC: allCounters.rawValue.static.C.countC + 1 },
          })
        }
      >
        Sync All Siblings (+1)
      </button>
    </div>
  );
}
