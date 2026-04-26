import React, { useRef } from "react";
import { userStore } from "../../stores";
import { colors } from "../../constants/colors";
import RenderTracker from "../ui/RenderTracker";
import Btn from "../ui/Btn";
import Buttons from "../ui/Buttons";
import Section from "../ui/Section";
import InfoBox from "../ui/InfoBox";
import CodeBlock from "../ui/CodeBlock";

const rand = () => Math.floor(Math.random() * 100);

// ─── Static Reader ────────────────────────────────────────────────────────────
const StaticReaderDemo = () => {
  const renderCount = useRef(0);
  renderCount.current++;

  const handleRead = () => {
    const state = userStore.rawValue.static;
    alert(`rawValue.static:\n\n${JSON.stringify(state, null, 2)}`);
  };

  const handleIncrement = () => {
    const current = userStore.rawValue.static.age;
    userStore.set({ age: current + 5 });
  };

  return (
    <RenderTracker label="Static Reader Component">
      <Buttons>
        <Btn onClick={handleRead} color={colors.success}>
          Read State
        </Btn>
        <Btn onClick={handleIncrement} color={colors.warning}>
          +5 Age (no re-render here!)
        </Btn>
      </Buttons>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          marginTop: "8px",
        }}
      >
        This component renders:{" "}
        <strong style={{ color: colors.success }}>{renderCount.current}</strong>{" "}
        (always 1!)
      </p>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          marginTop: "4px",
        }}
      >
        But age updates here → {userStore.nodeValue.age}
      </p>
    </RenderTracker>
  );
};

// ─── Reactive Reader ──────────────────────────────────────────────────────────
const ReactiveReaderDemo = () => {
  const state = userStore.rawValue.reactive;

  return (
    <RenderTracker label="Reactive Reader (re-renders on ANY change!)">
      <div
        style={{
          padding: "8px",
          backgroundColor: colors.cardAlt,
          borderRadius: "6px",
          fontSize: "10px",
          fontFamily: "monospace",
          maxHeight: "100px",
          overflow: "auto",
        }}
      >
        {JSON.stringify(state, null, 2)}
      </div>
      <Buttons>
        <Btn
          onClick={() => userStore.set({ firstName: `User_${rand()}` })}
          color={colors.error}
          small
        >
          Change firstName
        </Btn>
        <Btn
          onClick={() => userStore.set({ email: `test${rand()}@mail.com` })}
          color={colors.error}
          small
        >
          Change email
        </Btn>
        <Btn
          onClick={() => userStore.set({ isOnline: !state.isOnline })}
          color={colors.error}
          small
        >
          Toggle isOnline
        </Btn>
      </Buttons>
    </RenderTracker>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
const RawValueTab = () => (
  <div
    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
  >
    <Section title="rawValue.static" icon="📷" color={colors.success}>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
      >
        Read state WITHOUT subscribing. Zero re-renders!
      </p>
      <StaticReaderDemo />
      <InfoBox color={colors.success}>
        ✅ Perfect for event handlers
        <br />
        ✅ Read current values anytime
        <br />✅ Component never re-renders from store changes
      </InfoBox>
      <CodeBlock>
        {`// In event handlers - no subscription!
const handleClick = () => {
  const state = userStore.rawValue.static;
  console.log(state.firstName);
  
  // Read + Write pattern
  const age = userStore.rawValue.static.age;
  userStore.set({ age: age + 1 });
};`}
      </CodeBlock>
    </Section>

    <Section title="rawValue.reactive" icon="🔴" color={colors.error}>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
      >
        Subscribe to ENTIRE state. Re-renders on ANY change!
      </p>
      <ReactiveReaderDemo />
      <InfoBox color={colors.error}>
        ⚠️ Re-renders on ANY property change
        <br />
        ⚠️ Use only when you need full state
        <br />
        ⚠️ Prefer nodeValue for granular updates
      </InfoBox>
      <CodeBlock>
        {`// Full state subscription
const DebugPanel = () => {
  // Re-renders on ANY change!
  const state = userStore.rawValue.reactive;
  return <pre>{JSON.stringify(state)}</pre>;
};

// Use sparingly - debug panels, etc.`}
      </CodeBlock>
    </Section>
  </div>
);

export default RawValueTab;