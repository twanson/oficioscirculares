'use strict';
// Testimonios de la web: única fuente en data/testimonios.json (encargo de diseño, apartado 9).
// paraPagina('portada') -> los que pueden salir en esa página, en el orden del archivo
// (primero los que tienen permiso con nombre). todosConPermiso(lista) dice si se puede
// usar la frase «publicados con su permiso» al pie de esa lista.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'testimonios.json');

function todos() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8')).testimonios;
}

// 'si' (los cuatro primeros) y 'confirmado' (24 nov 2026) valen igual.
function conPermiso(t) { return t.permiso === 'si' || t.permiso === 'confirmado'; }

function paraPagina(pagina) {
  const lista = todos().filter(t => (t.paginas || []).includes(pagina));
  return lista.filter(conPermiso).concat(lista.filter(t => !conPermiso(t)));
}

function todosConPermiso(lista) {
  return lista.length > 0 && lista.every(conPermiso);
}

// Nota al pie de una lista: solo dice «con su permiso» de quien lo ha dado.
function nota(lista) {
  if (todosConPermiso(lista)) return 'Testimonios reales, publicados con su permiso.';
  const sin = lista.filter(t => !conPermiso(t)).length;
  return sin === 1
    ? 'Los mensajes con nombre se publican con permiso de quien los firma. El que va sin nombre es un mensaje real recibido en la red.'
    : 'Los mensajes con nombre se publican con permiso de quien los firma. Los que van sin nombre son mensajes reales recibidos en la red.';
}

module.exports = { todos, paraPagina, conPermiso, todosConPermiso, nota };
