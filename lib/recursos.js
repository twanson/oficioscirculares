const path = require('path');
const fs = require('fs');

const DATA_PATH = path.join(__dirname, '..', 'data', 'recursos.json');

function readAll() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

function getAllRecursos() {
  return readAll();
}

function getRecursoBySlug(slug) {
  return readAll().find(r => r.slug === slug);
}

// Puerta de publicación por fecha (mismo patrón que lib/posts.js).
// Un recurso sin publish_at, o con publish_at ya pasado, se considera publicado.
// publish_at es un ISO 8601 con offset (ej: "2026-08-06T08:00:00+02:00").
function isPublished(slug) {
  const r = getRecursoBySlug(slug);
  if (!r || !r.publish_at) return true;
  const when = new Date(r.publish_at).getTime();
  if (Number.isNaN(when)) return true; // fecha inválida: no bloquear
  return Date.now() >= when;
}

// Slugs cuyo publish_at aún no ha llegado (para filtrar listado y sitemap).
function futureSlugs() {
  const now = Date.now();
  return readAll()
    .filter(r => {
      if (!r.publish_at) return false;
      const when = new Date(r.publish_at).getTime();
      return !Number.isNaN(when) && now < when;
    })
    .map(r => r.slug);
}

module.exports = { getAllRecursos, getRecursoBySlug, isPublished, futureSlugs };
