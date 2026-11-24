// Comportamiento común de las páginas .oc-landing (docs/sistema-landing.md).
// 1. Relato del problema: la foto fija cambia con cada paso (.beat[data-foto]); el pie
//    sale de data-pie del paso.
// 2. Aparición al hacer scroll (.reveal). La clase oc-reveal en <html> activa el estado
//    oculto: si este archivo no carga, todo se ve.
(function () {
  if (!('IntersectionObserver' in window)) return;
  var fotos = document.querySelectorAll('#probSticky img');
  var pie = document.getElementById('probPie');
  if (fotos.length) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = parseInt(e.target.dataset.foto, 10);
        fotos.forEach(function (f, j) { f.classList.toggle('activa', i === j); });
        if (pie && e.target.dataset.pie) pie.textContent = e.target.dataset.pie;
      });
    }, { threshold: 0.45 });
    document.querySelectorAll('.beat[data-foto]').forEach(function (b) { obs.observe(b); });
  }
  document.documentElement.classList.add('oc-reveal');
  var rev = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.oc-landing .reveal').forEach(function (el) { rev.observe(el); });
})();
