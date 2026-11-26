'use strict';
// CLUB_VISIBLE: si el Club existe para el visitante. Solo 'true' (o 1, si, yes) lo enseña;
// sin variable, oculto. Staging: true. Producción: false hasta nuevo aviso.
// No confundir con CLUB_ABIERTO (bloque de entrada en el Diagnóstico) ni con plazas_abiertas.
function clubVisible() {
  return /^(1|true|si|sí|yes)$/i.test(String(process.env.CLUB_VISIBLE || '').trim());
}

// Todas las direcciones del Club: landing, alta, lista de espera, acceso, área de miembros,
// autodiagnóstico y la vuelta del enlace mágico. Express no distingue mayúsculas.
function esRutaClub(ruta) {
  let r = String(ruta || '');
  try { r = decodeURIComponent(r); } catch (e) { /* se mira tal cual */ }
  return /^\/+(club|auth\/callback)(\/|$)/i.test(r);
}

// Las páginas estáticas llevan el menú completo con el Club entre <!--club--> y <!--/club-->.
// Al servirlas se quita lo marcado si está oculto, y solo las marcas si está visible.
const MARCAS = /[ \t]*<!--club-->[ \t]*\n?([\s\S]*?)[ \t]*<!--\/club-->[ \t]*\n?/g;
function filtrar(html, visible = clubVisible()) {
  return html.replace(MARCAS, (_, dentro) => (visible ? dentro : ''));
}

module.exports = { clubVisible, esRutaClub, filtrar };
