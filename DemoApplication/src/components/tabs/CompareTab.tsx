import React, { useState, createContext, useContext } from "react";
import {
  userStore,
  counterStore,
} from "../../stores";
import { colors } from "../../constants/colors";
import RenderTracker from "../ui/RenderTracker";
import Val from "../ui/Val";
import Code from "../ui/Code";
import Btn from "../ui/Btn";
import Buttons from "../ui/Buttons";
import Section from "../ui/Section";
import InfoBox from "../ui/InfoBox";
import CodeBlock from "../ui/CodeBlock";

// ─── Helpers ────────────────────────────────────────────────────────────────
const rand = () => Math.floor(Math.random() * 100);

// ─── Props Demo ─────────────────────────────────────────────────────────────
const PropsFirstName = ({ firstName }: { firstName: string }) => (
  <RenderTracker label="📛 Name" compact>
    <Val>{firstName}</Val>
  </RenderTracker>
);

const PropsAge = ({ age }: { age: number }) => (
  <RenderTracker label="🎂 Age" compact>
    <Val>{age}</Val>
  </RenderTracker>
);

const PropsScore = ({ score }: { score: number }) => (
  <RenderTracker label="🏆 Score" compact>
    <Val>{score}</Val>
  </RenderTracker>
);

const PropsDemo = () => {
  const [state, setState] = useState({
    firstName: "John",
    age: 25,
    score: 100,
  });

  return (
    <RenderTracker label="👴 Parent (has state)">
      <PropsFirstName firstName={state.firstName} />
      <PropsAge age={state.age} />
      <PropsScore score={state.score} />
      <Buttons>
        <Btn
          color={colors.error}
          onClick={() =>
            setState((s) => ({ ...s, firstName: `User_${rand()}` }))
          }
        >
          Change Name
        </Btn>
        <Btn
          color={colors.error}
          onClick={() => setState((s) => ({ ...s, age: s.age + 1 }))}
        >
          +1 Age
        </Btn>
        <Btn
          color={colors.error}
          onClick={() => setState((s) => ({ ...s, score: s.score + 10 }))}
        >
          +10 Score
        </Btn>
      </Buttons>
    </RenderTracker>
  );
};

// ─── Context Demo ────────────────────────────────────────────────────────────
type CtxState = { firstName: string; age: number; score: number };

const Ctx = createContext<{
  state: CtxState;
  setState: React.Dispatch<React.SetStateAction<CtxState>>;
} | null>(null);

const CtxFirstName = () => {
  const { state } = useContext(Ctx)!;
  return (
    <RenderTracker label="📛 Name (useContext)" compact>
      <Val>{state.firstName}</Val>
    </RenderTracker>
  );
};

const CtxAge = () => {
  const { state } = useContext(Ctx)!;
  return (
    <RenderTracker label="🎂 Age (useContext)" compact>
      <Val>{state.age}</Val>
    </RenderTracker>
  );
};

const CtxScore = () => {
  const { state } = useContext(Ctx)!;
  return (
    <RenderTracker label="🏆 Score (useContext)" compact>
      <Val>{state.score}</Val>
    </RenderTracker>
  );
};

const CtxButtons = () => {
  const { setState } = useContext(Ctx)!;
  return (
    <Buttons>
      <Btn
        color={colors.error}
        onClick={() =>
          setState((s) => ({ ...s, firstName: `User_${rand()}` }))
        }
      >
        Change Name
      </Btn>
      <Btn
        color={colors.error}
        onClick={() => setState((s) => ({ ...s, age: s.age + 1 }))}
      >
        +1 Age
      </Btn>
      <Btn
        color={colors.error}
        onClick={() => setState((s) => ({ ...s, score: s.score + 10 }))}
      >
        +10 Score
      </Btn>
    </Buttons>
  );
};

const ContextDemo = () => {
  const [state, setState] = useState<CtxState>({
    firstName: "John",
    age: 25,
    score: 100,
  });

  return (
    <Ctx.Provider value={{ state, setState }}>
      <RenderTracker label="👴 Context Provider">
        <CtxFirstName />
        <CtxAge />
        <CtxScore />
        <CtxButtons />
      </RenderTracker>
    </Ctx.Provider>
  );
};

// ─── Squirrel Demo ───────────────────────────────────────────────────────────
const SquirrelFirstName = () => (
  <RenderTracker label="📛 Name (nodeValue)" compact>
    <Val>{userStore.nodeValue.firstName}</Val>
  </RenderTracker>
);

const SquirrelAge = () => (
  <RenderTracker label="🎂 Age (nodeValue)" compact>
    <Val>{userStore.nodeValue.age}</Val>
  </RenderTracker>
);

const SquirrelScore = () => (
  <RenderTracker label="🏆 Count (nodeValue)" compact>
    <Val>{counterStore.nodeValue.count}</Val>
  </RenderTracker>
);

