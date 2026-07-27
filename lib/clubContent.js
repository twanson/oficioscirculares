'use strict';
// Índice del contenido del Club. Un único sitio que mapea slug -> archivo y
// aporta los metadatos que pinta el hogar /club/dentro. Los HTML viven en
// /club-content (FUERA de /public) para que solo se sirvan autenticados.
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'club-content');

const PIECES = [
  { slug: 'guia-primera-victoria', file: 'guia-primera-victoria.html',
    group: 'empieza', kicker: 'Empieza aquí', accent: 'terracota',
    title: 'Tu primera victoria en 7 días',
    desc: 'El plan de tus primeros siete días: de cero a tu primera pieza publicada con método.' },

  { slug: 'leccion-01-foto-de-producto', file: 'leccion-01-foto-de-producto.html',
    group: 'lecciones', kicker: 'Lección 01', accent: 'verde',
    title: 'Foto de producto con el móvil',
    desc: 'Que tu pieza se vea como merece, sin pagar fotógrafo.' },

  { slug: 'leccion-02-tu-primer-reel', file: 'leccion-02-tu-primer-reel.html',
    group: 'lecciones', kicker: 'Lección 02', accent: 'verde',
    title: 'Tu primer reel del proceso',
    desc: 'Lo que para ti es “un martes en el taller”, para la gente es fascinante.' },

  { slug: 'leccion-03-precios-con-margen', file: 'leccion-03-precios-con-margen.html',
    group: 'lecciones', kicker: 'Lección 03', accent: 'verde',
    title: 'Precios con margen',
    desc: 'Cobra lo que vale tu trabajo, con números y sin culpa.' },

  { slug: 'leccion-04-la-bio-que-vende', file: 'leccion-04-la-bio-que-vende.html',
    group: 'lecciones', kicker: 'Lección 04', accent: 'verde',
    title: 'La bio que vende',
    desc: 'Que quien llega a tu perfil entienda en tres segundos qué haces y por qué importa.' },

  { slug: 'biblioteca-plantillas', file: 'biblioteca-plantillas.html',
    group: 'herramientas', kicker: 'Caja de herramientas', accent: 'arena',
    title: 'Biblioteca de plantillas',
    desc: 'Ficha de producto, presupuesto, calendario, guiones de reel. Rellenas y listo.' },

  { slug: 'reto-01-doce-reels', file: 'reto-01-doce-reels.html',
    group: 'retos', kicker: 'Reto del trimestre', accent: 'terracota',
    title: '12 reels en 30 días',
    desc: 'En grupo, esta vez sí lo terminas.' },

  { slug: 'radar-ayudas', file: 'radar-ayudas-edicion-0.html',
    group: 'radar', kicker: 'Radar de ayudas', accent: 'verde',
    title: 'Radar de ayudas · Edición 0',
    desc: 'Subvenciones vivas por comunidad autónoma, con plantillas y plazos.' },

  { slug: 'mapa-del-contenido', file: 'mapa-del-contenido.html',
    group: 'mapa', kicker: 'Mapa', accent: 'arena',
    title: 'El mapa del contenido',
    desc: 'Todo lo que hay dentro del Club y por dónde seguir.' }
];

const BY_SLUG = Object.fromEntries(PIECES.map(p => [p.slug, p]));

function get(slug) { return BY_SLUG[slug] || null; }
function exists(piece) { return piece && fs.existsSync(path.join(CONTENT_DIR, piece.file)); }
function filePath(piece) { return path.join(CONTENT_DIR, piece.file); }

module.exports = { PIECES, get, exists, filePath, CONTENT_DIR };
