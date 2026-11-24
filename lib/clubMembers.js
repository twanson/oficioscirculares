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

// --- Autodiagnóstico (migración db/migrations/20270104_club_novedades.sql) ---
const NIVELES = ['empieza', 'publica', 'vende'];
async function saveAutodiagnostico(email, { nivel, itinerario, prioridades, oficio, respuestas }) {
  const admin = getAdmin();
  if (!admin) throw new Error('Supabase no configurado');
  if (!NIVELES.includes(nivel)) throw new Error(`nivel no válido: ${nivel}`);
  email = norm(email);
  const patch = {
    nivel,
    itinerario: Array.isArray(itinerario) ? itinerario : [],
    prioridades: (Array.isArray(prioridades) ? prioridades : []).slice(0, 3),
    oficio: oficio || null,
    autodiagnostico_respuestas: respuestas || null,
    autodiagnostico_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const { error } = await admin.from('club_members').update(patch).eq('email', email);
  if (error) throw error;
  cacheClear(email);
}

// --- Votación de la lección del mes: un voto por miembro y ronda ---
async function getVoto(memberId, ronda) {
  const admin = getAdmin();
  if (!admin || !memberId || !ronda) return null;
  const { data, error } = await admin.from('club_votos')
    .select('tema').eq('member_id', memberId).eq('ronda', ronda).maybeSingle();
  if (error) { console.error('❌ club_votos query:', error.message); return null; }
  return data ? data.tema : null;
}
// Devuelve 'ok' | 'ya-votado' | 'error'. La clave primaria (member_id, ronda)
// impide un segundo voto aunque lleguen dos peticiones a la vez.
async function votar(memberId, ronda, tema) {
  const admin = getAdmin();
  if (!admin) return 'error';
  const { error } = await admin.from('club_votos').insert({ member_id: memberId, ronda, tema });
  if (!error) return 'ok';
  if (error.code === '23505') return 'ya-votado';
  console.error('❌ club_votos insert:', error.message);
  return 'error';
}
async function recuento(ronda) {
  const admin = getAdmin();
  if (!admin) return [];
  const { data, error } = await admin.from('club_votos_recuento').select('tema, votos').eq('ronda', ronda);
  if (error) { console.error('❌ recuento:', error.message); return []; }
  return data || [];
}

module.exports = {
  getMember, isActive, memberHasAccess,
  upsertFromCheckout, setStatusByCustomer, setStatusByEmail, cacheClear,
  NIVELES, saveAutodiagnostico, getVoto, votar, recuento
};
