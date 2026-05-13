import React from 'react';
import { AlertTriangle, Info, CheckCircle2, Package } from 'lucide-react';
import { fmtDate, addDays, getProd } from '../lib/helpers';

export default function Alerts({ alertOrders }) {
  // Convert alert orders into dynamic alert items
  const dynamicAlerts = alertOrders.map(o => {
    const { daysLeft } = getProd(o);
    const endDt = fmtDate(addDays(o.prodStartDate, o.prodDays));
    return {
      type: "warning",
      title: `Production alert: ${o.id}`,
      body: `${o.supplier} — ${o.product} ends ${endDt} (${daysLeft} days). Prepare loading docs.`,
      time: "Today"
    };
  });

  // Example static alerts for history (would normally come from a db table)
  const staticAlerts = [
    { type: "info", title: "ETA update: ORD-2025-002", body: "Agricultural Chemicals vessel en route to Beira. ETA Bulawayo: 7 Feb 2025.", time: "2 days ago" },
    { type: "success", title: "Loading complete: ORD-2025-001", body: "Steel Coils loaded. B/L MAEU9876543210 · Container MSCU3456789-1", time: "5 Jan 2025" },
    { type: "info", title: "Payment confirmed: ORD-2025-006", body: "Deposit received. Awaiting supplier confirmation to begin production clock.", time: "22 Jan 2025" },
  ];

  const allAlerts = [...dynamicAlerts, ...staticAlerts];

  return (
    <div style={{ maxWidth: 720 }}>
      {allAlerts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <Package size={48} style={{ opacity: 0.2, margin: "0 auto 16px" }} />
          <div>No active alerts at this time.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {allAlerts.map((a, i) => {
            let cfg = {};
            if (a.type === "warning") {
              cfg = { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)", col: "var(--warning)", icon: <AlertTriangle size={18} /> };
            } else if (a.type === "info") {
              cfg = { bg: "rgba(6, 182, 212, 0.1)", border: "rgba(6, 182, 212, 0.3)", col: "var(--info)", icon: <Info size={18} /> };
            } else {
              cfg = { bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.3)", col: "var(--success)", icon: <CheckCircle2 size={18} /> };
            }

            return (
              <div key={i} className="glass-panel animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "var(--radius-md)", padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ color: cfg.col }}>{cfg.icon}</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: cfg.col }}>{a.title}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{a.time}</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-main)", paddingLeft: 30, opacity: 0.9 }}>{a.body}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
