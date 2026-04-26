import React, { useState } from "react";
import { colors } from "./constants/colors";
import TabNav, { type TabId } from "./components/shared/TabNav";
import ApiReference from "./components/shared/ApiReference";
import CompareTab from "./components/tabs/CompareTab";
import NodeValueTab from "./components/tabs/NodeValueTab";
import RawValueTab from "./components/tabs/RawValueTab";
import SetMethodsTab from "./components/tabs/SetMethodsTab";
import CombinedTab from "./components/tabs/CombinedTab";
import UseCasesTab from "./components/tabs/UseCasesTab";

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = () => (
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
);

// ─── Tab Content ──────────────────────────────────────────────────────────────
const TAB_CONTENT: Record<TabId, React.ReactNode> = {
  compare: <CompareTab />,
  nodeValue: <NodeValueTab />,
  rawValue: <RawValueTab />,
  setMethods: <SetMethodsTab />,
  combined: <CombinedTab />,
  useCases: <UseCasesTab />,
};

// ─── App ──────────────────────────────────────────────────────────────────────
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
      <Header />
      <TabNav activeTab={tab} onChange={setTab} />

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {TAB_CONTENT[tab]}
        <ApiReference />
      </div>

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
