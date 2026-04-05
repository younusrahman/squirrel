import React from "react";
import type { SquirrelStoreInstance } from "squirrel/src/store";

interface Props {
  // Each child gets its own unique store function
  useStore: () => SquirrelStoreInstance<{ count: number }>;
  id: number;
}

export default function IndividualButton({ useStore, id }: Props) {
  // This log only happens ONCE when the button is first created
  console.log(`%cMounting Store Button #${id}`, "color: gray; font-size: 10px");

  const { get, set } = useStore();

  return (
    <button
      onClick={() => set({ count: get().rawValue.count + 1 })}
      style={{ padding: "5px", fontSize: "10px", margin: "2px" }}
    >
      #{id}: {get().nodeValue.count}
    </button>
  );
}
