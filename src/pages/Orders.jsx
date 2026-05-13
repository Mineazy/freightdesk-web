import React, { useState, useMemo } from 'react';
import OrderTable from '../components/OrderTable';
import OrderDetailPanel from './OrderDetailPanel';
import LoadingModal from './LoadingModal';
import { STATUS_CFG } from '../lib/helpers';

export default function Orders({ orders, client, setOrders }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(null);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter(o => o.status === statusFilter);
    if (search) {
      list = list.filter(o =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.supplier.toLowerCase().includes(search.toLowerCase()) ||
        (o.bl && o.bl.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", padding: 6, marginBottom: 24, flexWrap: "wrap", border: "1px solid var(--border-color)" }}>
        {["all", "payment", "production", "loading", "transit", "delivered"].map(s => (
          <button 
            key={s} 
            onClick={() => setStatusFilter(s)} 
            style={{ 
              padding: "8px 16px", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer", border: "none", fontFamily: "inherit", 
              background: statusFilter === s ? "var(--bg-card-hover)" : "transparent", 
              color: statusFilter === s ? "var(--text-main)" : "var(--text-muted)", 
              boxShadow: statusFilter === s ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
              border: statusFilter === s ? "1px solid var(--glass-border)" : "1px solid transparent",
              transition: "all 0.2s ease"
            }}
          >
            {s === "all" ? "All Orders" : STATUS_CFG[s]?.label}
          </button>
        ))}
      </div>
      
      <OrderTable 
        orders={filtered} 
        search={search} 
        onSearch={setSearch} 
        onDetail={o => setDetailOrder(o)} 
        onLoadingForm={o => setLoadingOrder(o)} 
      />

      {detailOrder && <OrderDetailPanel order={orders.find(o=>o.id===detailOrder.id)||detailOrder} onClose={() => setDetailOrder(null)} onOpenLoading={o => { setDetailOrder(null); setLoadingOrder(o); }} />}
      {loadingOrder && <LoadingModal order={loadingOrder} onClose={() => setLoadingOrder(null)} client={client} setOrders={setOrders} onDetailUpdate={setDetailOrder} />}
    </div>
  );
}
