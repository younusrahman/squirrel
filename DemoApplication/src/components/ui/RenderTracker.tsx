import React, { useRef, useLayoutEffect } from "react";
import { colors } from "../../constants/colors";

interface RenderTrackerProps {
  label: string;
  children?: React.ReactNode;
  compact?: boolean;
}

const RenderTracker = ({
  label,
  children,
  compact = false,
}: RenderTrackerProps) => {
  const renderCount = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const isFirst = useRef(true);

  renderCount.current++;

  useLayoutEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    const box = boxRef.current;
    const badge = badgeRef.current;
    if (!box || !badge) return;

    box.style.borderColor = colors.flash;
    box.style.backgroundColor = `${colors.flash}15`;
    badge.style.backgroundColor = colors.flash;

    const timer = setTimeout(() => {
      box.style.borderColor = colors.border;
      box.style.backgroundColor = colors.card;
      badge.style.backgroundColor = colors.accent;
    }, 300);

    return () => clearTimeout(timer);
  });

  return (
    <div
      ref={boxRef}
      style={{
        padding: compact ? "8px 12px" : "10px 14px",
        margin: "4px 0",
        borderRadius: "8px",
        border: `2px solid ${colors.border}`,
        backgroundColor: colors.card,
        transition: "all 0.15s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: colors.text,
            fontWeight: 500,
            fontSize: compact ? "11px" : "13px",
          }}
        >
          {label}
        </span>
        <span
          ref={badgeRef}
          style={{
            padding: "2px 8px",
            borderRadius: "10px",
            fontSize: "10px",
            fontWeight: 700,
            backgroundColor: colors.accent,
            color: "#fff",
            transition: "background-color 0.15s",
          }}
        >
          {renderCount.current}
        </span>
      </div>
      {children && <div style={{ marginTop: "8px" }}>{children}</div>}
    </div>
  );
};

export default RenderTracker;
