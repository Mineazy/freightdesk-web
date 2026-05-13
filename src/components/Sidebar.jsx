import React from 'react';
import { LayoutDashboard, ListOrdered, Users, BellRing, PlusCircle, LogOut } from 'lucide-react';

export default function Sidebar({ view, setView, onDisconnect, alertCount, onNewOrder }) {
  const navItems = [
    { key: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { key: "orders",    icon: <ListOrdered size={18} />, label: "Orders" },
    { key: "suppliers", icon: <Users size={18} />, label: "Suppliers" },
    { key: "alerts",    icon: <BellRing size={18} />, label: "Alerts", badge: alertCount },
  ];

  return (
    <div className="sidebar">
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-main)" }}>FREIGHTDESK</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>ZW / MZ Corridor</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", display: "inline-block", boxShadow: "0 0 8px var(--success)" }} />
          <span style={{ fontSize: 10, color: "var(--success)", fontFamily: "'JetBrains Mono', monospace" }}>Supabase connected</span>
        </div>
      </div>
      
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {navItems.map(n => (
          <button 
            key={n.key} 
            onClick={() => setView(n.key)} 
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px",
              borderRadius: "var(--radius-sm)", cursor: "pointer", border: "none", fontFamily: "inherit", 
              fontSize: 14, fontWeight: 500,
              background: view === n.key ? "var(--primary-glow)" : "transparent",
              color: view === n.key ? "var(--text-main)" : "var(--text-muted)",
              transition: "all 0.2s"
            }}
          >
            <span style={{ color: view === n.key ? "var(--primary)" : "inherit" }}>{n.icon}</span>
            {n.label}
            {n.badge > 0 && (
              <span style={{ marginLeft: "auto", background: "var(--warning)", color: "var(--bg-dark)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>
                {n.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      
      <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "6px" }}>
        <button 
          onClick={onNewOrder} 
          style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 500, background: "transparent", color: "var(--text-main)", textAlign: "left" }}
        >
          <PlusCircle size={18} style={{ color: "var(--primary)" }} /> New Order
        </button>
        <button 
          onClick={onDisconnect} 
          style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 500, background: "transparent", color: "var(--text-muted)", textAlign: "left" }}
        >
          <LogOut size={18} /> Disconnect
        </button>
      </div>
    </div>
  );
}
