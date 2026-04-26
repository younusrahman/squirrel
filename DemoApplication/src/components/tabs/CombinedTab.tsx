import React from "react";
import {
  userStore,
  counterStore,
  settingsStore,
  appStore,
  lazyAppStore,
} from "../../stores";
import { colors } from "../../constants/colors";
import RenderTracker from "../ui/RenderTracker";
import Val from "../ui/Val";
import Btn from "../ui/Btn";
import Buttons from "../ui/Buttons";
import Section from "../ui/Section";
import InfoBox from "../ui/InfoBox";
import CodeBlock from "../ui/CodeBlock";

const rand = () => Math.floor(Math.random() * 100);

// ─── Eager ────────────────────────────────────────────────────────────────────
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
        onClick={() =>
          appStore.set({ user: { firstName: `Eager_${rand()}` } })
        }
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

// ─── Lazy ─────────────────────────────────────────────────────────────────────
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

// ─── nodeValue ────────────────────────────────────────────────────────────────
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
      <Btn
        onClick={() => userStore.set({ firstName: `User_${rand()}` })}
        small
      >
        Change user
      </Btn>
      <Btn
        onClick={() =>
          counterStore.set({
            count: counterStore.rawValue.static.count + 1,
          })
        }
        color={colors.success}
        small
      >
        +1 count
      </Btn>
    </Buttons>
  </>
);

// ─── Combined set ─────────────────────────────────────────────────────────────
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

// ─── Main Export ──────────────────────────────────────────────────────────────
const CombinedTab = () => (
  <div
    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
  >
    <Section
      title="CombineSquirrelStore({...})"
      icon="🔗"
      color={colors.accent}
    >
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
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

    <Section
      title="CombineSquirrelStore(() => {...})"
      icon="💤"
      color={colors.warning}
    >
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
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

    <Section title="combined.nodeValue" icon="🎯" color={colors.info}>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
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

    <Section title="combined.set / setAsync" icon="⚡" color={colors.success}>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
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

export default CombinedTab;