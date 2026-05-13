import React from 'react';
import { getProd, fmtDate, addDays } from '../lib/helpers';
import StatusBadge from '../components/StatusBadge';
import VarBadge from '../components/VarBadge';
import { exportOrderPDF } from '../lib/exportUtils';
import { X, Download, Plus } from 'lucide-react';

export default function OrderDetailPanel({ order, onClose, onOpenLoading }) {
  const { pct, daysLeft, done } = getProd(order);
  const prodEnd = order.prodStartDate ? fmtDate(addDays(order.prodStartDate, order.prodDays)) : "—";
  const alert14 = order.prodStartDate && daysLeft <= 14 && daysLeft > 0;

  const beiraDt = order.actLoadDate ? addDays(order.actLoadDate, order.seaDays) : null;
  const bwyDt   = beiraDt ? addDays(beiraDt, 7) : null;

  const events = [
    { icon: "⚡", col: "var(--primary)", label: `Order ${order.id} created` },
    ...(order.depositPaid ? [{ icon: "✓", col: "var(--success)", label: "Deposit payment confirmed" }] : []),
    ...(order.supplierConfirmed ? [{ icon: "✓", col: "var(--success)", label: "Supplier confirmed receipt — production started" }] : []),
    ...(alert14 ? [{ icon: "⚠", col: "var(--warning)", label: `Production alert: ends ${prodEnd} (${daysLeft} days)` }] : []),
    ...(order.actLoadDate ? [{ icon: "🚢", col: "var(--info)", label: `Loaded ${fmtDate(order.actLoadDate)} · ${order.container}` }] : []),
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", justifyContent: "flex-end" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel animate-slide-in" style={{ width: 640, maxWidth: "100%", height: "100%", borderRight: "none", borderTop: "none", borderBottom: "none", borderRadius: 0, overflowY: "auto" }}>
        
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: "rgba(11, 15, 25, 0.8)", backdropFilter: "blur(12px)", zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{order.id}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 10 }}>
              {order.supplier} <StatusBadge status={order.status} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn" onClick={() => exportOrderPDF(order)}><Download size={16} /> Export</button>
            <button className="btn" style={{ padding: "8px" }} onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          {alert14 && (
            <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: "0.85rem", color: "var(--warning)", marginBottom: 24 }}>
              ⚠ Production ends in {daysLeft} days — begin loading preparation
            </div>
          )}

          <Section title="Payment & Verification">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Deposit Paid" value={order.depositPaid ? "✓ Confirmed" : "✗ Pending"} color={order.depositPaid ? "var(--success)" : "var(--danger)"} />
              <Field label="Supplier Confirmed" value={order.supplierConfirmed ? "✓ Confirmed" : "✗ Pending"} color={order.supplierConfirmed ? "var(--success)" : "var(--danger)"} />
            </div>
          </Section>

          <Section title="Production Timeline">
            {order.prodStartDate ? (
              <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "16px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>Progress</span>
                  <span>{done ? "Complete" : `${daysLeft} days remaining`}</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>
                  <div style={{ height: 8, borderRadius: 4, width: `${pct}%`, background: done ? "var(--success)" : daysLeft <= 14 ? "var(--warning)" : "var(--purple)", transition: "width 0.5s" }} />
                </div>
              </div>
            ) : <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 16 }}>Awaiting payment confirmation to start production</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Production Start" value={order.prodStartDate ? fmtDate(order.prodStartDate) : "Not started"} empty={!order.prodStartDate} />
              <Field label={`Expected End (${order.prodDays}d)`} value={order.prodStartDate ? prodEnd : "—"} empty={!order.prodStartDate} />
            </div>
          </Section>

          <Section title="Loading Details">
            {order.status === "loading" && (
              <button className="btn btn-primary" onClick={() => onOpenLoading(order)} style={{ marginBottom: 16, width: "100%" }}>
                <Plus size={16} /> Enter Loading Data
              </button>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Bill of Lading" value={order.bl || "Not yet issued"} empty={!order.bl} />
              <Field label="Container Number" value={order.container || "—"} empty={!order.container} />
              <Field label="Weight" value={order.weight ? `${order.weight} tonnes` : "—"} empty={!order.weight} />
              <Field label="Volume (CBM)" value={order.cbm ? `${order.cbm} CBM` : "—"} empty={!order.cbm} />
              <Field label="Expected Load Date" value={order.expLoadDate ? fmtDate(order.expLoadDate) : "—"} empty={!order.expLoadDate} />
              <Field label="Actual Load Date" value={order.actLoadDate ? fmtDate(order.actLoadDate) : "—"} empty={!order.actLoadDate} />
            </div>
            {order.expLoadDate && order.actLoadDate && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem" }}>
                Loading variance: <VarBadge o={order} />
              </div>
            )}
          </Section>

          {beiraDt && (
            <Section title="Transit & ETA Calculator">
              <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.1))", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "var(--radius-md)", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ fontWeight: 600 }}>Origin Port</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.2)", position: "relative" }}>
                    <span style={{ position: "absolute", right: -4, top: -10, color: "var(--primary)", fontSize: 18 }}>›</span>
                  </div>
                  <span style={{ color: "var(--info)", fontWeight: 600 }}>Beira, MZ</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.2)", position: "relative" }}>
                    <span style={{ position: "absolute", right: -4, top: -10, color: "var(--primary)", fontSize: 18 }}>›</span>
                  </div>
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>Bulawayo, ZW</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--info)", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.8 }}>Final ETA — Bulawayo</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "var(--info)", marginTop: 4 }}>{fmtDate(bwyDt)}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Load date", val: fmtDate(order.actLoadDate) },
                    { label: `Sea freight (+${order.seaDays}d)`, val: `→ ${fmtDate(beiraDt)}` },
                    { label: "Inland haulage (+7d)", val: `→ ${fmtDate(bwyDt)}` },
                  ].map(seg => (
                    <div key={seg.label} style={{ background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
                      <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>{seg.label}</div>
                      <div style={{ fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, marginTop: 4 }}>{seg.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          <Section title="Event Log">
            {events.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 12, paddingBottom: 12, borderBottom: i < events.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0, color: ev.col }}>{ev.icon}</div>
                <div style={{ fontSize: "0.85rem", paddingTop: 6, color: "var(--text-main)" }}>{ev.label}</div>
              </div>
            ))}
          </Section>

          {order.notes && (
            <Section title="Notes">
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "14px 16px", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>{order.notes}</div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid var(--border-color)" }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value, empty, color }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: "0.85rem", fontWeight: 500, marginTop: 4, fontFamily: "'JetBrains Mono', monospace", color: color || (empty ? "var(--text-muted)" : "var(--text-main)"), fontStyle: empty ? "italic" : "normal" }}>{value}</div>
    </div>
  );
}
