import React from "react";
import { colors } from "../../constants/colors";

interface SectionProps {
  title: string;
  icon: string;
  color?: string;
  type?: "problem" | "solution";
  children: React.ReactNode;
}

const Section = ({
  title,
  icon,
  color = colors.accent,
  type,
  children,
}: SectionProps) => {
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

export default Section;