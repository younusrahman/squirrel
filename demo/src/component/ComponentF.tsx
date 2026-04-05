import { CreateSquirrelStore } from "squirrel";
import { allCounters } from "./sharedLogic";

// 1. Define the initial state outside to easily extract the type
const initialFState = {
  c1: 0,
  c2: 0,
  c3: 0,
  c4: 0,
  c5: 0,
  c6: 0,
  c7: 0,
  c8: 0,
  c9: 0,
  c10: 0,
  isRunning: false,
  timeTaken: 0,
};

// Extract the type for keys (c1, c2, etc.)
type StoreFKeys = keyof typeof initialFState;

export const storeF = CreateSquirrelStore(initialFState);

export default function ComponentF() {
  const { get, set, setAsync } = allCounters();

  const runTest = (useAsync: boolean) => {
    // 2. Explicitly type the array so it's not 'never[]'
    const playlist: StoreFKeys[] = [];

    // Fill the playlist with 30 clicks for each of the 10 counters
    for (let i = 1; i <= 10; i++) {
      const key = `c${i}` as StoreFKeys;
      for (let j = 0; j < 30; j++) {
        playlist.push(key);
      }
    }

    // Shuffle
    playlist.sort(() => Math.random() - 0.5);

    set({ F: { isRunning: true, timeTaken: 0 } });
    const start = performance.now();

    playlist.forEach((key) => {
      // Access raw state safely using the key
      const currentVal = get().rawValue.F[key];

      // We only want to increment the counter keys, ignore booleans/numbers
      if (typeof currentVal === "number" && key.startsWith("c")) {
        const update = { F: { [key]: currentVal + 1 } };
        if (useAsync) {
          setAsync(update);
        } else {
          set(update);
        }
      }
    });

    const end = performance.now();
    setAsync({ F: { isRunning: false, timeTaken: end - start } });
  };

  // 3. Explicitly type this array as well
  const counters: StoreFKeys[] = [
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "c10",
  ];

  return (
    <div
      style={{ border: "4px solid orange", padding: "20px", marginTop: "20px" }}
    >
      <h2>Component F: 300 Random Clicks</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
        }}
      >
        {counters.map((id) => (
          <div
            key={id}
            style={{ background: "#eee", padding: "10px", textAlign: "center" }}
          >
            <strong>{id.toUpperCase()}</strong>
            <br />
            {/* get().Ui is fully proxied and safe */}
            {get().nodeValue.F[id]}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          disabled={get().rawValue.F.isRunning}
          onClick={() => runTest(false)}
          style={{ background: "red", color: "white", padding: "10px" }}
        >
          Run 300 Sync Clicks
        </button>

        <button
          disabled={get().rawValue.F.isRunning}
          onClick={() => runTest(true)}
          style={{
            background: "green",
            color: "white",
            padding: "10px",
            marginLeft: "10px",
          }}
        >
          Run 300 Async Clicks
        </button>
      </div>

      {get().rawValue.F.timeTaken > 0 && (
        <p>
          Execution: <strong>{get().rawValue.F.timeTaken.toFixed(4)}ms</strong>
        </p>
      )}
    </div>
  );
}
