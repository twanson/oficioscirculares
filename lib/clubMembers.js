'use strict';
// Acceso a la tabla club_members (Supabase). Stripe es la fuente de verdad:
// una sesión solo vale si el email existe con status distinto de 'canceled'.
// Cachea la comprobación de membresía unos minutos para no golpear Supabase
// en cada asset protegido.
const { getAdmin } = require('./supabase');

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map(); // email -> { member, at }

function norm(email) {
  return (email || '').toLowerCase().trim();
}
function cacheGet(email) {
  const e = cache.get(email);
  if (e && (Date.now() - e.at) < CACHE_TTL_MS) return e.member;
  return undefined;
}
function cacheSet(email, member) { cache.set(email, { member, at: Date.now() }); }
function cacheClear(email) { if (email) cache.delete(norm(email)); else cache.clear(); }

async function getMember(email) {
  email = norm(email);
  if (!email) return null;
  const cached = cacheGet(email);
  if (cached !== undefined) return cached;
  const admin = getAdmin();
  if (!admin) return null;
  const { data, error } = await admin
    .from('club_members').select('*').eq('email', email).maybeSingle();
  if (error) { console.error('❌ club_members query:', error.message); return null; }
  cacheSet(email, data || null);
  return data || null;
}

// Regla de acceso: activo o past_due entran; canceled o inexistente, no.
function memberHasAccess(member) {
  return Boolean(member && member.status !== 'canceled');
}
async function isActive(email) {
  const m = await getMember(email);
  return Boolean(m && m.status === 'active');
}

// --- Escrituras (webhook de Stripe) ---
async function upsertFromCheckout({ email, stripe_customer_id, plan, status = 'active' }) {
  const admin = getAdmin();
  if (!admin) throw new Error('Supabase no configurado');
  email = norm(email);
  const row = { email, status, updated_at: new Date().toISOString() };
  if (stripe_customer_id) row.stripe_customer_id = stripe_customer_id;
  if (plan) row.plan = plan;
  const { error } = await admin.from('club_members').upsert(row, { onConflict: 'email' });
  if (error) throw error;
  cacheClear(email);
}

async function setStatusByCustomer(stripe_customer_id, status) {
  const admin = getAdmin();
  if (!admin) throw new Error('Supabase no configurado');
  const { data, error } = await admin
    .from('club_members').update({ status, updated_at: new Date().toISOString() })
    .eq('stripe_customer_id', stripe_customer_id).select('email');
  if (error) throw error;
  (data || []).forEach(r => cacheClear(r.email));
  return data || [];
}

async function setStatusByEmail(email, status, stripe_customer_id) {
  const admin = getAdmin();
  if (!admin) throw new Error('Supabase no configurado');
  email = norm(email);
  const patch = { status, updated_at: new Date().toISOString() };
  if (stripe_customer_id) patch.stripe_customer_id = stripe_customer_id;
  const { error } = await admin.from('club_members').update(patch).eq('email', email);
  if (error) throw error;
  cacheClear(email);
}

module.exports = {
  getMember, isActive, memberHasAccess,
  upsertFromCheckout, setStatusByCustomer, setStatusByEmail, cacheClear
};
