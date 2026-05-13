import React from 'react';
import { Search } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProdBar from './ProdBar';
import VarBadge from './VarBadge';
import { fmtDate } from '../lib/helpers';

export default function OrderTable({ orders, search, onSearch, onDetail, onLoadingForm }) {
  return (
    <div className="glass-panel" style={{ overflow: "hidden" }}>
      {onSearch !== undefined && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Active Orders</span>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              value={search} 
              onChange={e => onSearch(e.target.value)} 
              placeholder="Search orders, B/L..." 
              style={{ padding: "6px 12px 6px 32px", width: 240, fontSize: "0.8rem" }} 
            />
          </div>
        </div>
      )}
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Production</th>
              <th>B/L Number</th>
              <th>ETA Bulawayo</th>
              <th>Load Var</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  No orders found.
                </td>
              </tr>
            ) : orders.map(o => (
              <tr key={o.id}>
                <td>
                  <button 
                    onClick={() => onDetail(o)} 
                    style={{ background: "transparent", color: "var(--primary)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", border: "none", padding: 0 }}
                  >
                    {o.id}
                  </button>
                </td>
                <td style={{ fontSize: "0.85rem", fontWeight: 500 }}>{o.supplier}</td>
                <td><StatusBadge status={o.status} /></td>
                <td><ProdBar o={o} /></td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: o.bl ? "var(--text-main)" : "var(--text-muted)" }}>
                  {o.bl || "—"}
                </td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: o.eta_bulawayo ? "var(--info)" : "var(--text-muted)" }}>
                  {o.eta_bulawayo ? fmtDate(o.eta_bulawayo) : "Pending"}
                </td>
                <td><VarBadge o={o} /></td>
                <td>
                  {o.status === "loading" ? (
                    <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={() => onLoadingForm(o)}>Add B/L</button>
                  ) : (
                    <button className="btn" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={() => onDetail(o)}>View</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
