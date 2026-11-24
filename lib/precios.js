'use strict';
// Única fuente de precios de la web (data/precios.json).
// - En EJS: precios.texto('impulso_3d') -> "495 €", precios.num('impulso_3d') -> 495
// - En HTML estático: marcas {{precio:clave}} (las sustituye renderTokens).
// Un importe null NO se enseña como marcador: se muestra el texto público de SIN_PRECIO
// (decisión de Jose, 22 nov 2026). Solo Roadmap y Sprint van sin cifra, a propósito.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'precios.json');
const PENDIENTE = '[PENDIENTE JOSE: precio único]';
const SIN_PRECIO = {
  roadmap_3d: 'Precio cerrado tras el Diagnóstico',
  sprint_3d: 'Precio cerrado tras el Diagnóstico'
};
const SIN_PRECIO_DEFECTO = 'Consultar';

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

// "90 €" · "15 €/mes" · texto público si falta
function texto(clave, { periodo = true } = {}) {
  const s = get(clave);
  if (s.importe == null) return SIN_PRECIO[clave] || SIN_PRECIO_DEFECTO;
  const n = Number(s.importe).toLocaleString('es-ES');
  return `${n} €${periodo && s.periodo ? '/' + s.periodo : ''}`;
}

// Versión HTML con la coletilla "+ IVA" cuando aplica (y no si está pendiente).
function html(clave, opts) {
  const s = get(clave);
  const t = texto(clave, opts);
  if (s.importe == null) return `<span class="precio-consultar">${t}</span>`;
  return s.iva ? `${t} <span class="precio-iva">+ IVA</span>` : t;
}

function plazasFundador() { return data().club_plazas_fundador; }
// Días desde que se responde el cuestionario hasta la entrega del Diagnóstico para talleres.
function plazoDiagnostico() { return data().diagnostico_talleres_plazo_dias; }

// Sustituye {{precio:clave}} y {{precio-html:clave}} en HTML estático.
function renderTokens(str) {
  return str
    .replace(/\{\{precio-html:([a-z0-9_]+)\}\}/g, (_, k) => html(k))
    .replace(/\{\{precio:([a-z0-9_]+)\}\}/g, (_, k) => texto(k))
    .replace(/\{\{plazas-fundador\}\}/g, () => String(plazasFundador()));
}

module.exports = { get, num, texto, html, pendiente, plazasFundador, plazoDiagnostico, renderTokens, PENDIENTE };
