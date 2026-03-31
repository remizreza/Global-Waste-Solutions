import React from "react";

type Props = {
  className?: string;
  showRegistered?: boolean;
};

export default function RedoxyWordmark({
  className = "",
  showRegistered = true,
}: Props) {
  const blue = "#0B3B9E";
  const orange = "#FF7A00";
  const white = "#FFFFFF";

  return (
    <span
      className={`inline-flex items-start font-extrabold leading-none ${className}`}
      style={{
        letterSpacing: "-0.03em",
        textTransform: "uppercase",
      }}
      aria-label="REDOXY"
    >
      <span style={{ color: orange, textShadow: "0 1px 0 rgba(0,0,0,0.35)" }}>R</span>
      <span style={{ color: white }}>E</span>
      <span style={{ color: blue, textShadow: "0 1px 0 rgba(0,0,0,0.35)" }}>DO</span>
      <span style={{ color: orange, textShadow: "0 1px 0 rgba(0,0,0,0.35)" }}>XY</span>
      {showRegistered ? (
        <span
          style={{
            color: orange,
            fontSize: "0.42em",
            lineHeight: 1,
            marginLeft: "0.18em",
            marginTop: "0.12em",
          }}
        >
          ®
        </span>
      ) : null}
    </span>
  );
}
