import { CreateSquirrelStore } from "squirrel";
import { allCounters } from "./sharedLogic";

export const storeE = CreateSquirrelStore({
  status: "Idle",
  lastMethod: "None",
});

export default function ComponentE() {
  const { get, set, setAsync } = allCounters;

  const handleUpdate = (isAsync: boolean) => {
    const method = isAsync ? setAsync : set;
    method({
      E: {
        status: "Running...",
        lastMethod: isAsync ? "Async" : "Sync",
      },
    });
  };

  return (
    <div
      style={{ border: "1px solid black", padding: "10px", marginTop: "10px" }}
    >
      <h3>Component E</h3>
      <p>Status: {get().nodeValue.E.status}</p>
      <button onClick={() => handleUpdate(false)}>Sync Update</button>
      <button onClick={() => handleUpdate(true)}>Async Update</button>
    </div>
  );
}
