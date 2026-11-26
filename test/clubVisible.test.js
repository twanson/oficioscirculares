'use strict';
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { spawn } = require('node:child_process');
const { esRutaClub, filtrar } = require('../lib/clubVisible');

test('reconoce las rutas del Club y ninguna otra', () => {
  for (const r of ['/club', '/club/', '/Club', '/club/lista-espera', '/club/dentro/empezar', '/auth/callback', '/%63lub/entrar']) assert.ok(esRutaClub(r), r);
  for (const r of ['/', '/clubes', '/assets/images/club/x.jpg', '/assets/css/club.css', '/blog/club', '/webhooks/stripe']) assert.ok(!esRutaClub(r), r);
});

test('las marcas del menú: se quitan o se queda lo de dentro', () => {
  assert.strictEqual(filtrar('a<!--club--><b/><!--/club-->c', true), 'a<b/>c');
  assert.strictEqual(filtrar('a<!--club--><b/><!--/club-->c', false), 'ac');
});

async function conServidor(valor, f) {
  const puerto = 41000 + Math.floor(Math.random() * 9000);
  const s = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'), stdio: 'ignore',
    env: { ...process.env, PORT: String(puerto), CLUB_VISIBLE: valor, CLUB_ABIERTO: 'true', BREVO_API_KEY: '', BREVO_WAITLIST_LIST_ID: '' }
  });
  const pedir = (r, o = {}) => fetch(`http://localhost:${puerto}${r}`, { redirect: 'manual', ...o });
  try {
    for (let i = 0; ; i++) {
      try { await pedir('/robots.txt'); break; } catch (e) { if (i > 80) throw e; await new Promise(r => setTimeout(r, 100)); }
    }
    await f(pedir);
  } finally { s.kill(); }
}

const RUTAS = ['/club', '/club/', '/CLUB', '/club/lista-espera', '/club/entrar', '/club/bienvenida', '/club/salir', '/club/dentro', '/club/dentro/empezar', '/club/dentro/directos', '/auth/callback'];
const PAGINAS = ['/', '/blog/', '/faqs/', '/recursos', '/servicios/empresas', '/oficios/ceramica-artesanal', '/recursos/gracias'];
const menuYPie = h => (h.match(/<nav class="navbar">[\s\S]*?<\/nav>/) || [''])[0] + (h.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];

test('CLUB_VISIBLE=false: rutas 404 y sin Club en menú, pie y sitemap', async () => {
  await conServidor('false', async pedir => {
    for (const r of RUTAS) assert.strictEqual((await pedir(r)).status, 404, r);
    for (const r of ['/club/lista-espera', '/club/entrar', '/club/dentro/empezar', '/club/dentro/votar']) assert.strictEqual((await pedir(r, { method: 'POST' })).status, 404, 'POST ' + r);
    for (const r of PAGINAS) {
      const t = menuYPie(await (await pedir(r)).text());
      assert.ok(t.includes('navbar'), r);
      assert.ok(!/\bclub\b/i.test(t), r);
    }
    for (const r of [...PAGINAS, '/servicios', '/servicios/talleres', '/servicios/diagnostico-3d', '/impulso-3d', '/impacto', '/conecta-lana']) {
      const h = (await (await pedir(r)).text()).replace(/<!--[\s\S]*?-->|<(script|style)[\s\S]*?<\/\1>/g, '').replace(/\/assets\/\S+/g, '');
      assert.ok(!/\bclub\b(?!-)/i.test(h), `${r}: ${(h.match(/.{0,60}\bclub\b(?!-).{0,40}/i) || [''])[0]}`);
    }
    assert.ok(!/\/club/.test(await (await pedir('/sitemap.xml')).text()));
  });
});

test('CLUB_VISIBLE sin valor es lo mismo que oculto', async () => {
  await conServidor('', async pedir => assert.strictEqual((await pedir('/club')).status, 404));
});

test('CLUB_VISIBLE=true: el Club sigue como estaba', async () => {
  await conServidor('true', async pedir => {
    for (const r of ['/club', '/club/lista-espera', '/club/entrar', '/club/bienvenida']) assert.strictEqual((await pedir(r)).status, 200, r);
    for (const r of PAGINAS) {
      const h = await (await pedir(r)).text();
      assert.strictEqual((menuYPie(h).match(/<a href="\/club" class="(dropdown-item|nav-link)"/g) || []).length, 2, r);
    }
    for (const [r, f] of [['/', 'el Club, el Diagn'], ['/servicios', 'Club: 15'], ['/servicios/talleres', 'Tres formas'], ['/servicios/talleres', 'Conoce el Club'], ['/faqs/', 'Club de Oficios Circulares: 15'], ['/oficios/ceramica-artesanal', '<span>Club de Oficios'], ['/servicios/diagnostico-3d', 'Entrada al Club']]) {
      assert.ok((await (await pedir(r)).text()).includes(f), `${r} sin «${f}»`);
    }
  });
});
