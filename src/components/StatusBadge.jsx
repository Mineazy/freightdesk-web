import React from 'react';
import { STATUS_CFG } from '../lib/helpers';

export default function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.payment;
  return (
    <span className={cfg.statusClass} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", 
      borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap",
      border: "1px solid"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", flexShrink: 0, boxShadow: "0 0 6px currentColor" }} />
      {cfg.label}
    </span>
  );
}
