import React from "react";

const Buttons = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      gap: "6px",
      marginTop: "10px",
      flexWrap: "wrap",
    }}
  >
    {children}
  </div>
);

export default Buttons;