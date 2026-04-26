import React from "react";
import { colors } from "../../constants/colors";
import Code from "../ui/Code";

const API_SINGLE = [
  { code: "store.nodeValue.prop", desc: "Reactive leaf" },
  { code: "store.nodeValue((s) => ...)", desc: "Transform" },
  { code: "store.rawValue.static", desc: "Read, no subscribe" },
  { code: "store.rawValue.reactive", desc: "Full subscription" },
  { code: "store.set({...})", desc: "Immediate update" },
  { code: "store.setAsync({...})", desc: "Batched update" },
];

const API_COMBINED = [
  { code: "combined.nodeValue.store.prop", desc: "" },
  { code: "combined.nodeValue((s) => ...)", desc: "" },
  { code: "combined.rawValue.static", desc: "" },
  { code: "combined.rawValue.reactive", desc: "" },
  { code: "combined.set({store: {...}})", desc: "" },
  { code: "combined.setAsync({store: {...}})", desc: "" },
];

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
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
      }}
    >
      {/* Single Store */}
      <div>
        <h4
          style={{
            margin: "0 0 8px",
            fontSize: "12px",
            color: colors.accent,
          }}
        >
          Single Store
        </h4>
        <div
          style={{
            fontSize: "11px",
            color: colors.textMuted,
            lineHeight: 1.8,
          }}
        >
          <div>
            <Code>CreateSquirrelStore(initialState)</Code>
          </div>
          <div style={{ marginTop: "8px" }}>
            {API_SINGLE.map(({ code }) => (
              <div key={code}>
                • <Code>{code}</Code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Combined Store */}
      <div>
        <h4
          style={{
            margin: "0 0 8px",
            fontSize: "12px",
            color: colors.warning,
          }}
        >
          Combined Store
        </h4>
        <div
          style={{
            fontSize: "11px",
            color: colors.textMuted,
            lineHeight: 1.8,
          }}
        >
          <div>
            <Code>CombineSquirrelStore({"{}"})</Code> - Eager
          </div>
          <div>
            <Code>CombineSquirrelStore(() ={">"} ({"{}"}))</Code> - Lazy
          </div>
          <div style={{ marginTop: "8px" }}>
            {API_COMBINED.map(({ code }) => (
              <div key={code}>
                • <Code>{code}</Code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ApiReference;