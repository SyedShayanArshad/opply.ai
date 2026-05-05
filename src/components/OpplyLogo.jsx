import React from "react";

const OpplyLogo = ({ width = 120, height = 80, className = "" }) => {
  return (
    <svg
      viewBox="0 0 200 60"
      width={width}
      height={height}
      className={className}
      role="img"
      style={{ display: "block", overflow: "visible" }}
    >
      <title>Opply AI</title>

      {/* ── Icon: box + star, left-aligned ── */}
      <g transform="translate(6, 6)">
        <rect
          x="0"
          y="18"
          width="36"
          height="26"
          rx="3"
          fill="none"
          stroke="#a3e635"
          strokeWidth="2"
        />
        <path
          d="M2 18 L18 29 L34 18"
          fill="none"
          stroke="#a3e635"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M18 2 C18 9 22 12 28 12 C22 12 18 15 18 22 C18 15 14 12 8 12 C14 12 18 9 18 2 Z"
          fill="#a3e635"
        />
        <path
          d="M30 4 C30 7 32 9 35 9 C32 9 30 11 30 13 C30 11 28 9 25 9 C28 9 30 7 30 4 Z"
          fill="#a3e635"
          opacity="0.55"
        />
      </g>

      {/* ── Wordmark ── */}
      <text
        x="52"
        y="32"
        fill="currentColor"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-1px",
        }}
      >
        Opply
      </text>

      {/* ── AI superscript (top-right of "Opply") ── */}
      <text
        x="138"
        y="14"
        fill="#a3e635"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.5px",
        }}
      >
        AI
      </text>

      {/* ── Tagline ── */}
      <text
        x="52"
        y="50"
        fill="#6b7280"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 9,
          letterSpacing: "0px",
          fontWeight: 500,
        }}
      >
        Turn Emails Into Opportunities.
      </text>

      {/* ── Divider line between icon area and text ── */}
      <line x1="46" y1="4" x2="46" y2="54" stroke="#a3e63520" strokeWidth="1" />
    </svg>
  );
};

export default OpplyLogo;
