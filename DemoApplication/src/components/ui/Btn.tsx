import React from "react";
import { colors } from "../../constants/colors";

interface BtnProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
  small?: boolean;
}

const Btn = ({
  onClick,
  children,
  color = colors.accent,
  small = false,
}: BtnProps) => (
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

export default Btn;