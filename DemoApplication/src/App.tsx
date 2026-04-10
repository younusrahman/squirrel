import React, {
  useState,
  useRef,
  useLayoutEffect,
  createContext,
  useContext,
} from "react";
import {
  userStore,
  counterStore,
  settingsStore,
  appStore,
  lazyAppStore,
} from "./stores";

// ============================================================================
// STYLES
// ============================================================================

const colors = {
  bg: "#0a0a0f",
  card: "#12121a",
  cardAlt: "#1a1a25",
  border: "#2a2a3a",
  accent: "#7c3aed",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  text: "#e2e8f0",
  textMuted: "#64748b",
  flash: "#ef4444",
};

// ============================================================================
// RENDER TRACKER - DOM-based flash (no state!)
// ============================================================================

const RenderTracker = ({
  label,
  children,
  compact = false,
}: {
  label: string;
  children?: React.ReactNode;
  compact?: boolean;
}) => {
  const renderCount = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const isFirst = useRef(true);

  renderCount.current++;

  useLayoutEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    const box = boxRef.current;
    const badge = badgeRef.current;
    if (!box || !badge) return;

    box.style.borderColor = colors.flash;
    box.style.backgroundColor = `${colors.flash}15`;
    badge.style.backgroundColor = colors.flash;

    const timer = setTimeout(() => {
      box.style.borderColor = colors.border;
      box.style.backgroundColor = colors.card;
      badge.style.backgroundColor = colors.accent;
    }, 300);

    return () => clearTimeout(timer);
  });

  return (
    <div
      ref={boxRef}
      style={{
        padding: compact ? "8px 12px" : "10px 14px",
        margin: "4px 0",
        borderRadius: "8px",
        border: `2px solid ${colors.border}`,
        backgroundColor: colors.card,
        transition: "all 0.15s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: colors.text,
            fontWeight: 500,
            fontSize: compact ? "11px" : "13px",
          }}
        >
          {label}
        </span>
        <span
          ref={badgeRef}
          style={{
            padding: "2px 8px",
            borderRadius: "10px",
            fontSize: "10px",
            fontWeight: 700,
            backgroundColor: colors.accent,
            color: "#fff",
            transition: "background-color 0.15s",
          }}
        >
          {renderCount.current}
        </span>
      </div>
      {children && <div style={{ marginTop: "8px" }}>{children}</div>}
    </div>
  );
};

// ============================================================================
// HELPERS
// ============================================================================

const rand = () => Math.floor(Math.random() * 100);

const Val = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: "16px", fontWeight: 700, color: colors.text }}>
    {children}
  </span>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code
    style={{
      padding: "2px 6px",
      backgroundColor: colors.cardAlt,
      borderRadius: "4px",
      fontSize: "11px",
      color: colors.accent,
      fontFamily: "monospace",
    }}
  >
    {children}
  </code>
);

