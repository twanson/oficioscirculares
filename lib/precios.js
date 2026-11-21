'use strict';
// Única fuente de precios de la web (data/precios.json).
// - En EJS: precios.texto('impulso_3d') -> "495 €", precios.num('impulso_3d') -> 495
// - En HTML estático: marcas {{precio:clave}} (las sustituye renderTokens).
// Un importe null se pinta como marcador visible [PENDIENTE JOSE: precio único].
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'precios.json');
const PENDIENTE = '[PENDIENTE JOSE: precio único]';

let _cache = null;
function data() {
  if (!_cache) _cache = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  return _cache;
}

function get(clave) {
  const s = data().servicios[clave];
  if (!s) throw new Error(`precios: clave desconocida "${clave}"`);
  return s;
}

function num(clave) { return get(clave).importe; }
function pendiente(clave) { return get(clave).importe == null; }

// "90 €" · "15 €/mes" · marcador si falta
function texto(clave, { periodo = true } = {}) {
  const s = get(clave);
  if (s.importe == null) return PENDIENTE;
  const n = Number(s.importe).toLocaleString('es-ES');
  return `${n} €${periodo && s.periodo ? '/' + s.periodo : ''}`;
}

// Versión HTML con la coletilla "+ IVA" cuando aplica (y no si está pendiente).
function html(clave, opts) {
  const s = get(clave);
  const t = texto(clave, opts);
  if (s.importe == null) return `<span class="precio-pendiente">${t}</span>`;
  return s.iva ? `${t} <span class="precio-iva">+ IVA</span>` : t;
}

function plazasFundador() { return data().club_plazas_fundador; }

// Sustituye {{precio:clave}} y {{precio-html:clave}} en HTML estático.
function renderTokens(str) {
  return str
    .replace(/\{\{precio-html:([a-z0-9_]+)\}\}/g, (_, k) => html(k))
    .replace(/\{\{precio:([a-z0-9_]+)\}\}/g, (_, k) => texto(k))
    .replace(/\{\{plazas-fundador\}\}/g, () => String(plazasFundador()));
}

module.exports = { get, num, texto, html, pendiente, plazasFundador, renderTokens, PENDIENTE };
