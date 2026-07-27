'use strict';
// Lista de espera del Club en Brevo. Lista PROPIA (separada de la newsletter)
// para poder avisar con prioridad cuando se reabran las plazas.
// env: BREVO_API_KEY, BREVO_WAITLIST_LIST_ID
const fetch = require('node-fetch');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const LIST_ID = process.env.BREVO_WAITLIST_LIST_ID;

function isConfigured() { return Boolean(BREVO_API_KEY && LIST_ID); }

async function addToWaitlist(email) {
  if (!isConfigured()) {
    console.warn('⚠️  Brevo lista-espera no configurado; email NO guardado:', email);
    return { ok: false, skipped: true };
  }
  const resp = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify({
      email,
      listIds: [Number(LIST_ID)],
      updateEnabled: true,
      attributes: { SOURCE: 'club-lista-espera' }
    })
  });
  // 201 (creado) o 204 (actualizado) = OK. Brevo devuelve 400 "duplicate" si ya existe
  // sin updateEnabled; con updateEnabled:true no debería, pero lo toleramos.
  if (resp.status === 201 || resp.status === 204) return { ok: true };
  const text = await resp.text();
  if (resp.status === 400 && /duplicate/i.test(text)) return { ok: true, duplicate: true };
  throw new Error(`Brevo ${resp.status}: ${text}`);
}

module.exports = { isConfigured, addToWaitlist };