const Btn = ({
  onClick,
  children,
  color = colors.accent,
  small = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
  small?: boolean;
}) => (
  <button
    onClick={onClick}
    style={{
      padding: small ? "5px 10px" : "7px 12px",
      backgroundColor: color,
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      fontSize: small ? "10px" : "11px",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const Buttons = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}
  >
    {children}
  </div>
);

const Section = ({
  title,
  icon,
  color = colors.accent,
  type,
  children,
}: {
  title: string;
  icon: string;
  color?: string;
  type?: "problem" | "solution";
  children: React.ReactNode;
}) => {
  const borderColor =
    type === "problem"
      ? colors.error
      : type === "solution"
        ? colors.success
        : color;

  return (
    <div
      style={{
        backgroundColor: colors.card,
        borderRadius: "12px",
        border: `2px solid ${borderColor}`,
        overflow: "hidden",
        height: "fit-content",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          backgroundColor: `${borderColor}20`,
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{ color: colors.text, fontWeight: 600, fontSize: "13px" }}>
          {title}
        </span>
        {type && (
          <span
            style={{
              marginLeft: "auto",
              padding: "2px 8px",
              borderRadius: "10px",
              fontSize: "9px",
              fontWeight: 600,
              backgroundColor: borderColor,
              color: "#fff",
            }}
          >
            {type === "problem" ? "PROBLEM" : "SOLUTION"}
          </span>
        )}
      </div>
      <div style={{ padding: "12px" }}>{children}</div>
    </div>
  );
};

const InfoBox = ({
  children,
  color = colors.accent,
}: {
  children: React.ReactNode;
  color?: string;
}) => (
  <div
    style={{
      marginTop: "10px",
      padding: "10px 12px",
      backgroundColor: `${color}10`,
      border: `1px solid ${color}30`,
      borderRadius: "6px",
      fontSize: "11px",
      color: colors.textMuted,
      lineHeight: 1.6,
    }}
  >
    {children}
  </div>
);

const CodeBlock = ({ children }: { children: string }) => (
  <pre
    style={{
      margin: "10px 0 0",
      padding: "12px",
      backgroundColor: colors.cardAlt,
      borderRadius: "6px",
      fontSize: "10px",
      lineHeight: 1.5,
      overflow: "auto",
      color: colors.textMuted,
    }}
  >
    {children}
  </pre>
);

// ============================================================================
// TAB 1: PROBLEM VS SOLUTION (Props, Context vs Squirrel)
// ============================================================================

// --- PROBLEM 1: REACT PROPS ---

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

// --- PROBLEM 2: REACT CONTEXT ---

const Ctx = createContext<{
  state: { firstName: string; age: number; score: number };
  setState: React.Dispatch<
    React.SetStateAction<{ firstName: string; age: number; score: number }>
  >;
} | null>(null);

const ContextDemo = () => {
  const [state, setState] = useState({
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
        onClick={() => setState((s) => ({ ...s, firstName: `User_${rand()}` }))}
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

// --- SOLUTION: SQUIRREL ---

const SquirrelDemo = () => {
  return (
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
};

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

// --- COMPARISON TAB CONTENT ---

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
      {/* Problem: Props */}
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

      {/* Solution: Squirrel nodeValue */}
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

      {/* Problem: Context */}
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

      {/* Solution: Why Squirrel Works */}
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

    {/* Summary */}
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
        <div>
          <h4 style={{ margin: "0 0 6px", color: colors.error }}>
            Props Drilling
          </h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: "16px",
              color: colors.textMuted,
              lineHeight: 1.8,
            }}
          >
            <li>Parent re-renders children</li>
            <li>Deep prop passing needed</li>
            <li>All siblings affected</li>
          </ul>
        </div>
        <div>
          <h4 style={{ margin: "0 0 6px", color: colors.error }}>
            React Context
          </h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: "16px",
              color: colors.textMuted,
              lineHeight: 1.8,
            }}
          >
            <li>ALL consumers re-render</li>
            <li>No granular subscriptions</li>
            <li>Provider wrapper required</li>
          </ul>
        </div>
        <div>
          <h4 style={{ margin: "0 0 6px", color: colors.success }}>
            Squirrel 🐿️
          </h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: "16px",
              color: colors.textMuted,
              lineHeight: 1.8,
            }}
          >
            <li>Only affected value updates</li>
            <li>Per-property subscriptions</li>
            <li>No providers needed!</li>
          </ul>
        </div>
      </div>
    </div>
  </>
);

// ============================================================================
// TAB 2: nodeValue DEMOS
// ============================================================================

