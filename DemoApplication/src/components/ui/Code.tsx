import React from "react";
import { colors } from "../../constants/colors";

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

export default Code;