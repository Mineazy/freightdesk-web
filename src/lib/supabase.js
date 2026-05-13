import { createClient } from '@supabase/supabase-js';

const CRED_KEY = "fd_supabase_creds";

export function loadCreds() {
  try {
    return JSON.parse(localStorage.getItem(CRED_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveCreds(url, key) {
  localStorage.setItem(CRED_KEY, JSON.stringify({ url, key }));
}

export function clearCreds() {
  localStorage.removeItem(CRED_KEY);
}

let _supabase = null;
let _currentUrl = null;
let _currentKey = null;

export function getClient() {
  if (!_supabase) {
    const url = import.meta.env.VITE_SUPABASE_URL || loadCreds()?.url;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || loadCreds()?.key;
    if (url && key) initClient(url, key);
  }
  return _supabase;
}

export function initClient(url, key) {
  const finalUrl = url || import.meta.env.VITE_SUPABASE_URL || loadCreds()?.url;
  const finalKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY || loadCreds()?.key;
  
  if (!finalUrl || !finalKey) return null;

  if (!_supabase || _currentUrl !== finalUrl || _currentKey !== finalKey) {
    _supabase = createClient(finalUrl, finalKey);
    _currentUrl = finalUrl;
    _currentKey = finalKey;
  }
  return _supabase;
}
