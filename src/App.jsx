import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { loadCreds, initClient, clearCreds, getClient } from './lib/supabase';
import { dbToOrder, dbToSupplier, getProd, orderToDB, toISO, TODAY } from './lib/helpers';
import Setup from './pages/Setup';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Alerts from './pages/Alerts';
import NewOrderModal from './pages/NewOrderModal';

export default function App() {
  const [client, setClient] = useState(null);
  const [session, setSession] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to get client from env or local storage
    let c = getClient();
    
    if (!c) {
      // If we don't have a client yet, but we have saved creds, init them
      const saved = loadCreds();
      if (saved) {
        c = initClient(saved.url, saved.key);
      }
    }

    if (!c) {
      setNeedsSetup(true);
      setLoading(false);
      return;
    }

    setClient(c);

    // Check active session
    c.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = c.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSetupConnected = (c) => {
    setClient(c);
    setNeedsSetup(false);
    c.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  };

  const handleLogout = async () => {
    if (client) await client.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--border-color)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (needsSetup) {
    return <Setup onConnected={handleSetupConnected} />;
  }

  if (!session) {
    return <Login onLogin={() => {}} />;
  }

  return <FreightApp client={client} onLogout={handleLogout} />;
}

function FreightApp({ client, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState("");
  const [view, setView] = useState("dashboard");
  const [showNewOrder, setShowNewOrder] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true); setDbError("");
    try {
      const [ordRes, supRes] = await Promise.all([
        client.from("orders").select("*").order("id", { ascending: false }),
        client.from("suppliers").select("*").order("name"),
      ]);
      if (ordRes.error) throw ordRes.error;
      if (supRes.error) throw supRes.error;
      setOrders((ordRes.data || []).map(dbToOrder));
      setSuppliers((supRes.data || []).map(dbToSupplier));
    } catch(e) {
      setDbError(e.message || "Failed to load data from Supabase.");
    } finally { setLoading(false); }
  }, [client]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const alertOrders = useMemo(() =>
    orders.filter(o => { const { daysLeft } = getProd(o); return o.status==="production" && daysLeft<=14 && daysLeft>0; }),
  [orders]);

  async function createOrder(f) {
    const bothDone = f.paid && f.confirmed;
    const newO = {
      id: f.id || `ORD-${new Date().getFullYear()}-${String(orders.length+1).padStart(3,"0")}`,
      supplier: f.supplier, product: f.product || "New shipment",
      status: bothDone ? "production" : "payment",
      depositPaid: f.paid, supplierConfirmed: f.confirmed,
      prodStartDate: bothDone ? toISO(TODAY) : null,
      prodDays: +f.prodDays,
      expLoadDate: f.expLoad || null, actLoadDate: null,
      bl:null, container:null, weight:null, cbm:null,
      seaDays:75, eta_beira:null, eta_bulawayo:null, notes:"New order",
    };
    const { data, error } = await client.from("orders").insert(orderToDB(newO)).select().single();
    if (error) { alert("Error creating order: " + error.message); return; }
    setOrders(p => [dbToOrder(data), ...p]);
  }

  return (
    <Layout view={view} setView={setView} onLogout={onLogout} fetchAll={fetchAll} orders={orders} alertCount={alertOrders.length} onNewOrder={() => setShowNewOrder(true)}>
      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(11,15,25,0.7)", zIndex: 50, backdropFilter: "blur(4px)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, border: "3px solid var(--border-color)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading from Supabase...</div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      )}
      
      {dbError && (
        <div style={{ padding: "12px 20px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-sm)", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--danger)" }}>⚠ {dbError}</span>
          <button onClick={fetchAll} className="btn">Retry</button>
        </div>
      )}

      {view === "dashboard" && <Dashboard orders={orders} alertOrders={alertOrders} client={client} setOrders={setOrders} />}
      {view === "orders" && <Orders orders={orders} client={client} setOrders={setOrders} />}
      {view === "suppliers" && <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} client={client} orders={orders} />}
      {view === "alerts" && <Alerts alertOrders={alertOrders} />}

      {showNewOrder && <NewOrderModal onClose={() => setShowNewOrder(false)} onCreate={createOrder} suppliers={suppliers} />}
    </Layout>
  );
}
