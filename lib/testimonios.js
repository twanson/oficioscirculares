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

function paraPagina(pagina) {
  const lista = todos().filter(t => (t.paginas || []).includes(pagina));
  return lista.filter(t => t.permiso === 'si').concat(lista.filter(t => t.permiso !== 'si'));
}

function todosConPermiso(lista) {
  return lista.length > 0 && lista.every(t => t.permiso === 'si');
}

module.exports = { todos, paraPagina, todosConPermiso };
