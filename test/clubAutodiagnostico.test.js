'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const ad = require('../lib/clubAutodiagnostico');

const base = {
  oficio: 'joyeria', donde: ['ferias'], materiales: 'Plata de proveedor',
  frecuencia: '1', online: '0', fotos: '1', precio: '1', perfil: '1',
  frena: 'ferias', tiempo: '1-2h', meta: ''
};
function run(over) {
  const { respuestas, errores } = ad.validar({ ...base, ...over });
  assert.deepEqual(errores, []);
  return ad.calcular(respuestas);
}

test('validar marca las preguntas sin responder', () => {
  const { errores } = ad.validar({});
  assert.deepEqual(errores.sort(), ['donde', 'fotos', 'frecuencia', 'frena', 'materiales', 'oficio', 'online', 'perfil', 'precio', 'tiempo'].sort());
});

test('validar rechaza valores fuera de las opciones', () => {
  const { errores } = ad.validar({ ...base, fotos: '7', oficio: 'astronauta' });
  assert.deepEqual(errores.sort(), ['fotos', 'oficio']);
});

test('la meta es opcional y la casilla de material se guarda', () => {
  const { respuestas, errores } = ad.validar({ ...base, material_sobra_o_falta: 'si' });
  assert.deepEqual(errores, []);
  assert.equal(respuestas.material_sobra_o_falta, true);
  assert.equal(ad.validar(base).respuestas.material_sobra_o_falta, false);
});

test('niveles por puntos: 0-4 empieza, 5-8 publica, 9-12 vende', () => {
  assert.equal(run({ frecuencia: '0', online: '0', fotos: '0', precio: '0', perfil: '0' }).nivel, 'empieza');
  assert.equal(run({ frecuencia: '1', online: '1', fotos: '1', precio: '1', perfil: '0' }).nivel, 'empieza'); // 4
  assert.equal(run({ frecuencia: '1', online: '1', fotos: '1', precio: '1', perfil: '1' }).nivel, 'publica'); // 5
  assert.equal(run({ frecuencia: '2', online: '2', fotos: '2', precio: '1', perfil: '1' }).nivel, 'publica'); // 8
  assert.equal(run({ frecuencia: '3', online: '2', fotos: '2', precio: '1', perfil: '1' }).nivel, 'vende'); // 9
});

test('la excepción a vende solo se aplica con «Más de la mitad»', () => {
  assert.equal(run({ frecuencia: '0', online: '3', fotos: '0', precio: '0', perfil: '0' }).nivel, 'vende');
  assert.equal(run({ frecuencia: '0', online: '2', fotos: '0', precio: '0', perfil: '0' }).nivel, 'empieza');
});

test('siempre tres prioridades; la primera sale de qué te frena', () => {
  const r = run({ frena: 'publicar' });
  assert.equal(r.prioridades.length, 3);
  assert.match(r.prioridades[0], /primer reel/);
});

test('desempate de áreas flojas: precio, fotos, bio, constancia', () => {
  const r = run({ frena: 'ferias', frecuencia: '1', fotos: '1', precio: '1', perfil: '1' });
  assert.match(r.prioridades[1], /precio de una pieza/);
  assert.match(r.prioridades[2], /tres fotos/);
});

test('el área con menos puntos va antes que el desempate', () => {
  const r = run({ frena: 'ferias', frecuencia: '0', fotos: '1', precio: '1', perfil: '1' });
  assert.match(r.prioridades[1], /dos veces por semana/);
});

test('no repite el área que ya cubre la primera prioridad', () => {
  const r = run({ frena: 'precio', frecuencia: '3', fotos: '2', precio: '0', perfil: '0' });
  assert.match(r.prioridades[0], /tres piezas más vendidas/);
  assert.equal(r.prioridades.filter(p => /calculadora de la lección 03/.test(p)).length, 1);
  assert.match(r.prioridades[1], /bio/);
});

test('sin áreas flojas se completa según el nivel', () => {
  const r = run({ frena: 'ferias', frecuencia: '3', online: '3', fotos: '2', precio: '2', perfil: '2' });
  assert.equal(r.nivel, 'vende');
  assert.deepEqual(r.prioridades.slice(1), ['Revisa el radar de ayudas de tu comunidad.', 'Apúntate al reto nº 1.']);
});

test('con menos de una hora se usa la versión corta', () => {
  const r = run({ frena: 'precio', tiempo: 'menos-1h', fotos: '0' });
  assert.match(r.prioridades[0], /tu pieza más vendida/);
  assert.ok(r.prioridades.some(p => /foto principal/.test(p)));
});

test('itinerario según el nivel', () => {
  assert.equal(run({ frecuencia: '0', fotos: '0', precio: '0', perfil: '0' }).itinerario[1], 'leccion-04-la-bio-que-vende');
  assert.equal(run({ online: '3' }).itinerario[1], 'biblioteca-plantillas');
});

test('ejemplo por oficio: textil a lana, cerámica a barro, otro sin ejemplo', () => {
  assert.equal(ad.ejemploDeOficio('textil'), 'lana');
  assert.equal(ad.ejemploDeOficio('ceramica'), 'barro');
  assert.equal(ad.ejemploDeOficio('otro'), null);
  assert.equal(ad.ejemploDeOficio('madera'), 'madera');
  assert.equal(ad.ejemploDeOficio(null), null);
});

test('todos los slugs del itinerario existen en el Club', () => {
  const clubContent = require('../lib/clubContent');
  for (const lista of Object.values(ad.ITINERARIOS)) for (const s of lista) assert.ok(clubContent.get(s), s);
  for (const o of ad.OFICIOS) {
    const e = ad.ejemploDeOficio(o.clave);
    if (e) assert.ok(clubContent.diagnostico(e), `sin PDF para ${o.clave}`);
  }
});
