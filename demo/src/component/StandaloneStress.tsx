import React, { useState, useMemo } from "react";
import { CreateSquirrelStore } from "squirrel";
import IndividualButton from "./IndividualButton";

export default function StandaloneStress() {
  console.log(
    "%cRENDER: Parent Stress Test",
    "color: black; font-weight: bold",
  );

  // Create 500 INDEPENDENT stores
  // Each call to CreateSquirrelStore creates a brand new, isolated engine.
  const stores = useMemo(() => {
    return Array.from({ length: 5000 }, () =>
      CreateSquirrelStore({ count: 0 }),
    );
  }, []);

  // --- THE TEST: Update 500 stores in a loop ---
  const updateAll = (useAsync: boolean) => {
    const start = performance.now();

    stores.forEach((useStore) => {
      const { get, set, setAsync } = useStore();
      const nextVal = get().rawValue.count + 1;

      if (useAsync) {
        setAsync({ count: nextVal });
      } else {
        set({ count: nextVal });
      }
    });

    const end = performance.now();
    console.log(
      `Commanded 500 stores to update. Logic took: ${(end - start).toFixed(4)}ms`,
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Standalone Stress: 500 Isolated Stores</h1>
      <p>
        No <code>CombineSquirrelStore</code> used here. Each button is a
        separate universe.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => updateAll(false)}
          style={{ background: "red", color: "white", padding: "10px" }}
        >
          Update All Sync (500 DOM hits)
        </button>
        <button
          onClick={() => updateAll(true)}
          style={{
            background: "green",
            color: "white",
            padding: "10px",
            marginLeft: "10px",
          }}
        >
          Update All Async (500 Batched hits)
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {stores.map((storeFn, index) => (
          <IndividualButton key={index} id={index} useStore={storeFn} />
        ))}
      </div>
    </div>
  );
}
