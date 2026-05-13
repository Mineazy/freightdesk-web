import React from 'react';
import { RefreshCw, Download, FileText, Plus } from 'lucide-react';
import { exportBulkPDF, exportCSV } from '../lib/exportUtils';

export default function Topbar({ view, fetchAll, orders, onNewOrder }) {
  const titles = {
    dashboard: "Operations Dashboard",
    orders: "Order Management",
    suppliers: "Supplier Management",
    alerts: "Alerts & Notifications"
  };

  return (
    <div className="topbar">
      <div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{titles[view] || "Dashboard"}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
          Beira–Bulawayo corridor · {orders.length} orders tracked
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn" onClick={fetchAll} title="Refresh from Supabase">
          <RefreshCw size={16} /> Refresh
        </button>
        <button className="btn" onClick={() => exportCSV(orders)}>
          <Download size={16} /> CSV
        </button>
        <button className="btn" onClick={() => exportBulkPDF(orders)}>
          <FileText size={16} /> PDF
        </button>
        <button className="btn btn-primary" onClick={onNewOrder}>
          <Plus size={16} /> New Order
        </button>
      </div>
    </div>
  );
}
