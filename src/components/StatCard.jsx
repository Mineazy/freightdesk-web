import React from 'react';

export default function StatCard({ label, value, sub, color }) {
  return (
    <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: color || "var(--text-main)", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
        {sub}
      </div>
    </div>
  );
}