const NodeValueTab = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
    {/* nodeValue.property */}
    <Section title="nodeValue.property" icon="1️⃣" color={colors.accent}>
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
      >
        Access individual properties. Each is independently reactive.
      </p>

      <RenderTracker label="firstName" compact>
        <Val>{userStore.nodeValue.firstName}</Val>
      </RenderTracker>

      <RenderTracker label="lastName" compact>
        <Val>{userStore.nodeValue.lastName}</Val>
      </RenderTracker>

      <RenderTracker label="age" compact>
        <Val>{userStore.nodeValue.age}</Val>
      </RenderTracker>

      <Buttons>
        <Btn onClick={() => userStore.set({ firstName: `User_${rand()}` })}>
          Change firstName
        </Btn>
        <Btn
          onClick={() => userStore.set({ lastName: `Last_${rand()}` })}
          color={colors.info}
        >
          Change lastName
        </Btn>
        <Btn
          onClick={() =>
            userStore.set({ age: userStore.rawValue.static.age + 1 })
          }
          color={colors.success}
        >
          +1 age
        </Btn>
      </Buttons>

      <InfoBox>
        ✅ Click "Change firstName" → Only firstName flashes!
        <br />✅ Each property = separate subscription
      </InfoBox>

      <CodeBlock>
        {`// Usage
{userStore.nodeValue.firstName}
{userStore.nodeValue.lastName}
{userStore.nodeValue.age}

// Returns React element that auto-updates`}
      </CodeBlock>
    </Section>

    {/* nodeValue(fn) */}
    <Section title="nodeValue((s) => ...)" icon="2️⃣" color={colors.info}>
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
      >
        Transform data. Auto-tracks which properties you access.
      </p>

      <RenderTracker label="Full Name (firstName + lastName)" compact>
        {userStore.nodeValue((s) => (
          <Val>
            {s.firstName} {s.lastName}
          </Val>
        ))}
      </RenderTracker>

      <RenderTracker label="Age Status" compact>
        {userStore.nodeValue((s) => (
          <Val>
            {s.age >= 18 ? "✅ Adult" : "👶 Minor"} ({s.age})
          </Val>
        ))}
      </RenderTracker>

      <RenderTracker label="email (separate)" compact>
        <Val>{userStore.nodeValue.email}</Val>
      </RenderTracker>

      <Buttons>
        <Btn onClick={() => userStore.set({ firstName: `First_${rand()}` })}>
          Change firstName
        </Btn>
        <Btn
          onClick={() => userStore.set({ email: `test${rand()}@mail.com` })}
          color={colors.warning}
        >
          Change email
        </Btn>
      </Buttons>

      <InfoBox>
        ✅ "Full Name" re-renders when firstName OR lastName changes
        <br />✅ email changes don't affect Full Name!
      </InfoBox>

      <CodeBlock>
        {`// Transform & combine
{userStore.nodeValue((s) => (
  <span>{s.firstName} {s.lastName}</span>
))}

// Auto-tracks: firstName, lastName
// Ignores: email, age (not accessed)`}
      </CodeBlock>
    </Section>
  </div>
);

// ============================================================================
// TAB 3: rawValue DEMOS
// ============================================================================

const RawValueTab = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
    {/* rawValue.static */}
    <Section title="rawValue.static" icon="📷" color={colors.success}>
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
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

    {/* rawValue.reactive */}
    <Section title="rawValue.reactive" icon="🔴" color={colors.error}>
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
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
        style={{ color: colors.textMuted, fontSize: "11px", marginTop: "8px" }}
      >
        This component renders:{" "}
        <strong style={{ color: colors.success }}>{renderCount.current}</strong>{" "}
        (always 1!)
      </p>
      <p
        style={{ color: colors.textMuted, fontSize: "11px", marginTop: "4px" }}
      >
        But age updates here → {userStore.nodeValue.age}
      </p>
    </RenderTracker>
  );
};

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

// ============================================================================
// TAB 4: set / setAsync DEMOS
// ============================================================================

const SetMethodsTab = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
    {/* set() */}
    <Section title="set() - Immediate" icon="⚡" color={colors.warning}>
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
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

    {/* setAsync() */}
    <Section title="setAsync() - Batched" icon="🚀" color={colors.success}>
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
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
            counterStore.set({ count: counterStore.rawValue.static.count + 1 })
          }
          small
        >
          +1 Count
        </Btn>
      </Buttons>
    </RenderTracker>
  );
};

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
        style={{ color: colors.textMuted, fontSize: "10px", marginTop: "8px" }}
      >
        User: {userStore.nodeValue.firstName} | Font:{" "}
        {settingsStore.nodeValue.fontSize}px
      </p>
    </RenderTracker>
  );
};

// ============================================================================
// TAB 5: COMBINED STORES
// ============================================================================

