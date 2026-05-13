import React from 'react';
import { X } from 'lucide-react';

export function Overlay({ children, onClose }) {
  return (
    <div 
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }} 
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

export function ModalBox({ title, children, onClose }) {
  return (
    <div className="glass-modal animate-scale-up" style={{ width: 560, maxWidth: "90vw", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{title}</span>
        <button onClick={onClose} style={{ background: "transparent", color: "var(--text-muted)", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ padding: 24, overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
