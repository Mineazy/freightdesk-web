import React, { useState } from 'react';
import { initClient, saveCreds } from '../lib/supabase';
import { Database, Key, Globe } from 'lucide-react';

export default function Setup({ onConnected }) {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [err, setErr] = useState("");

  async function connect() {
    if (!url.trim() || !key.trim()) { setErr("Both fields are required."); return; }
    setTesting(true); setErr("");
    try {
      const client = initClient(url.trim(), key.trim());
      const { error } = await client.from("orders").select("id").limit(1);
      if (error && error.code !== "PGRST116") throw error;
      saveCreds(url.trim(), key.trim());
      onConnected(client);
    } catch(e) {
      setErr(e.message || "Connection failed. Check your URL and API key.");
    } finally { setTesting(false); }
  }

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
      <div className="glass-panel animate-scale-up" style={{ width: 480, overflow: "hidden", border: "1px solid var(--border-color)" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
          <Database className="text-primary" size={24} style={{ color: "var(--primary)" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.06em" }}>FREIGHTDESK</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>Setup Connection</div>
          </div>
        </div>
        
        <div style={{ padding: "32px" }}>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>Enter your Supabase project credentials. They will be stored securely in your browser's local storage.</div>
          
          <div className="form-group">
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Globe size={14} /> Project URL</label>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://xxxxxxxxxxxx.supabase.co" />
          </div>
          
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Key size={14} /> Anon / Public Key</label>
            <input type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="eyJhbGci..." />
          </div>
          
          {err && <div style={{ fontSize: 12, color: "var(--danger)", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 20 }}>{err}</div>}
          
          <button onClick={connect} disabled={testing} className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: 14 }}>
            {testing ? "Connecting..." : "Connect to Supabase"}
          </button>

          <div style={{ marginTop: 24, padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--purple)", marginBottom: 10 }}>Required Supabase tables</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.8 }}>
              <div style={{ color: "var(--info)" }}>orders</div>
              <div style={{ paddingLeft: 12 }}>id, supplier, product, status, deposit_paid, supplier_confirmed, prod_start_date, prod_days, exp_load_date, act_load_date, bl, container, weight, cbm, sea_days, eta_beira, eta_bulawayo, notes</div>
              <div style={{ color: "var(--info)", marginTop: 8 }}>suppliers</div>
              <div style={{ paddingLeft: 12 }}>id, name, contact, phone, email, country, product_line</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
