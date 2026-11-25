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

// Rejilla de Comunidad (portada). Cada tarjeta con foto ocupa dos filas; las demás, una.
// Primero las que tienen foto. Plegada se ven seis casillas: dos filas de tres columnas o
// tres de dos. La última tarjeta se ensancha para cerrar su fila; si sobra hueco a tres
// columnas, ese sitio es para el texto más largo, que en una columna descuadraría su fila.
const CASILLAS_VISIBLES = 6;
function rejilla(lista) {
  const conFoto = lista.filter(t => t.foto);
  const sinFoto = lista.filter(t => !t.foto);
  if (sinFoto.length > 1 && (conFoto.length * 2 + sinFoto.length) % 3) {
    const larga = sinFoto.reduce((a, b) => (b.texto.length > a.texto.length ? b : a));
    sinFoto.push(sinFoto.splice(sinFoto.indexOf(larga), 1)[0]);
  }
  const orden = conFoto.concat(sinFoto);
  let casillas = 0;
  const tarjetas = orden.map(t => {
    const plegada = casillas >= CASILLAS_VISIBLES;
    casillas += t.foto ? 2 : 1;
    const clases = ['testimonio-v2'];
    if (t.foto) clases.push('oc-comunidad-con-foto');
    if (plegada) clases.push('oc-comunidad-mas');
    return { t, plegada, clases };
  });
  const ultima = tarjetas[tarjetas.length - 1];
  if (ultima && !ultima.t.foto && ultima.plegada) {
    if (casillas % 3) ultima.clases.push('oc-cierra3-' + (4 - casillas % 3));
    if (casillas % 2) ultima.clases.push('oc-cierra2-2');
  }
  return tarjetas;
}

module.exports = { todos, rejilla, paraPagina, conPermiso, todosConPermiso, nota };
