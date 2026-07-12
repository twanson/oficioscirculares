#!/usr/bin/env node
/**
 * build-blog-index.js
 * Regenera el listado estático de posts (SSR fallback para SEO) dentro de
 * public/blog/index.html a partir de la fuente única de verdad: el array
 * `allPosts` de public/assets/js/blog.js.
 *
 * - Respeta la puerta de publicación (publishAt): los posts con fecha futura
 *   NO se incluyen en el HTML crudo (igual que en el índice cliente).
 * - blog.js sigue re-renderizando el listado para usuarios con JS (progressive
 *   enhancement); esto solo garantiza que el HTML servido ya liste los posts.
 *
 * Ejecutar cuando se añada/publique un post:  node scripts/build-blog-index.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const blogJs = fs.readFileSync(path.join(ROOT, 'public/assets/js/blog.js'), 'utf8');
const m = blogJs.match(/const allPosts = (\[[\s\S]*?\n {2}\]);/);
if (!m) { console.error('No se pudo extraer allPosts de blog.js'); process.exit(1); }
const allPosts = new Function('ASSETS_BASE', 'return ' + m[1])('../assets');

const now = Date.now();
const published = allPosts.filter(p => !p.publishAt || now >= new Date(p.publishAt).getTime());

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = d => new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
const FALLBACK = '../assets/images/cases/e-wear/placeholder-16x9.jpg?v=1';

const cards = published.map(p => {
  const tags = (p.tags || []).map(t => `<span class="post-tag">${esc(t)}</span>`).join('');
  return `        <a href="${esc(p.slug)}" class="post-card-link" style="text-decoration: none; color: inherit;">
          <article class="post-card">
            <img src="${esc(p.cover)}?v=1" alt="${esc(p.title)}" class="post-card-image" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK}'" />
            <div class="post-card-content">
              <h2 class="post-card-title">${esc(p.title)}</h2>
              <div class="post-card-meta">${esc(fmtDate(p.date))} · ${p.readingMinutes} min de lectura</div>
              <p class="post-card-excerpt">${esc(p.excerpt)}</p>
              <div class="post-card-tags">${tags}</div>
            </div>
          </article>
        </a>`;
}).join('\n');

const idxPath = path.join(ROOT, 'public/blog/index.html');
let html = fs.readFileSync(idxPath, 'utf8');
html = html.replace(
  /<div id="posts" class="posts-grid">[\s\S]*?<\/div>/,
  `<div id="posts" class="posts-grid">\n${cards}\n    </div>`
);
fs.writeFileSync(idxPath, html, 'utf8');
console.log(`✓ ${published.length} posts inyectados en public/blog/index.html (excluidos por puerta: ${allPosts.length - published.length}).`);