const CombinedTab = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
    {/* Eager */}
    <Section
      title="CombineSquirrelStore({...})"
      icon="🔗"
      color={colors.accent}
    >
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
      >
        <strong>Eager:</strong> Stores resolved immediately at creation.
      </p>

      <EagerCombinedDemo />

      <CodeBlock>
        {`// stores.ts
import { CombineSquirrelStore } from "squirrel";

export const appStore = CombineSquirrelStore({
  user: userStore,
  counter: counterStore,
  settings: settingsStore,
});

// All stores linked immediately!`}
      </CodeBlock>
    </Section>

    {/* Lazy */}
    <Section
      title="CombineSquirrelStore(() => {...})"
      icon="💤"
      color={colors.warning}
    >
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
      >
        <strong>Lazy:</strong> Stores resolved on first access. Fixes circular
        imports!
      </p>

      <LazyCombinedDemo />

      <CodeBlock>
        {`// Lazy - resolved when first used
export const lazyStore = CombineSquirrelStore(() => ({
  user: userStore,
  counter: counterStore,
}));

// Why lazy?
// - Circular import prevention
// - Code splitting friendly
// - Deferred initialization`}
      </CodeBlock>
    </Section>

    {/* Combined nodeValue */}
    <Section title="combined.nodeValue" icon="🎯" color={colors.info}>
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
      >
        Access nested stores via nodeValue.
      </p>

      <CombinedNodeValueDemo />

      <CodeBlock>
        {`// Nested property access
{appStore.nodeValue.user.firstName}
{appStore.nodeValue.counter.count}

// Function syntax - combine multiple
{appStore.nodeValue((s) => (
  <span>
    {s.user.firstName}: {s.counter.count} pts
  </span>
))}`}
      </CodeBlock>
    </Section>

    {/* Combined set */}
    <Section title="combined.set / setAsync" icon="⚡" color={colors.success}>
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
      >
        Update multiple stores at once!
      </p>

      <CombinedSetDemo />

      <CodeBlock>
        {`// Update multiple stores
appStore.set({
  user: { firstName: "New" },
  counter: { count: 100 },
});

// Batched multi-store update
appStore.setAsync({
  user: { age: 30 },
  settings: { theme: "light" },
  counter: { step: 5 },
});`}
      </CodeBlock>
    </Section>
  </div>
);

const EagerCombinedDemo = () => (
  <RenderTracker label="appStore (Eager)">
    {appStore.nodeValue((s) => (
      <div style={{ fontSize: "11px", lineHeight: 1.8 }}>
        <div>
          👤 User:{" "}
          <strong>
            {s.user.firstName} {s.user.lastName}
          </strong>
        </div>
        <div>
          🔢 Count: <strong>{s.counter.count}</strong>
        </div>
        <div>
          🎨 Theme: <strong>{s.settings.theme}</strong>
        </div>
      </div>
    ))}
    <Buttons>
      <Btn
        onClick={() => appStore.set({ user: { firstName: `Eager_${rand()}` } })}
        small
      >
        user.firstName
      </Btn>
      <Btn
        onClick={() => appStore.set({ counter: { count: rand() } })}
        color={colors.success}
        small
      >
        counter.count
      </Btn>
    </Buttons>
  </RenderTracker>
);

const LazyCombinedDemo = () => (
  <RenderTracker label="lazyAppStore (Lazy)">
    {lazyAppStore.nodeValue((s) => (
      <div style={{ fontSize: "11px", lineHeight: 1.8 }}>
        <div>
          👤 User:{" "}
          <strong>
            {s.user.firstName} {s.user.lastName}
          </strong>
        </div>
        <div>
          🔢 Count: <strong>{s.counter.count}</strong>
        </div>
      </div>
    ))}
    <Buttons>
      <Btn
        onClick={() =>
          lazyAppStore.set({ user: { firstName: `Lazy_${rand()}` } })
        }
        color={colors.warning}
        small
      >
        user.firstName
      </Btn>
    </Buttons>
    <InfoBox color={colors.warning}>
      💡 Same API as eager - just resolved lazily!
    </InfoBox>
  </RenderTracker>
);

const CombinedNodeValueDemo = () => (
  <>
    <RenderTracker label="appStore.nodeValue.user.firstName" compact>
      <Val>{appStore.nodeValue.user.firstName}</Val>
    </RenderTracker>

    <RenderTracker label="appStore.nodeValue.counter.count" compact>
      <Val>{appStore.nodeValue.counter.count}</Val>
    </RenderTracker>

    <RenderTracker label="nodeValue((s) => s.user + s.counter)" compact>
      {appStore.nodeValue((s) => (
        <Val>
          {s.user.firstName} × {s.counter.count}
        </Val>
      ))}
    </RenderTracker>

    <Buttons>
      <Btn onClick={() => userStore.set({ firstName: `User_${rand()}` })} small>
        Change user
      </Btn>
      <Btn
        onClick={() =>
          counterStore.set({ count: counterStore.rawValue.static.count + 1 })
        }
        color={colors.success}
        small
      >
        +1 count
      </Btn>
    </Buttons>
  </>
);

