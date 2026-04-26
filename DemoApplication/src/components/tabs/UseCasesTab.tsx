import React, { useRef } from "react";
import { userStore, counterStore, lazyAppStore } from "../../stores";
import { colors } from "../../constants/colors";
import RenderTracker from "../ui/RenderTracker";
import Btn from "../ui/Btn";
import Buttons from "../ui/Buttons";
import Section from "../ui/Section";
import InfoBox from "../ui/InfoBox";
import CodeBlock from "../ui/CodeBlock";

const rand = () => Math.floor(Math.random() * 100);

// ─── Use Case 1 ───────────────────────────────────────────────────────────────
const UseCase1Demo = () => {
  const renderCount = useRef(0);
  renderCount.current++;

  return (
    <RenderTracker label={`Parent (renders: ${renderCount.current})`}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}
      >
        {[
          { label: "Name", value: userStore.nodeValue.firstName },
          { label: "Age", value: userStore.nodeValue.age },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              padding: "8px",
              backgroundColor: colors.cardAlt,
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            <div style={{ color: colors.textMuted, fontSize: "10px" }}>
              {label}
            </div>
            <div style={{ fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>
      <Buttons>
        <Btn
          onClick={() => userStore.set({ firstName: `Name_${rand()}` })}
          small
        >
          Change Name
        </Btn>
        <Btn
          onClick={() =>
            userStore.set({ age: userStore.rawValue.static.age + 1 })
          }
          color={colors.success}
          small
        >
          +1 Age
        </Btn>
      </Buttons>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "10px",
          marginTop: "6px",
        }}
      >
        👆 Parent stays at 1, values update independently!
      </p>
    </RenderTracker>
  );
};

// ─── Use Case 2 ───────────────────────────────────────────────────────────────
const UseCase2Demo = () => {
  const renderCount = useRef(0);
  renderCount.current++;

  const handleSave = () => {
    const state = userStore.rawValue.static;
    alert(`Saving (no re-render!):\n\n${JSON.stringify(state, null, 2)}`);
  };

  const handleIncrement = () => {
    const current = counterStore.rawValue.static.count;
    const step = counterStore.rawValue.static.step;
    counterStore.set({ count: current + step });
  };

  return (
    <RenderTracker
      label={`Handler Component (renders: ${renderCount.current})`}
    >
      <Buttons>
        <Btn onClick={handleSave} color={colors.info} small>
          💾 Save
        </Btn>
        <Btn onClick={handleIncrement} color={colors.success} small>
          +Step
        </Btn>
      </Buttons>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "10px",
          marginTop: "8px",
        }}
      >
        Count: {counterStore.nodeValue.count} (Step:{" "}
        {counterStore.nodeValue.step})
      </p>
      <p style={{ color: colors.textMuted, fontSize: "10px" }}>
        👆 Click +Step - handler component stays at 1!
      </p>
    </RenderTracker>
  );
};

// ─── Use Case 3 ───────────────────────────────────────────────────────────────
const UseCase3Demo = () => {
  const state = counterStore.rawValue.reactive;

  return (
    <RenderTracker label="Debug Panel">
      <pre
        style={{
          margin: 0,
          padding: "8px",
          backgroundColor: colors.cardAlt,
          borderRadius: "6px",
          fontSize: "10px",
        }}
      >
        {JSON.stringify(state, null, 2)}
      </pre>
      <Buttons>
        <Btn
          onClick={() => counterStore.set({ count: rand() })}
          color={colors.warning}
          small
        >
          Random Count
        </Btn>
        <Btn
          onClick={() => counterStore.set({ step: rand() % 10 })}
          color={colors.warning}
          small
        >
          Random Step
        </Btn>
      </Buttons>
    </RenderTracker>
  );
};

// ─── Use Case 4 ───────────────────────────────────────────────────────────────
const UseCase4Demo = () => (
  <RenderTracker label="Lazy Store Example">
    <CodeBlock>
      {`// ❌ Problem: Circular imports
// storeA.ts imports storeB
// storeB.ts imports storeA
// Error: Cannot access before init

// ✅ Solution: Lazy callback
export const combined = CombineSquirrelStore(() => ({
  a: storeA,  // Resolved on first use
  b: storeB,
}));

// No circular import errors!`}
    </CodeBlock>
    {lazyAppStore.nodeValue((s) => (
      <div style={{ fontSize: "11px", marginTop: "8px" }}>
        Lazy works: {s.user.firstName} | {s.counter.count}
      </div>
    ))}
  </RenderTracker>
);

// ─── Main Export ──────────────────────────────────────────────────────────────
const UseCasesTab = () => (
  <div
    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
  >
    <Section title="Use nodeValue for Display" icon="🌿" color={colors.success}>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
      >
        <strong>When:</strong> Displaying values that need auto-updates
      </p>
      <UseCase1Demo />
      <InfoBox color={colors.success}>
        ✅ Granular re-renders
        <br />
        ✅ Parent component doesn't re-render
        <br />✅ Best for: UI display, lists, forms
      </InfoBox>
    </Section>

    <Section
      title="Use rawValue.static for Handlers"
      icon="📷"
      color={colors.info}
    >
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
      >
        <strong>When:</strong> Reading state in event handlers
      </p>
      <UseCase2Demo />
      <InfoBox color={colors.info}>
        ✅ Zero re-renders from store changes
        <br />
        ✅ Best for: onClick, onSubmit, calculations
        <br />✅ Read + Write without subscribing
      </InfoBox>
    </Section>

    <Section
      title="Use rawValue.reactive for Debug"
      icon="🔍"
      color={colors.warning}
    >
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
      >
        <strong>When:</strong> You need entire state (debug, logging)
      </p>
      <UseCase3Demo />
      <InfoBox color={colors.warning}>
        ⚠️ Re-renders on ANY change - use sparingly!
        <br />
        ✅ Best for: Debug panels, dev tools
        <br />✅ When you truly need full state object
      </InfoBox>
    </Section>

    <Section
      title="Use Lazy for Circular Imports"
      icon="🔁"
      color={colors.error}
    >
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
      >
        <strong>When:</strong> Stores import each other
      </p>
      <UseCase4Demo />
      <InfoBox color={colors.error}>
        ✅ Prevents "Cannot access before initialization"
        <br />
        ✅ Stores resolved on first access
        <br />✅ Same API after resolution
      </InfoBox>
    </Section>
  </div>
);

export default UseCasesTab;