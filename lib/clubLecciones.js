'use strict';
// Añadidos a las lecciones del Club al servirlas (no se tocan los HTML originales).
const clubContent = require('./clubContent');

// Bloque «Diagnóstico de ejemplo de tu oficio», que se añade al final de la
// sección «En tu oficio» de cada lección. Si el miembro tiene oficio guardado
// (autodiagnóstico), su ejemplo sale destacado.
function diagnosticosBlock(member) {
  const propio = member && member.oficio ? clubContent.diagnostico(member.oficio) : null;
  const chips = clubContent.DIAGNOSTICOS_EJEMPLO
    .filter(d => clubContent.diagnostico(d.clave))
    .map(d => `<a href="/club/dentro/diagnosticos/${d.clave}" target="_blank" rel="noopener" style="display:inline-block;margin:0 8px 8px 0;padding:7px 14px;border-radius:999px;border:1px solid rgba(2,52,41,.25);color:#023429;text-decoration:none;font-size:14px;font-weight:600;background:#fff">${d.oficio}</a>`)
    .join('');
  const destacado = propio
    ? `<p style="margin:0 0 12px"><a href="/club/dentro/diagnosticos/${propio.clave}" target="_blank" rel="noopener" style="display:inline-block;padding:11px 20px;border-radius:999px;background:#023429;color:#FBF7EF;text-decoration:none;font-weight:700">Ver el diagnóstico de ejemplo de ${propio.oficio} &rarr;</a></p>`
    : '';
  return `<div class="oc-diag-ejemplo" style="margin-top:22px;padding:20px 22px;border-radius:16px;background:#FBF7EF;border:1px solid rgba(2,52,41,.14);font-family:'Manrope',system-ui,sans-serif">`
    + `<p style="margin:0 0 6px;font-weight:800;color:#934A1C;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Diagnóstico de ejemplo</p>`
    + `<p style="margin:0 0 12px;color:#1b1c1c">Mira cómo es un Diagnóstico 3D completo de un taller de tu oficio. Son casos compuestos y anonimizados: ningún nombre es real.</p>`
    + destacado + `<div>${chips}</div></div>`;
}
// Inserta html justo después del cierre del primer <div class="oficios-grid">.
function injectAfterOficiosGrid(html, block) {
  const start = html.indexOf('<div class="oficios-grid"');
  if (start === -1) return html;
  const re = /<\/?div\b[^>]*>/gi;
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth === 0) return html.slice(0, re.lastIndex) + block + html.slice(re.lastIndex);
  }
  return html;
}
module.exports = { diagnosticosBlock, injectAfterOficiosGrid };
