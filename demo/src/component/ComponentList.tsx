import { useState } from "react";
import { CreateSquirrelStore } from "squirrel";

const users = CreateSquirrelStore({
  userList: [
    { id: 1, name: "Alice", workTime: "9am - 5pm" },
    { id: 2, name: "Bob", workTime: "10am - 6pm" },
    { id: 3, name: "Charlie", workTime: "8am - 4pm" },
  ],
  userList2: [
    { id: 1, name: "Alice", workTime: "9am - 5pm" },
    { id: 2, name: "Bob", workTime: "10am - 6pm" },
    { id: 3, name: "Charlie", workTime: "8am - 4pm" },
  ],
});

export function UserWorkList() {
  const [mode, setMode] = useState<"list1" | "list2" | null>(null);
  console.log("%cRENDER: UserWorkList", "color: green");
  return (
    <div>
      <h2>User Work Times</h2>

      <button onClick={() => setMode("list1")}>Show List 1</button>
      <button onClick={() => setMode("list2")} style={{ marginLeft: 8 }}>
        Show List 2
      </button>

      {/* First mapping (rawValue) */}
      {mode === "list1" && (
        <ul>
          {users
            .rawValue.static.userList.map((u) => (
              <li key={u.id}>
                <strong>{u.name}</strong> — {u.workTime}
              </li>
            ))}
        </ul>
      )}

      {/* Second mapping (nodeValue) */}
      {mode === "list2" &&
        users
          .nodeValue((val) => {
            return (
              <ul>
                {val.userList2.map((u) => (
                  <li key={u.id}>
                    <strong style={{ color: "red" }}>{u.name}</strong> —{" "}
                    {u.workTime}
                  </li>
                ))}
              </ul>
            );
          })}
    </div>
  );
}
