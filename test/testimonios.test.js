'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const t = require('../lib/testimonios');

const PAGO = ['servicios-talleres', 'servicios-empresas', 'diagnostico-talleres', 'impulso-3d', 'roadmap-3d', 'sprint-3d'];

test('los textos autorizados coinciden letra a letra con los aprobados en las vistas', () => {
  const vistas = ['views/conecta-lana.ejs', 'views/club.ejs']
    .map(f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8')).join('\n')
    .replace(/&mdash;/g, '—').replace(/&iacute;/g, 'í').replace(/&aacute;/g, 'á');
  for (const x of t.todos().filter(x => x.permiso === 'si')) {
    assert.ok(vistas.includes(x.texto), `texto de ${x.id} no está literal en las vistas`);
  }
});

test('ningún testimonio de usuarios de Conecta Lana ni sin permiso aparece en páginas de pago', () => {
  for (const x of t.todos()) {
    if (x.contexto || x.permiso !== 'si') {
      for (const p of PAGO) assert.ok(!x.paginas.includes(p), `${x.id} en ${p}`);
    }
  }
});

test('el mensaje sin nombre va sin foto y con permiso pendiente; los nueve con nombre, permiso', () => {
  const sin = t.todos().filter(x => !x.nombre);
  assert.strictEqual(sin.length, 1);
  for (const x of sin) { assert.strictEqual(x.permiso, 'pendiente'); assert.ok(!x.foto); }
  for (const x of t.todos().filter(x => x.nombre)) assert.ok(t.conPermiso(x), x.id);
});

test('reparto por páginas: portada 10, conecta-lana e impacto los autorizados de lana + 1, 2 y 6', () => {
  assert.strictEqual(t.paraPagina('portada').length, 10);
  assert.deepStrictEqual(t.paraPagina('impacto').map(x => x.id), ['esther', 'jorge', 'cl-usuaria-entorno', 'cl-taller-textil', 'cl-usuaria-cercania']);
  assert.ok(!t.todosConPermiso(t.paraPagina('portada')));
  assert.match(t.nota(t.paraPagina('portada')), /^Los mensajes con nombre se publican con permiso/);
  assert.deepStrictEqual(t.todos().find(x => x.id === 'artesana-textil').paginas, ['portada']);
  assert.ok(t.todosConPermiso(t.paraPagina('club')));
});

test('las fotos de los testimonios existen en public/', () => {
  for (const x of t.todos().filter(x => x.foto)) {
    assert.ok(x.foto.startsWith('/assets/images/'), x.id);
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', x.foto)), `${x.id}: falta ${x.foto}`);
  }
});

test('rejilla de Comunidad: con foto primero, pliegue en fila completa y sin hueco al final', () => {
  const lista = t.paraPagina('portada');
  const hoy = t.rejilla(lista);
  // Hoy: dos con foto (Blanca y Olga) + ocho sin foto = 12 casillas, filas completas a 3 y a 2.
  assert.deepStrictEqual(hoy.slice(0, 2).map(c => c.t.id), ['blanca', 'cl-taller-textil']);
  assert.strictEqual(hoy.filter(c => !c.plegada).length, 4);
  assert.ok(hoy.every(c => !c.clases.some(k => k.startsWith('oc-cierra'))));
  // Con una sola foto (11 casillas) el texto más largo va al final y cierra la fila.
  const una = t.rejilla(lista.map(x => x.id === 'cl-taller-textil' ? { ...x, foto: null } : x));
  assert.strictEqual(una[0].t.id, 'blanca');
  assert.strictEqual(una.filter(c => !c.plegada).length, 5);
  assert.strictEqual(una[9].t.id, 'cl-usuaria-entorno');
  assert.ok(una[9].clases.includes('oc-cierra3-2') && una[9].clases.includes('oc-cierra2-2'));
});
