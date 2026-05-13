import React from 'react';
import { getProd, TODAY } from '../lib/helpers';

export default function ProdBar({ o }) {
  const { pct, daysLeft, done } = getProd(o);
  
  if (!o.prodStartDate) {
    return <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Not started</span>;
  }
  
  if (done || o.status === "transit" || o.status === "delivered") {
    return <span style={{ color: "var(--success)", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>Complete ✓</span>;
  }
  
  const col = daysLeft <= 14 ? "var(--warning)" : "var(--purple)";
  
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
        <span>{pct}%</span>
        <span>{daysLeft}d left</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, width: "100%", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: col, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}
