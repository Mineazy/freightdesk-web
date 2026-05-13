import React, { useState } from 'react';
import { Overlay, ModalBox } from '../components/Modal';

export default function NewOrderModal({ onClose, onCreate, suppliers }) {
  const [f, setF] = useState({ id: "", supplier: suppliers[0]?.name || "", product: "", prodDays: 21, deposit: "", paid: false, confirmed: false, expLoad: "" });
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));

  return (
    <Overlay onClose={onClose}>
      <ModalBox title="Create New Shipping Order" onClose={onClose}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Order Reference</label>
            <input value={f.id} onChange={e => upd("id", e.target.value)} placeholder="ORD-2025-007" />
          </div>
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <select value={f.supplier} onChange={e => upd("supplier", e.target.value)}>
              {suppliers.map(s => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Product Description</label>
          <input value={f.product} onChange={e => upd("product", e.target.value)} placeholder="e.g. Steel coils, 40ft container" />
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Production Duration (days)</label>
            <input type="number" min={15} max={30} value={f.prodDays} onChange={e => upd("prodDays", +e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Deposit Amount (USD)</label>
            <input value={f.deposit} onChange={e => upd("deposit", e.target.value)} placeholder="25,000" />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Expected Loading Date</label>
          <input type="date" value={f.expLoad} onChange={e => upd("expLoad", e.target.value)} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Payment Verification</label>
          
          <div 
            onClick={() => upd("paid", !f.paid)} 
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", cursor: "pointer", marginBottom: 8 }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${f.paid ? "var(--success)" : "var(--border-color)"}`, background: f.paid ? "var(--success)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {f.paid && <span style={{ color: "var(--bg-dark)", fontSize: 12, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: "0.85rem" }}>Deposit payment made</span>
            <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)" }}>Required to start timeline</span>
          </div>

          <div 
            onClick={() => upd("confirmed", !f.confirmed)} 
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${f.confirmed ? "var(--success)" : "var(--border-color)"}`, background: f.confirmed ? "var(--success)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {f.confirmed && <span style={{ color: "var(--bg-dark)", fontSize: 12, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: "0.85rem" }}>Supplier confirmed receipt</span>
            <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)" }}>Starts production clock</span>
          </div>
        </div>
        
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onCreate(f); onClose(); }}>Create Order</button>
        </div>
      </ModalBox>
    </Overlay>
  );
}
