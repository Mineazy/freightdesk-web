import React, { useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import OrderTable from '../components/OrderTable';
import { AlertTriangle } from 'lucide-react';
import OrderDetailPanel from './OrderDetailPanel'; // Will build this
import LoadingModal from './LoadingModal'; // Will build this

export default function Dashboard({ orders, alertOrders, client, setOrders }) {
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(null);

  const filtered = useMemo(() => {
    let list = orders;
    if (search) {
      list = list.filter(o =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.supplier.toLowerCase().includes(search.toLowerCase()) ||
        (o.bl && o.bl.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return list;
  }, [orders, search]);

  const counts = useMemo(() => {
    const c = { payment: 0, production: 0, loading: 0, transit: 0, delivered: 0 };
    orders.forEach(o => { if (c[o.status] !== undefined) c[o.status]++; });
    return c;
  }, [orders]);

  const activeCount = orders.filter(o => o.status !== "delivered").length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Active Orders" value={activeCount} sub="total active" />
        <StatCard label="In Production" value={counts.production} sub="avg 12d left" color="var(--purple)" />
        <StatCard label="In Transit" value={counts.transit} sub="en route" color="var(--info)" />
        <StatCard label="Ready to Load" value={counts.loading} sub="action needed" color="var(--primary)" />
        <StatCard label="Delivered YTD" value={counts.delivered} sub="this year" color="var(--success)" />
      </div>

      {alertOrders.length > 0 && (
        <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "var(--radius-md)", padding: "12px 16px", fontSize: "0.85rem", color: "var(--warning)", display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <AlertTriangle size={18} />
          {alertOrders.length} production run{alertOrders.length > 1 ? "s" : ""} ending within 14 days — prepare loading documentation now.
        </div>
      )}

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