const CombinedSetDemo = () => {
  const handleSetMultiple = () => {
    appStore.set({
      user: { firstName: `Multi_${rand()}` },
      counter: { count: rand() },
      settings: { fontSize: 12 + (rand() % 10) },
    });
  };

  const handleSetAsyncMultiple = () => {
    appStore.setAsync({
      user: { firstName: `Async_${rand()}` },
      counter: { count: rand() },
      settings: {
        theme:
          settingsStore.rawValue.static.theme === "dark" ? "light" : "dark",
      },
    });
  };

  return (
    <RenderTracker label="Combined State">
      {appStore.nodeValue((s) => (
        <div style={{ fontSize: "11px", lineHeight: 1.8 }}>
          <div>👤 {s.user.firstName}</div>
          <div>🔢 {s.counter.count}</div>
          <div>
            🔤 {s.settings.fontSize}px | {s.settings.theme}
          </div>
        </div>
      ))}
      <Buttons>
        <Btn onClick={handleSetMultiple} small>
          set() 3 stores
        </Btn>
        <Btn onClick={handleSetAsyncMultiple} color={colors.success} small>
          setAsync() 3 stores
        </Btn>
      </Buttons>
    </RenderTracker>
  );
};

// ============================================================================
// TAB 6: USE CASES
// ============================================================================

const UseCasesTab = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
    {/* Use Case 1: nodeValue for display */}
    <Section title="Use nodeValue for Display" icon="🌿" color={colors.success}>
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
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

    {/* Use Case 2: rawValue.static for handlers */}
    <Section
      title="Use rawValue.static for Handlers"
      icon="📷"
      color={colors.info}
    >
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
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

    {/* Use Case 3: rawValue.reactive for debug */}
    <Section
      title="Use rawValue.reactive for Debug"
      icon="🔍"
      color={colors.warning}
    >
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
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

    {/* Use Case 4: Lazy for circular imports */}
    <Section
      title="Use Lazy for Circular Imports"
      icon="🔁"
      color={colors.error}
    >
      <p
        style={{ color: colors.textMuted, fontSize: "11px", margin: "0 0 8px" }}
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

