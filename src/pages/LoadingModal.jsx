import React, { useState } from 'react';
import { Overlay, ModalBox } from '../components/Modal';
import { addDays, fmtDate, orderToDB, dbToOrder, toISO } from '../lib/helpers';

export default function LoadingModal({ order, onClose, client, setOrders, onDetailUpdate }) {
  const [f, setF] = useState({ bl: "", container: "", weight: "", cbm: "", loadDate: order.expLoadDate || "", seaDays: 75 });
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));
  
  const eta = f.loadDate ? fmtDate(addDays(addDays(f.loadDate, +f.seaDays), 7)) : "—";

  async function handleSave() {
    const beiraDt = f.loadDate ? addDays(f.loadDate, +f.seaDays) : null;
    const bwyDt   = beiraDt ? addDays(beiraDt, 7) : null;
    
    const updated = { 
      ...order, 
      bl: f.bl, 
      container: f.container, 
      weight: +f.weight || null, 
      cbm: +f.cbm || null,
      actLoadDate: f.loadDate || null, 
      seaDays: +f.seaDays,
      eta_beira: beiraDt ? toISO(beiraDt) : null, 
      eta_bulawayo: bwyDt ? toISO(bwyDt) : null, 
      status: "transit" 
    };
    
    const { data, error } = await client.from("orders").update(orderToDB(updated)).eq("id", order.id).select().single();
    if (error) { alert("Error saving loading details: " + error.message); return; }
    
    const saved = dbToOrder(data);
    setOrders(prev => prev.map(x => x.id === order.id ? saved : x));
    if (onDetailUpdate) onDetailUpdate(saved);
    onClose();
  }

  return (
    <Overlay onClose={onClose}>
      <ModalBox title={`Loading Details — ${order.id}`} onClose={onClose}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Bill of Lading Number</label>
            <input value={f.bl} onChange={e => upd("bl", e.target.value)} placeholder="MAEU1234567890" />
          </div>
          <div className="form-group">
            <label className="form-label">Container Number</label>
            <input value={f.container} onChange={e => upd("container", e.target.value)} placeholder="MSCU1234567-8" />
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Weight (tonnes)</label>
            <input type="number" value={f.weight} onChange={e => upd("weight", e.target.value)} placeholder="18.5" />
          </div>
          <div className="form-group">
            <label className="form-label">Volume (CBM)</label>
            <input type="number" value={f.cbm} onChange={e => upd("cbm", e.target.value)} placeholder="33.2" />
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Actual Loading Date</label>
            <input type="date" value={f.loadDate} onChange={e => upd("loadDate", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Sea Freight Duration</label>
            <select value={f.seaDays} onChange={e => upd("seaDays", +e.target.value)}>
              <option value={60}>2 months (60 days)</option>
              <option value={75}>2.5 months (75 days)</option>
              <option value={90}>3 months (90 days)</option>
            </select>
          </div>
        </div>
        
        <div style={{ background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.3)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: 24, fontSize: "0.85rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Calculated ETA Bulawayo: </span>
          <span style={{ color: "var(--info)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{eta}</span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginLeft: 8 }}>({f.seaDays}d sea + 7d inland)</span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save & Calculate ETA</button>
        </div>
      </ModalBox>
    </Overlay>
  );
}
