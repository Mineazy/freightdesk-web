import React from 'react';
import { diffDays } from '../lib/helpers';

export default function VarBadge({ o }) {
  if (!o.expLoadDate || !o.actLoadDate) {
    return <span style={{ color: "var(--text-muted)" }}>—</span>;
  }
  
  const v = diffDays(o.expLoadDate, o.actLoadDate);
  
  if (v === 0) {
    return <span style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>On time</span>;
  }
  if (v > 0) {
    return <span style={{ color: "var(--danger)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>+{v}d late</span>;
  }
  
  return <span style={{ color: "var(--success)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>{v}d early</span>;
}