const UseCase1Demo = () => {
  const renderCount = useRef(0);
  renderCount.current++;

  return (
    <RenderTracker label={`Parent (renders: ${renderCount.current})`}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}
      >
        <div
          style={{
            padding: "8px",
            backgroundColor: colors.cardAlt,
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <div style={{ color: colors.textMuted, fontSize: "10px" }}>Name</div>
          <div style={{ fontWeight: 700 }}>{userStore.nodeValue.firstName}</div>
        </div>
        <div
          style={{
            padding: "8px",
            backgroundColor: colors.cardAlt,
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <div style={{ color: colors.textMuted, fontSize: "10px" }}>Age</div>
          <div style={{ fontWeight: 700 }}>{userStore.nodeValue.age}</div>
        </div>
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
        style={{ color: colors.textMuted, fontSize: "10px", marginTop: "6px" }}
      >
        👆 Parent stays at 1, values update independently!
      </p>
    </RenderTracker>
  );
};

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
        style={{ color: colors.textMuted, fontSize: "10px", marginTop: "8px" }}
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

// ============================================================================
// API QUICK REFERENCE
// ============================================================================

const ApiReference = () => (
  <div
    style={{
      marginTop: "24px",
      padding: "16px",
      backgroundColor: colors.card,
      borderRadius: "12px",
      border: `1px solid ${colors.border}`,
    }}
  >
    <h3 style={{ margin: "0 0 16px", fontSize: "14px", color: colors.text }}>
      📚 Quick API Reference
    </h3>

    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
    >
      <div>
        <h4
          style={{ margin: "0 0 8px", fontSize: "12px", color: colors.accent }}
        >
          Single Store
        </h4>
        <div
          style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.8 }}
        >
          <div>
            <Code>CreateSquirrelStore(initialState)</Code>
          </div>
          <div style={{ marginTop: "8px" }}>
            <div>
              • <Code>store.nodeValue.prop</Code> - Reactive leaf
            </div>
            <div>
              • <Code>store.nodeValue((s) =&gt; ...)</Code> - Transform
            </div>
            <div>
              • <Code>store.rawValue.static</Code> - Read, no subscribe
            </div>
            <div>
              • <Code>store.rawValue.reactive</Code> - Full subscription
            </div>
            <div>
              • <Code>store.set({"{...}"})</Code> - Immediate update
            </div>
            <div>
              • <Code>store.setAsync({"{...}"})</Code> - Batched update
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4
          style={{ margin: "0 0 8px", fontSize: "12px", color: colors.warning }}
        >
          Combined Store
        </h4>
        <div
          style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.8 }}
        >
          <div>
            <Code>CombineSquirrelStore({"{...}"})</Code> - Eager
          </div>
          <div>
            <Code>CombineSquirrelStore(() =&gt; ({"{...}"}))</Code> - Lazy
          </div>
          <div style={{ marginTop: "8px" }}>
            <div>
              • <Code>combined.nodeValue.store.prop</Code>
            </div>
            <div>
              • <Code>combined.nodeValue((s) =&gt; ...)</Code>
            </div>
            <div>
              • <Code>combined.rawValue.static</Code>
            </div>
            <div>
              • <Code>combined.rawValue.reactive</Code>
            </div>
            <div>
              • <Code>combined.set({"{store: {...}}"})</Code>
            </div>
            <div>
              • <Code>combined.setAsync({"{store: {...}}"})</Code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// TAB NAVIGATION
// ============================================================================

type TabId =
  | "compare"
  | "nodeValue"
  | "rawValue"
  | "setMethods"
  | "combined"
  | "useCases";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "compare", label: "Problem vs Solution", icon: "🔍" },
  { id: "nodeValue", label: "nodeValue", icon: "🎯" },
  { id: "rawValue", label: "rawValue", icon: "📦" },
  { id: "setMethods", label: "set / setAsync", icon: "⚡" },
  { id: "combined", label: "Combined", icon: "🔗" },
  { id: "useCases", label: "Use Cases", icon: "💡" },
];

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [tab, setTab] = useState<TabId>("compare");

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        minHeight: "100vh",
        color: colors.text,
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "16px",
      }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "26px",
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.success})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🐿️ Squirrel Demo
        </h1>
        <p
          style={{
            color: colors.textMuted,
            margin: "0 0 12px",
            fontSize: "13px",
          }}
        >
          Granular React state management - See the problem, see the solution!
        </p>

        {/* Legend */}
        <div
          style={{
            display: "inline-flex",
            gap: "16px",
            padding: "8px 16px",
            backgroundColor: colors.card,
            borderRadius: "8px",
            fontSize: "11px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: colors.flash,
                borderRadius: "3px",
              }}
            />
            <span style={{ color: colors.textMuted }}>Re-rendered</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                padding: "1px 6px",
                backgroundColor: colors.accent,
                borderRadius: "6px",
                fontSize: "9px",
                fontWeight: 700,
              }}
            >
              3
            </span>
            <span style={{ color: colors.textMuted }}>Render count</span>
          </span>
        </div>
      </header>

      {/* Tabs */}
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "6px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 14px",
              backgroundColor: tab === t.id ? colors.accent : "transparent",
              color: tab === t.id ? "#fff" : colors.textMuted,
              border: `1px solid ${tab === t.id ? colors.accent : colors.border}`,
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {tab === "compare" && <CompareTab />}
        {tab === "nodeValue" && <NodeValueTab />}
        {tab === "rawValue" && <RawValueTab />}
        {tab === "setMethods" && <SetMethodsTab />}
        {tab === "combined" && <CombinedTab />}
        {tab === "useCases" && <UseCasesTab />}

        <ApiReference />
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: "32px",
          textAlign: "center",
          color: colors.textMuted,
          fontSize: "12px",
        }}
      >
        🐿️ Squirrel - Lightweight granular state for React
      </footer>
    </div>
  );
}
