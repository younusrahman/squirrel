import ComponentA from "./component/ComponentA";
import ComponentB from "./component/ComponentB";
import ComponentC from "./component/ComponentC";
import ComponentD from "./component/ComponentD";
import ComponentE from "./component/ComponentE";
import ComponentF from "./component/ComponentF";
import { UserWorkList } from "./component/ComponentList";
import { allCounters } from "./component/sharedLogic";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Squirrel 5-Component System</h1>

      {/* Global Display */}
      <div style={{ background: "#333", color: "white", padding: "10px" }}>
        <p>
          A: {allCounters.nodeValue.A.countA} | B: {allCounters.nodeValue.B.countB} | C:{" "}
          {allCounters.nodeValue.C.countC} | D: {allCounters.nodeValue.D.countD}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <ComponentA />
        <ComponentB />
        <ComponentC />
        <ComponentD />
      </div>
      <ComponentE />
      <ComponentF />
      <UserWorkList />
    </div>
  );
}
export default App;
