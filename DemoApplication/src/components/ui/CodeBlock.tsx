import React from "react";
import { colors } from "../../constants/colors";

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

export default CodeBlock;