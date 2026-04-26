import React from "react";
import { colors } from "../../constants/colors";

const Val = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: "16px", fontWeight: 700, color: colors.text }}>
    {children}
  </span>
);

export default Val;