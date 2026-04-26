import React from "react";
import { colors } from "../../constants/colors";

interface InfoBoxProps {
  children: React.ReactNode;
  color?: string;
}

const InfoBox = ({ children, color = colors.accent }: InfoBoxProps) => (
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

export default InfoBox;