const SquirrelDemo = () => (
  <RenderTracker label="👴 Parent (stateless!)">
    <SquirrelFirstName />
    <SquirrelAge />
    <SquirrelScore />
    <Buttons>
      <Btn
        color={colors.success}
        onClick={() => userStore.set({ firstName: `User_${rand()}` })}
      >
        Change Name
      </Btn>
      <Btn
        color={colors.success}
        onClick={() => {
          const curr = userStore.rawValue.static.age;
          userStore.set({ age: curr + 1 });
        }}
      >
        +1 Age
      </Btn>
      <Btn
        color={colors.success}
        onClick={() => {
          const curr = counterStore.rawValue.static.count;
          counterStore.set({ count: curr + 10 });
        }}
      >
        +10 Count
      </Btn>
    </Buttons>
  </RenderTracker>
);

// ─── Summary ─────────────────────────────────────────────────────────────────
const CompareSummary = () => (
  <div
    style={{
      marginTop: "20px",
      padding: "16px",
      backgroundColor: colors.card,
      borderRadius: "12px",
      border: `1px solid ${colors.success}`,
    }}
  >
    <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: colors.text }}>
      📊 Comparison Summary
    </h3>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "16px",
        fontSize: "11px",
      }}
    >
      {[
        {
          title: "Props Drilling",
          color: colors.error,
          items: [
            "Parent re-renders children",
            "Deep prop passing needed",
            "All siblings affected",
          ],
        },
        {
          title: "React Context",
          color: colors.error,
          items: [
            "ALL consumers re-render",
            "No granular subscriptions",
            "Provider wrapper required",
          ],
        },
        {
          title: "Squirrel 🐿️",
          color: colors.success,
          items: [
            "Only affected value updates",
            "Per-property subscriptions",
            "No providers needed!",
          ],
        },
      ].map(({ title, color, items }) => (
        <div key={title}>
          <h4 style={{ margin: "0 0 6px", color }}>{title}</h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: "16px",
              color: colors.textMuted,
              lineHeight: 1.8,
            }}
          >
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Export ─────────────────────────────────────────────────────────────
const CompareTab = () => (
  <>
    {/* Instructions */}
    <div
      style={{
        padding: "16px",
        backgroundColor: colors.card,
        borderRadius: "12px",
        marginBottom: "20px",
        textAlign: "center",
        border: `1px solid ${colors.border}`,
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: "16px", color: colors.text }}>
        👆 Click any button and watch the render counts!
      </h2>
      <p style={{ margin: 0, color: colors.textMuted, fontSize: "13px" }}>
        <span style={{ color: colors.error }}>Red (Problem)</span>: ALL
        components re-render |{" "}
        <span style={{ color: colors.success }}>Green (Squirrel)</span>: ONLY
        affected component updates
      </p>
    </div>

    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
    >
      <Section title="React + Props Drilling" icon="❌" type="problem">
        <p
          style={{
            color: colors.textMuted,
            fontSize: "11px",
            margin: "0 0 8px",
          }}
        >
          Parent state change = ALL children re-render! 😱
        </p>
        <PropsDemo />
        <InfoBox color={colors.error}>
          ⚠️ Click any button → ALL 4 components flash red!
          <br />
          ⚠️ Changing "Name" re-renders Age and Score too (wasted!)
        </InfoBox>
      </Section>

      <Section title="Squirrel (nodeValue)" icon="✅" type="solution">
        <p
          style={{
            color: colors.textMuted,
            fontSize: "11px",
            margin: "0 0 8px",
          }}
        >
          Only the changed value updates! 🎉
        </p>
        <SquirrelDemo />
        <InfoBox color={colors.success}>
          ✅ Click "Change Name" → ONLY Name flashes!
          <br />
          ✅ Parent stays at render count 1!
          <br />✅ Other values don't re-render!
        </InfoBox>
      </Section>

      <Section title="React Context" icon="❌" type="problem">
        <p
          style={{
            color: colors.textMuted,
            fontSize: "11px",
            margin: "0 0 8px",
          }}
        >
          ANY context change = ALL consumers re-render! 😱
        </p>
        <ContextDemo />
        <InfoBox color={colors.error}>
          ⚠️ useContext causes ALL consumers to re-render
          <br />
          ⚠️ No way to subscribe to just one property
          <br />
          ⚠️ Even buttons component re-renders!
        </InfoBox>
      </Section>

      <Section title="How Squirrel Works" icon="💡" type="solution">
        <p
          style={{
            color: colors.textMuted,
            fontSize: "11px",
            margin: "0 0 8px",
          }}
        >
          Each <Code>nodeValue.property</Code> is an independent subscription!
        </p>
        <CodeBlock>
          {`// Traditional React (re-renders entire tree)
const [state, setState] = useState({...});
<Name name={state.name} />  // Re-renders on ANY change

// Squirrel (granular updates)
<div>{userStore.nodeValue.firstName}</div>  // Only firstName
<div>{userStore.nodeValue.age}</div>        // Only age

// nodeValue returns a React element
// that internally subscribes to ONLY that property!`}
        </CodeBlock>
        <InfoBox color={colors.success}>
          ✅ No prop drilling
          <br />
          ✅ No context providers needed
          <br />✅ Just import store and use!
        </InfoBox>
      </Section>
    </div>

    <CompareSummary />
  </>
);

export default CompareTab;