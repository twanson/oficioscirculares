#!/usr/bin/env node
/**
 * Pone en las páginas estáticas (public/**\/*.html) la misma cabecera que usan las vistas.
 * Fuente única: views/partials/header.ejs.
 *
 *   node scripts/menu-estatico.mjs              reescribe las páginas que estén desfasadas
 *   node scripts/menu-estatico.mjs --comprobar  no escribe; sale con error si alguna lo está
 *
 * Solo cambia el bloque <nav class="navbar">…</nav> y la versión de nav.js. Añade una página
 * a la lista sin tocar este script: basta con que tenga ese bloque. `npm test` hace la comprobación.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLICO = path.join(RAIZ, 'public');
const EXCLUIDAS = new Set(['_deprecated']);
const NAV = /<nav class="navbar">[\s\S]*?<\/nav>/g;
const NAV_JS = /\/assets\/js\/nav\.js\?v=[\w-]+/g;

/** Cabecera ya renderizada, con los valores por defecto (los de una vista sin CTA propio). */
export function cabecera() {
  const html = ejs.render(fs.readFileSync(path.join(RAIZ, 'views/partials/header.ejs'), 'utf8'), {});
  const nav = html.match(NAV);
  const js = html.match(NAV_JS);
  if (nav?.length !== 1 || js?.length !== 1) throw new Error('header.ejs debe tener un <nav class="navbar"> y un nav.js');
  return { nav: nav[0].replace(/^[ \t]+$/gm, ''), js: js[0] };
}

export function aplicar(html, cab = cabecera()) {
  return html.replace(NAV, () => cab.nav).replace(NAV_JS, () => cab.js);
}

export function paginas(dir = PUBLICO) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) return EXCLUIDAS.has(e.name) ? [] : paginas(ruta);
    if (!e.name.endsWith('.html')) return [];
    const html = fs.readFileSync(ruta, 'utf8');
    // String.search: los literales globales conservan lastIndex con .test().
    return html.search(/<nav class="navbar"/) >= 0 ? [ruta] : [];
  }).sort();
}

/** Problemas por página: menú distinto del de header.ejs, o sin nav.js. */
export function desfasadas() {
  const cab = cabecera();
  return paginas().filter((r) => {
    const html = fs.readFileSync(r, 'utf8');
    return html.match(NAV)?.length !== 1 || !html.match(NAV_JS) || aplicar(html, cab) !== html;
  });
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rel = (r) => path.relative(RAIZ, r);
  const antes = desfasadas();
  if (!process.argv.includes('--comprobar')) {
    const cab = cabecera();
    for (const r of antes) fs.writeFileSync(r, aplicar(fs.readFileSync(r, 'utf8'), cab));
    console.log(`Actualizadas ${antes.length} de ${paginas().length} páginas estáticas.`);
  }
  const quedan = desfasadas();
  if (quedan.length) {
    console.error('Con el menú desfasado o sin nav.js:\n' + quedan.map((r) => '  ' + rel(r)).join('\n'));
    process.exit(1);
  }
  console.log(`Las ${paginas().length} páginas estáticas tienen el menú de header.ejs.`);
}
