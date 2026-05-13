import React, { useState } from 'react';
import { diffDays, dbToSupplier, supplierToDB } from '../lib/helpers';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Overlay, ModalBox } from '../components/Modal';

export default function Suppliers({ suppliers, setSuppliers, client, orders }) {
  const [supplierModal, setSupplierModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function createSupplier(f) {
    const row = supplierToDB({ ...f, id: "S" + Date.now().toString().slice(-6) });
    const { data, error } = await client.from("suppliers").insert(row).select().single();
    if (error) { alert("Error creating supplier: " + error.message); return; }
    setSuppliers(p => [...p, dbToSupplier(data)]);
  }

  async function updateSupplier(f) {
    const row = supplierToDB(f);
    const { data, error } = await client.from("suppliers").update(row).eq("id", f.id).select().single();
    if (error) { alert("Error updating supplier: " + error.message); return; }
    setSuppliers(p => p.map(s => s.id === f.id ? dbToSupplier(data) : s));
  }

  async function deleteSupplier(id) {
    const { error } = await client.from("suppliers").delete().eq("id", id);
    if (error) { alert("Error deleting supplier: " + error.message); return; }
    setSuppliers(p => p.filter(s => s.id !== id));
    setDeleteConfirm(null);
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""} registered</span>
        <button className="btn btn-primary" onClick={() => setSupplierModal("new")}>
          <Plus size={16} /> Add Supplier
        </button>
      </div>
      
      {suppliers.length === 0 && (
        <div className="glass-panel" style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          No suppliers yet. Add one to get started.
        </div>
      )}
      
      <div style={{ display: "grid", gap: 16 }}>
        {suppliers.map(s => {
          const supOrders = orders.filter(o => o.supplier === s.name);
          const vars = supOrders.filter(o => o.expLoadDate && o.actLoadDate).map(o => diffDays(o.expLoadDate, o.actLoadDate));
          const avg = vars.length ? Math.round(vars.reduce((a, b) => a + b, 0) / vars.length * 10) / 10 : 0;
          const vc = avg > 3 ? "var(--danger)" : avg < 0 ? "var(--success)" : "var(--info)";
          
          return (
            <div key={s.id} className="glass-panel" style={{ padding: 24, transition: "transform 0.2s ease" }} 
                 onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} 
                 onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>{s.name}</div>
                  {s.productLine && <div style={{ fontSize: "0.8rem", color: "var(--purple)", marginTop: 4 }}>{s.productLine}</div>}
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 8 }}>{s.contact} · {s.phone}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 2 }}>{s.email}</div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 600 }}>
                    {s.country}
                  </span>
                  <button className="btn" style={{ padding: "6px" }} onClick={() => setSupplierModal(s)} title="Edit"><Edit2 size={16} /></button>
                  <button className="btn btn-danger" style={{ padding: "6px" }} onClick={() => setDeleteConfirm(s.id)} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 20 }}>
                {[
                  { label: "Active orders", val: supOrders.length, col: "var(--text-main)" },
                  { label: "Avg load variance", val: `${avg > 0 ? "+" : ""}${avg}d`, col: vc },
                  { label: "Loaded / delivered", val: supOrders.filter(o => o.status === "transit" || o.status === "delivered").length, col: "var(--text-main)" },
                ].map(st => (
                  <div key={st.label} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-sm)", padding: "12px 16px", border: "1px solid var(--border-color)" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: st.col }}>{st.val}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{st.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {supplierModal && (
        <SupplierModal
          supplier={supplierModal === "new" ? null : supplierModal}
          onClose={() => setSupplierModal(null)}
          onSave={supplierModal === "new" ? createSupplier : updateSupplier}
        />
      )}
      
      {deleteConfirm && (
        <Overlay onClose={() => setDeleteConfirm(null)}>
          <ModalBox title="Delete Supplier" onClose={() => setDeleteConfirm(null)}>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 12 }}>
              Are you sure you want to remove <strong style={{ color: "var(--text-main)" }}>{suppliers.find(s => s.id === deleteConfirm)?.name}</strong>?
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--danger)", marginBottom: 24, padding: "12px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
              {orders.filter(o => o.supplier === suppliers.find(s => s.id === deleteConfirm)?.name).length > 0
                ? "⚠ This supplier has associated orders. Their name will remain on existing orders."
                : "This supplier has no associated orders."}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteSupplier(deleteConfirm)}>Delete Supplier</button>
            </div>
          </ModalBox>
        </Overlay>
      )}
    </div>
  );
}

function SupplierModal({ supplier, onClose, onSave }) {
  const isEdit = !!supplier;
  const empty = { id: "", name: "", contact: "", phone: "", email: "", country: "China", productLine: "" };
  const [f, setF] = useState(isEdit ? { ...supplier } : empty);
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));

  const valid = f.name.trim() && f.contact.trim() && f.email.trim();

  return (
    <Overlay onClose={onClose}>
      <ModalBox title={isEdit ? `Edit Supplier — ${supplier.name}` : "Add New Supplier"} onClose={onClose}>
        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input value={f.name} onChange={e => upd("name", e.target.value)} placeholder="e.g. Shenzhen Metals Co." />
        </div>
        <div className="form-group">
          <label className="form-label">Product Line</label>
          <input value={f.productLine || ""} onChange={e => upd("productLine", e.target.value)} placeholder="e.g. Structural Steel & Roofing" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input value={f.contact} onChange={e => upd("contact", e.target.value)} placeholder="e.g. Li Wei" />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input value={f.country} onChange={e => upd("country", e.target.value)} placeholder="e.g. China" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input value={f.phone} onChange={e => upd("phone", e.target.value)} placeholder="+86 138 0000 0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" value={f.email} onChange={e => upd("email", e.target.value)} placeholder="sales@supplier.cn" />
          </div>
        </div>
        {!valid && (
          <div style={{ fontSize: "0.8rem", color: "var(--warning)", marginBottom: 16, padding: "10px 14px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
            Company name, contact person, and email are required.
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (valid) { onSave(f); onClose(); } }}>
            {isEdit ? "Save Changes" : "Add Supplier"}
          </button>
        </div>
      </ModalBox>
    </Overlay>
  );
}
