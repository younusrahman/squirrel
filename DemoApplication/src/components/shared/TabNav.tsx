import React from "react";
import { colors } from "../../constants/colors";

export type TabId =
  | "compare"
  | "nodeValue"
  | "rawValue"
  | "setMethods"
  | "combined"
  | "useCases";

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "compare", label: "Problem vs Solution", icon: "🔍" },
  { id: "nodeValue", label: "nodeValue", icon: "🎯" },
  { id: "rawValue", label: "rawValue", icon: "📦" },
  { id: "setMethods", label: "set / setAsync", icon: "⚡" },
  { id: "combined", label: "Combined", icon: "🔗" },
  { id: "useCases", label: "Use Cases", icon: "💡" },
];

interface TabNavProps {
  activeTab: TabId;
  onChange: (id: TabId) => void;
}

const TabNav = ({ activeTab, onChange }: TabNavProps) => (
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
        onClick={() => onChange(t.id)}
        style={{
          padding: "8px 14px",
          backgroundColor: activeTab === t.id ? colors.accent : "transparent",
          color: activeTab === t.id ? "#fff" : colors.textMuted,
          border: `1px solid ${
            activeTab === t.id ? colors.accent : colors.border
          }`,
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
);

export default TabNav;