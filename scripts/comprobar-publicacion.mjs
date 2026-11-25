// Comprobación posterior a publicar. Solo lectura, salvo el alta de prueba con --alta.
//   npm run comprobar -- https://www.oficioscirculares.com --esperar --alta prueba-…@example.com
//   npm run comprobar -- http://localhost:3055 --club true (ensayo)
// --club true|false: si el Club debe verse (CLUB_VISIBLE de ese sitio). En www, false si no se dice otra cosa.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const BASE = (args[0] || '').replace(/\/$/, '');
if (!/^https?:\/\//.test(BASE)) { console.error('Falta la dirección base'); process.exit(2); }
const iAlta = args.indexOf('--alta');
const ALTA = iAlta >= 0 ? args[iAlta + 1] : null;
if (iAlta >= 0 && !/^prueba-[^@]+@example\.com$/.test(ALTA || '')) { console.error('--alta exige una dirección prueba-…@example.com'); process.exit(2); }
const iClub = args.indexOf('--club');
const CLUB = iClub >= 0 ? args[iClub + 1] : /^https:\/\/www\.oficioscirculares\.com$/.test(BASE) ? 'false' : '';
if (!['true', 'false'].includes(CLUB)) { console.error('Falta --club true o --club false'); process.exit(2); }
const CLUB_VISIBLE = CLUB === 'true';
if (ALTA && !CLUB_VISIBLE) { console.error('Con el Club oculto no hay lista de espera: quita --alta'); process.exit(2); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pedir = (r, o = {}) => fetch(BASE + r, { redirect: 'manual', signal: AbortSignal.timeout(20000), ...o });
// Límites: una página del navegador, 60 s; la ejecución entera, 10 min. Al pasarse se corta y se dice dónde.
const LIMITE_PAGINA = 60000, LIMITE_TOTAL = 600000;
let fallos = 0;
let apartado = null; // en el navegador, los resultados de una página se guardan hasta saber que son fiables
const anotar = ([n, c, d]) => { if (!c) fallos++; console.log(`${c ? 'BIEN ' : 'FALLO'} ${n}${d ? ' · ' + d : ''}`); };
const ok = (n, c, d = '') => apartado ? apartado.push([n, c, d]) : anotar([n, c, d]);
const grupo = t => console.log('\n# ' + t);
let actual = 'inicio';
async function probar(n, f) { actual = n; try { await f(); } catch (e) { ok(n, false, e.message); } }
const texto = h => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&iquest;/g, '¿').replace(/\s+/g, ' ');
const h1 = h => texto((h.match(/<h1[\s\S]*?<\/h1>/) || [''])[0]);

const PAGINAS = [
  ['/', 'tiene más valor del que crees'],
  ['/servicios', 'Por dónde entras'],
  ['/servicios/talleres', 'se entienda y se venda'],
  ['/servicios/empresas', 'al caso que puedes contar'],
  ['/servicios/diagnostico-3d', 'con lo que ya tienes'],
  ['/servicios/roadmap-3d', 'Tu plan paso a paso'],
  ['/servicios/sprint-3d', 'te ayudamos a contarlo'],
  ['/impulso-3d', 'trabajo extraordinario'],
  ['/impacto', 'Lo que ha movido la red'],
  ['/conecta-lana', 'Conecta Lana'],
  ['/blog/joyeria-plata-recuperada/', 'joyería con plata recuperada'],
  ['/oficios/ceramica-artesanal', ''],
  ['/oficios/textil-sostenible', '']
];

if (args.includes('--esperar')) {
  let listo = false;
  for (let i = 0; i < 60 && !listo; i++) {
    try { listo = (await pedir('/impacto')).status === 200; } catch {}
    if (!listo) await sleep(10000);
  }
  ok('La versión nueva está desplegada (/impacto responde)', listo);
  if (listo) await sleep(20000);
}

// El límite total empieza a contar cuando la versión nueva ya responde.
let c, ws, cafe;
const cerrar = () => { try { ws?.close(); } catch {} c?.kill(); };
setTimeout(() => {
  console.log(`FALLO Corte a los 10 minutos · se quedó en ${actual}`);
  cerrar(); cafe?.kill(); process.exit(3);
}, LIMITE_TOTAL).unref();

grupo('Páginas');
for (const [r, frase] of PAGINAS) await probar(r, async () => {
  const p = await pedir(r), h = await p.text(), t = h1(h);
  const resto = h.match(/\[PENDIENTE|\{\{precio|oficioscirculares-production/g);
  ok(r, p.status === 200 && !!t.trim() && t.includes(frase) && !resto, `${p.status}, «${t.trim().slice(0, 50)}»${resto ? ', restos: ' + resto : ''}`);
});

grupo(`Club (${CLUB_VISIBLE ? 'visible' : 'oculto'})`);
if (!CLUB_VISIBLE) {
  for (const r of ['/club', '/club/', '/Club', '/club/lista-espera', '/club/entrar', '/club/bienvenida', '/club/salir', '/club/dentro', '/club/dentro/empezar', '/club/dentro/directos', '/auth/callback'])
    await probar(r, async () => { const p = await pedir(r); ok(`${r} no existe`, p.status === 404, String(p.status)); });
  for (const r of ['/club/lista-espera', '/club/entrar', '/club/dentro/empezar'])
    await probar(r, async () => { const p = await pedir(r, { method: 'POST' }); ok(`POST ${r} no existe`, p.status === 404, String(p.status)); });
} else await probar('/club', async () => {
  const p = await pedir('/club'), h = await p.text();
  ok('/club carga', p.status === 200, String(p.status));
  ok('Sin enlaces de pago de Stripe', !/(buy|checkout|donate|billing|book)\.stripe\.com/i.test(h));
  ok('Plazas cerradas: lleva a la lista de espera', h.includes('/club/lista-espera'));
  for (const r of ['/club', '/club/lista-espera', '/club/entrar', '/club/bienvenida']) {
    const q = await pedir(r), hh = await q.text();
    ok(`${r} con noindex en página y cabecera`, /<meta[^>]+robots[^>]+noindex/i.test(hh) && /noindex/.test(q.headers.get('x-robots-tag') || ''));
    ok(`${r} sin enlaces de pago`, !/(buy|checkout|donate)\.stripe\.com/i.test(hh));
  }
  const l = await (await pedir('/club/lista-espera')).text();
  ok('La lista de espera dice que las plazas están cerradas', /plazas fundador están cerradas/i.test(texto(l)));
});

grupo('Redirecciones');
for (const r of ['/casos/e-wear', '/casos/e-wear/']) await probar(r, async () => {
  const p = await pedir(r), l = p.headers.get('location') || '';
  ok(r, p.status === 301 && l.endsWith('/blog/joyeria-plata-recuperada/'), `${p.status} → ${l}`);
});

grupo('Retirados (404)');
for (const r of ['/downloads/diagnosticos/ejemplo-diagnostico-textil-sostenible.pdf', '/assets/images/pottery_hands.jpg', '/assets/images/workshop_tools.jpg',
  '/assets/images/blog/incendios-despoblacion-oficios-monte/incendio-monte.jpg']) await probar(r, async () => {
  const p = await pedir(r); ok(r, p.status === 404, String(p.status));
});
for (const r of ['/oficios/textil-sostenible', '/blog/incendios-despoblacion-oficios-monte/', '/', '/oficios/ceramica-artesanal']) await probar(r, async () => {
  const h = await (await pedir(r)).text();
  ok(`${r} no enlaza nada retirado`, !/ejemplo-diagnostico-textil|pottery_hands|workshop_tools|incendio-monte\.jpg/.test(h));
});
for (const r of ['/downloads/ejemplo-roadmap-3d.pdf', '/downloads/mini-caso-sprint-3d.pdf', '/assets/images/brand/og-default.png', '/assets/images/oficios/hilandia-escarmenando.jpg'])
  await probar(r, async () => { const p = await pedir(r, { method: 'HEAD' }); ok(`${r} sigue disponible`, p.status === 200, String(p.status)); });

grupo('Sitemap');
await probar('sitemap', async () => {
  const x = (await (await pedir('/sitemap.xml')).text()).replace(/<!--[\s\S]*?-->/g, '');
  const locs = [...x.matchAll(/<loc>\s*([^<\s]+)/g)].map(m => new URL(m[1]).pathname);
  for (const r of ['/servicios', '/servicios/talleres', '/servicios/empresas', '/impacto', '/blog/joyeria-plata-recuperada/']) ok(`Incluye ${r}`, locs.includes(r));
  ok('No incluye nada de /club', !locs.some(l => /^\/club(\/|$)/.test(l)));
  ok('No incluye /casos/e-wear', !locs.some(l => l.startsWith('/casos/e-wear')));
});

grupo('Enlaces internos y menciones al Club');
await probar('enlaces', async () => {
  const x = (await (await pedir('/sitemap.xml')).text()).replace(/<!--[\s\S]*?-->/g, '');
  const rutas = new Set([...x.matchAll(/<loc>\s*([^<\s]+)/g)].map(m => new URL(m[1]).pathname).concat(PAGINAS.map(p => p[0]), ['/recursos/gracias', '/gracias', '/contacto', '/404.html']));
  const enlaces = new Map(), menciones = [];
  for (const r of rutas) {
    const p = await pedir(r);
    if (p.status >= 300 || !/html/.test(p.headers.get('content-type') || '')) { if (p.status >= 400 && r !== '/404.html') ok(`${r} carga`, false, String(p.status)); continue; }
    const h = await p.text();
    for (const m of h.replace(/<!--[\s\S]*?-->|<(script|style)[\s\S]*?<\/\1>/g, '').matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)) {
      let u; try { u = new URL(m[1].replace(/&amp;/g, '&'), BASE + r); } catch { continue; }
      if (/^https?:$/.test(u.protocol) && (u.origin === new URL(BASE).origin || u.host === 'www.oficioscirculares.com') && !enlaces.has(u.pathname)) enlaces.set(u.pathname, r);
    }
    // Texto visible, textos alternativos, descripciones, títulos, datos estructurados y enlaces; no clases ni rutas de imágenes.
    const ld = [...h.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join(' ');
    const limpio = h.replace(/<!--[\s\S]*?-->/g, '');
    const atr = [...limpio.matchAll(/\s(?:alt|title|aria-label|content|placeholder|value)="([^"]*)"/g)].map(m => m[1]).join(' · ');
    const todo = `${texto(limpio)} · ${atr} · ${ld}`.replace(/\/assets\/\S+/g, ' ');
    for (const m of todo.matchAll(/\bclub\b/gi)) menciones.push(`${r}: «…${todo.slice(Math.max(0, m.index - 45), m.index + 45).trim()}…»`);
    for (const m of limpio.matchAll(/href="((?:https:\/\/www\.oficioscirculares\.com)?\/club[^"]*)"/gi)) menciones.push(`${r}: enlace ${m[1]}`);
  }
  const rotos = [], lista = [...enlaces];
  for (let i = 0; i < lista.length; i += 8) await Promise.all(lista.slice(i, i + 8).map(async ([l, de]) => {
    let ruta = l; for (let k = 0; k < 4; k++) {
      const p = await pedir(ruta, { method: 'HEAD' }); const s = p.headers.get('location');
      if (p.status >= 300 && p.status < 400 && s) { const u = new URL(s, BASE + ruta); if (u.origin !== new URL(BASE).origin && u.host !== 'www.oficioscirculares.com') return; ruta = u.pathname; continue; }
      if (p.status >= 400) rotos.push(`${l} (${p.status}, en ${de})`); return;
    }
  }));
  ok(`Ningún enlace interno roto (${lista.length} enlaces, ${rutas.size} páginas)`, rotos.length === 0, rotos.join(' · '));
  if (!CLUB_VISIBLE) {
    for (const m of new Set(menciones)) console.log('      ' + m);
    ok('Nada nombra ni enlaza el Club', menciones.length === 0, menciones.length ? `${menciones.length} en ${new Set(menciones.map(m => m.split(':')[0])).size} páginas` : '');
  }
});

grupo('Navegador: consola y menú «Servicios»');
try {
  // Si la pantalla se apaga a mitad, Chrome deja de pintar y las transiciones del menú no avanzan.
  if (process.platform === 'darwin') { cafe = spawn('caffeinate', ['-dims', '-w', String(process.pid)], { stdio: 'ignore' }); cafe.on('error', () => {}); }
  let id = 0, er = []; const p = new Map();
  const abrir = async () => {
  const port = 9800 + Math.floor(Math.random() * 100);
  c = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, '--no-first-run', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`, 'about:blank'], { stdio: 'ignore' });
  let t; for (let i = 0; i < 50 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} if (!t) await sleep(200); }
  ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id) { p.get(d.id)?.(d); p.delete(d.id); }
    else if (d.method === 'Runtime.exceptionThrown') er.push(d.params.exceptionDetails.exception?.description?.split('\n')[0] || d.params.exceptionDetails.text);
    else if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') er.push('consola: ' + d.params.args.map(a => a.value || a.description).join(' ').slice(0, 160));
    else if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') {
      const u = d.params.entry.url || '', l = 'registro: ' + d.params.entry.text.slice(0, 120) + ' ' + u;
      // Un fallo de un servicio externo (GTM, Clarity…) se informa aparte; no cuenta como fallo de la web.
      if (/^https?:/.test(u) && new URL(u).host !== new URL(BASE).host) console.log('AVISO externo · ' + l); else er.push(l);
    }
  };
  };
  // Sin límite de espera, un Chrome que se cierra a mitad dejaría la comprobación colgada.
  const send = (method, params = {}) => new Promise((r, x) => {
    if (ws.readyState !== 1) return x(new Error('Chrome se ha cerrado'));
    const i = ++id, s = ws;
    const acabar = f => v => { clearTimeout(reloj); s.removeEventListener('close', roto); p.delete(i); f(v); };
    const roto = () => acabar(x)(new Error('Chrome se ha cerrado'));
    const reloj = setTimeout(() => acabar(x)(new Error('Chrome no responde')), 20000);
    s.addEventListener('close', roto);
    p.set(i, acabar(r));
    s.send(JSON.stringify({ id: i, method, params }));
  });
  const ev = async e => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result?.result?.value;
  const tecla = async (key, n) => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key, code: key, windowsVirtualKeyCode: n, ...(key === 'Enter' && type === 'keyDown' ? { text: '\r' } : {}) }); await sleep(250); };
  const clic = async sel => {
    const r = await ev(`(()=>{const b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()`);
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: r[0], y: r[1], button: 'left', clickCount: 1 });
    await sleep(400);
  };
  const preparar = async () => {
  await abrir();
  for (const d of ['Page', 'Runtime', 'Network', 'Log']) await send(d + '.enable');
  // Marca la visita como interna para no ensuciar la medición.
  await send('Network.setCookie', { name: 'oc_internal', value: 'internal', url: BASE });
  };
  await preparar();
  const pinta = async () => (await ev(`Promise.race([new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true)))),new Promise(r=>setTimeout(()=>r(false),2000))])`)) === true;
  const MENU = '#servicios-dropdown-menu', BOT = '#servicios-dropdown-btn';
  const abierto = `(()=>{const m=document.querySelector('${MENU}');const r=m.getBoundingClientRect();return m.classList.contains('show')&&getComputedStyle(m).visibility!=='hidden'&&r.height>50})()`;
  const DESTINOS = [...(CLUB_VISIBLE ? ['/club'] : []), '/servicios/diagnostico-3d', '/impulso-3d', '/servicios/empresas', '/servicios/roadmap-3d', '/servicios/sprint-3d', '/servicios'];
  const pagina = async r => {
    er = [];
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: BASE + r }); await sleep(3500);
    ok(`${r} consola limpia`, er.length === 0, [...new Set(er)].join(' | '));
    if (!(await ev(`!!document.querySelector('${BOT}')`))) { ok(`${r} menú`, ['/conecta-lana'].includes(r), 'la página no lleva el menú común'); return; }
    const destinos = await ev(`[...document.querySelectorAll('${MENU} a')].map(a=>new URL(a.href,location.href).pathname.replace(/(.)\\/$/,'$1'))`);
    ok(`${r} menú: destinos`, DESTINOS.every(d => destinos.includes(d)), DESTINOS.filter(d => !destinos.includes(d)).join(' '));
    if (!CLUB_VISIBLE) ok(`${r} menú y pie sin el Club`, !(await ev(`[...document.querySelectorAll('.navbar, footer')].some(n=>/\\bclub\\b/i.test(n.outerHTML.replace(/\\/assets\\/\\S+/g,'')))`)));
    await ev('window.scrollTo(0,0)');
    await clic(BOT); const a = await ev(abierto);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 640, y: 780, button: 'left', clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 640, y: 780, button: 'left', clickCount: 1 }); await sleep(300);
    const sigue = await ev(`location.pathname`) === new URL(BASE + r).pathname;
    ok(`${r} menú con ratón`, a && sigue && !(await ev(abierto)));
    await ev(`document.querySelector('${BOT}').focus()`); await tecla('Enter', 13);
    const b = await ev(abierto) && await ev(`document.activeElement.classList.contains('dropdown-item')`);
    const antes = await ev(`document.activeElement.getAttribute('href')`); await tecla('ArrowDown', 40);
    const mueve = antes !== await ev(`document.activeElement.getAttribute('href')`); await tecla('Escape', 27);
    ok(`${r} menú con teclado (Intro, flecha, Escape)`, b && mueve && !(await ev(abierto)));
    await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: BASE + r }); await sleep(2500);
    await clic('#hamburger'); const m1 = await ev(`document.querySelector('#nav-menu').classList.contains('active')`);
    await ev(`document.querySelector('${BOT}').scrollIntoView({block:'center'})`); await clic(BOT); const m2 = await ev(abierto);
    await ev(`window.scrollTo(0,0)`); await clic('#hamburger'); const m3 = !(await ev(`document.querySelector('#nav-menu').classList.contains('active')`));
    ok(`${r} menú en móvil`, m1 && m2 && m3, m1 && m2 && m3 ? '' : `abre ${m1}, Servicios ${m2}, cierra ${m3}`);
    ok(`${r} sin desborde en móvil`, !(await ev('document.documentElement.scrollWidth>376')));
  };
  // Solo se repite una página si Chrome ha dejado de pintar: un fallo con Chrome sano cuenta a la primera.
  for (const [r] of [...PAGINAS, ...(CLUB_VISIBLE ? [['/club']] : [])]) {
    for (let intento = 1; ; intento++) {
      apartado = [];
      let reloj, pasado = false;
      await probar(r, () => Promise.race([pagina(r), new Promise(x => { reloj = setTimeout(() => { pasado = true; x(); }, LIMITE_PAGINA); })]));
      clearTimeout(reloj);
      if (pasado) { const res = apartado; apartado = null; res.forEach(anotar); ok(r, false, 'pasa de 60 s; se corta aquí'); throw new Error(`ejecución cortada en ${r}`); }
      const res = apartado; apartado = null;
      if (res.every(x => x[1]) || (await pinta().catch(() => false))) { res.forEach(anotar); break; }
      if (intento === 3) { res.forEach(anotar); console.log(`AVISO Chrome no pinta o no responde en ${r} tras 3 intentos`); break; }
      console.log(`REINTENTO ${r} · Chrome ha dejado de pintar o de responder; se abre otro`);
      cerrar(); await preparar();
    }
  }
} catch (e) { ok('Navegador', false, e.message); }
finally { cerrar(); cafe?.kill(); }

grupo('Lista de espera');
if (ALTA) await probar('alta', async () => {
  const p = await pedir('/club/lista-espera', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ email: ALTA }) });
  const l = p.headers.get('location') || '';
  ok('Brevo acepta el alta de prueba', p.status === 302 && l.endsWith('?ok=1'), `${p.status} ${l}`);
  console.log(`      Contacto que borrar en Brevo (lista 14): ${ALTA}`);
}); else console.log(CLUB_VISIBLE ? '      Sin ensayar: falta --alta' : '      No aplica: el Club está oculto');

console.log(`\n${fallos ? fallos + ' FALLOS' : 'TODO BIEN'}`);
process.exit(fallos ? 1 : 0);
