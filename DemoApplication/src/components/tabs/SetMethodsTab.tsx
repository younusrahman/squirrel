import React from "react";
import { userStore, counterStore, settingsStore } from "../../stores";
import { colors } from "../../constants/colors";
import RenderTracker from "../ui/RenderTracker";
import Val from "../ui/Val";
import Btn from "../ui/Btn";
import Buttons from "../ui/Buttons";
import Section from "../ui/Section";
import InfoBox from "../ui/InfoBox";
import CodeBlock from "../ui/CodeBlock";

const rand = () => Math.floor(Math.random() * 100);

// ─── set() Demo ───────────────────────────────────────────────────────────────
const SetImmediateDemo = () => {
  const handleSet3Times = () => {
    counterStore.set({ count: 100 });
    counterStore.set({ step: 5 });
    counterStore.set({ lastUpdated: Date.now() });
  };

  return (
    <RenderTracker label="Counter State">
      <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
        <span>
          Count: <Val>{counterStore.nodeValue.count}</Val>
        </span>
        <span>
          Step: <Val>{counterStore.nodeValue.step}</Val>
        </span>
      </div>
      <Buttons>
        <Btn onClick={handleSet3Times} color={colors.warning}>
          3× set() = 3 renders
        </Btn>
        <Btn
          onClick={() =>
            counterStore.set({
              count: counterStore.rawValue.static.count + 1,
            })
          }
          small
        >
          +1 Count
        </Btn>
      </Buttons>
    </RenderTracker>
  );
};

// ─── setAsync() Demo ──────────────────────────────────────────────────────────
const SetAsyncDemo = () => {
  const handleSetAsync3Times = () => {
    counterStore.setAsync({ count: 200 });
    counterStore.setAsync({ step: 10 });
    counterStore.setAsync({ lastUpdated: Date.now() });
  };

  const handleMultipleStores = () => {
    userStore.setAsync({ firstName: `Batch_${rand()}` });
    counterStore.setAsync({ count: 999 });
    settingsStore.setAsync({ fontSize: 16 + (rand() % 8) });
  };

  return (
    <RenderTracker label="Counter State">
      <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
        <span>
          Count: <Val>{counterStore.nodeValue.count}</Val>
        </span>
        <span>
          Step: <Val>{counterStore.nodeValue.step}</Val>
        </span>
      </div>
      <Buttons>
        <Btn onClick={handleSetAsync3Times} color={colors.success}>
          3× setAsync() = 1 render
        </Btn>
        <Btn onClick={handleMultipleStores} color={colors.info}>
          Update 3 stores!
        </Btn>
      </Buttons>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "10px",
          marginTop: "8px",
        }}
      >
        User: {userStore.nodeValue.firstName} | Font:{" "}
        {settingsStore.nodeValue.fontSize}px
      </p>
    </RenderTracker>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
const SetMethodsTab = () => (
  <div
    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
  >
    <Section title="set() - Immediate" icon="⚡" color={colors.warning}>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
      >
        Each call triggers a separate render cycle.
      </p>
      <SetImmediateDemo />
      <InfoBox color={colors.warning}>
        ⚠️ 3 calls = 3 render cycles
        <br />
        ✅ Use for single updates
        <br />✅ Use when you need immediate UI feedback
      </InfoBox>
      <CodeBlock>
        {`// Immediate update
userStore.set({ firstName: "John" });

// With callback (access previous state)
userStore.set((prev) => ({
  age: prev.age + 1
}));

// Multiple calls = multiple renders!
userStore.set({ firstName: "A" }); // Render 1
userStore.set({ lastName: "B" });  // Render 2
userStore.set({ age: 30 });        // Render 3`}
      </CodeBlock>
    </Section>

    <Section title="setAsync() - Batched" icon="🚀" color={colors.success}>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
      >
        Multiple calls merge into ONE render!
      </p>
      <SetAsyncDemo />
      <InfoBox color={colors.success}>
        ✅ 3 calls = 1 render cycle (batched!)
        <br />
        ✅ Uses queueMicrotask internally
        <br />✅ Perfect for bulk updates
      </InfoBox>
      <CodeBlock>
        {`// Batched updates - all merge!
userStore.setAsync({ firstName: "A" }); // Queued
userStore.setAsync({ lastName: "B" });  // Queued
userStore.setAsync({ age: 30 });        // Queued
// → 1 render with all changes!

// Works across multiple stores too!
userStore.setAsync({ firstName: "X" });
counterStore.setAsync({ count: 100 });
// → Both batched together!`}
      </CodeBlock>
    </Section>
  </div>
);

export default SetMethodsTab;