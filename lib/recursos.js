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

module.exports = { getAllRecursos, getRecursoBySlug };
