import React, { useState } from 'react';
import { getClient } from '../lib/supabase';
import { Shield, Mail, Lock } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    setError("");

    const client = getClient();
    try {
      const { data, error: authError } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) throw authError;
      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
      <div className="glass-panel animate-scale-up" style={{ width: 400, overflow: "hidden", border: "1px solid var(--border-color)" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
          <Shield className="text-primary" size={24} style={{ color: "var(--primary)" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.06em" }}>FREIGHTDESK</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>Secure Access</div>
          </div>
        </div>
        
        <div style={{ padding: "32px" }}>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
            Please log in to your account to access the dashboard.
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={14} /> Email Address
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="you@example.com" 
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Lock size={14} /> Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
              />
            </div>
            
            {error && (
              <div style={{ fontSize: 12, color: "var(--danger)", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 20 }}>
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "12px", fontSize: 14 }}
            >
              {loading ? "Authenticating..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
