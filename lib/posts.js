const path = require('path');
const fs = require('fs');

const DATA_PATH = path.join(__dirname, '..', 'data', 'posts.json');

// Lee data/posts.json. Cada entrada: { slug, publish_at? }.
// Un post SIN publish_at se considera publicado (comportamiento por defecto).
// publish_at es un ISO 8601 CON offset (ej: "2026-07-10T08:00:00+02:00"),
// de modo que la comparación con Date.now() es correcta respecto a Europe/Madrid
// sin necesidad de librerías de zona horaria: el offset ya fija el instante absoluto.
function readAll() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // Si el archivo no existe o está mal formado, no bloqueamos nada.
    return [];
  }
}

function getPost(slug) {
  return readAll().find(p => p.slug === slug);
}

// ¿Está el post visible ya? Sin entrada o sin publish_at => publicado.
function isPublished(slug) {
  const p = getPost(slug);
  if (!p || !p.publish_at) return true;
  const when = new Date(p.publish_at).getTime();
  if (Number.isNaN(when)) return true; // fecha inválida: no bloquear
  return Date.now() >= when;
}

// Slugs cuyo publish_at aún no ha llegado (para filtrar índice y sitemap).
function futureSlugs() {
  const now = Date.now();
  return readAll()
    .filter(p => {
      if (!p.publish_at) return false;
      const when = new Date(p.publish_at).getTime();
      return !Number.isNaN(when) && now < when;
    })
    .map(p => p.slug);
}

module.exports = { readAll, getPost, isPublished, futureSlugs };
