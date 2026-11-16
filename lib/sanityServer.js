// lib/sanityServer.js — serverdən (api/*) Sanity HTTP API-sinə sadə sorğular. SDK lazım deyil.
// Oxuma birbaşa api.sanity.io-dan gedir (CDN deyil) — sifariş yoxlanarkən qiymətlər təzə olsun.
const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'w7scii42';
const DATASET = process.env.SANITY_DATASET || 'production';
const API_VERSION = '2026-02-09';
const BASE = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data`;

async function fetchWithTimeout(url, opts, ms = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** GROQ sorğusu. params: { ad: dəyər } → $ad kimi göndərilir. */
export async function sanityQuery(query, params = {}, token) {
  const qs = new URLSearchParams({ query });
  for (const [k, v] of Object.entries(params)) qs.set(`$${k}`, JSON.stringify(v));
  const res = await fetchWithTimeout(`${BASE}/query/${DATASET}?${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Sanity query ${res.status}`);
  const json = await res.json();
  return json.result;
}

/** mutations: [{ createIfNotExists: {...} }, ...] — yazmaq üçün token (Editor) TƏLƏB OLUNUR. */
export async function sanityMutate(mutations, token) {
  const res = await fetchWithTimeout(`${BASE}/mutate/${DATASET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sanity mutate ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}
