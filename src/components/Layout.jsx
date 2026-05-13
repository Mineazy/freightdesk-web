import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ 
  children, view, setView, onLogout, fetchAll, orders, alertCount, onNewOrder 
}) {
  return (
    <div className="app-layout">
      <Sidebar view={view} setView={setView} onLogout={onLogout} alertCount={alertCount} onNewOrder={onNewOrder} />
      <div className="main-content">
        <Topbar view={view} fetchAll={fetchAll} orders={orders} onNewOrder={onNewOrder} />
        <div className="scroll-area animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
