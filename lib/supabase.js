'use strict';
// Clientes de Supabase para el área de miembros del Club.
// - getAdmin(): service role (solo servidor) para leer/escribir club_members.
// - createServerSupabase(req,res): cliente por-petición que gestiona la sesión
//   del usuario a través de cookies httpOnly (magic link / @supabase/ssr).
// Todo degrada a null si faltan las env vars, para que el sitio público siga vivo.
const { createClient } = require('@supabase/supabase-js');
const { createServerClient } = require('@supabase/ssr');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY);
}

let _admin = null;
function getAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!_admin) {
    _admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return _admin;
}

// Cliente ligado a las cookies de esta petición (lee/escribe la sesión).
function createServerSupabase(req, res) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return Object.entries(req.cookies || {}).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookie(name, value, {
            ...options,
            httpOnly: true,
            sameSite: 'lax',
            secure,
            path: (options && options.path) || '/'
          });
        });
      }
    }
  });
}

module.exports = { isConfigured, getAdmin, createServerSupabase, SUPABASE_URL };
