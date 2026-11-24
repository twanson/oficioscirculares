'use strict';
// Autodiagnóstico del alta en el Club (aprobado por Jose el 21 nov 2026).
// Preguntas, validación y regla de asignación: nivel, itinerario y tres
// prioridades. Sin acceso a base de datos: el guardado va en clubMembers.
// La regla está documentada en docs/club-autodiagnostico.md.

const OFICIOS = [
  { clave: 'alimentacion', texto: 'Alimentación' },
  { clave: 'barro', texto: 'Barro y alfarería' },
  { clave: 'ceramica', texto: 'Cerámica' },
  { clave: 'fibras', texto: 'Cestería y fibras vegetales' },
  { clave: 'construccion', texto: 'Construcción tradicional' },
  { clave: 'cosmetica', texto: 'Cosmética natural' },
  { clave: 'cuero', texto: 'Cuero' },
  { clave: 'encuadernacion', texto: 'Encuadernación' },
  { clave: 'forja', texto: 'Forja y herrería' },
  { clave: 'joyeria', texto: 'Joyería' },
  { clave: 'lana', texto: 'Lana y costura' },
  { clave: 'madera', texto: 'Madera' },
  { clave: 'upcycling', texto: 'Restauración y upcycling' },
  { clave: 'textil', texto: 'Textil' },
  { clave: 'turismo', texto: 'Turismo rural' },
  { clave: 'vidrio', texto: 'Vidrio' },
  { clave: 'otro', texto: 'Otro' }
];

// Oficio del miembro -> diagnóstico de ejemplo (clave de clubContent.DIAGNOSTICOS_EJEMPLO).
// Textil no tiene ejemplo propio: va al de lana. Cerámica va al de barro.
// «Otro» no tiene ejemplo destacado: ve la lista completa.
const EJEMPLO_DE_OFICIO = { textil: 'lana', ceramica: 'barro', otro: null };
function ejemploDeOficio(oficio) {
  if (!oficio) return null;
  if (Object.prototype.hasOwnProperty.call(EJEMPLO_DE_OFICIO, oficio)) return EJEMPLO_DE_OFICIO[oficio];
  return oficio;
}

const PREGUNTAS = [
  { id: 'oficio', tipo: 'unica', titulo: '¿Cuál es tu oficio?',
    opciones: OFICIOS.map(o => ({ valor: o.clave, texto: o.texto })) },
  { id: 'donde', tipo: 'varias', titulo: '¿Dónde vendes hoy?', ayuda: 'Puedes marcar varias.',
    opciones: [
      { valor: 'ferias', texto: 'Ferias y mercados' },
      { valor: 'tienda', texto: 'Tienda o taller abierto al público' },
      { valor: 'encargo', texto: 'Por encargo, boca a boca' },
      { valor: 'redes', texto: 'Instagram u otras redes' },
      { valor: 'online', texto: 'Tienda online propia' },
      { valor: 'marketplace', texto: 'Etsy u otro marketplace' },
      { valor: 'otras-tiendas', texto: 'Tiendas de otros' }
    ] },
  { id: 'materiales', tipo: 'materiales', titulo: '¿Con qué materiales trabajas y de dónde vienen?',
    ayuda: 'Por ejemplo: «lana de un ganadero de la zona», «madera de derribo», «plata que compro en un proveedor».' },
  { id: 'frecuencia', tipo: 'unica', puntua: true, titulo: '¿Con qué frecuencia publicas en redes?',
    opciones: [
      { valor: 0, texto: 'Nunca o casi nunca' },
      { valor: 1, texto: 'Cuando me acuerdo' },
      { valor: 2, texto: 'Una vez por semana' },
      { valor: 3, texto: 'Dos o más por semana' }
    ] },
  { id: 'online', tipo: 'unica', puntua: true, titulo: '¿Qué parte de tus ventas te llega por internet?',
    opciones: [
      { valor: 0, texto: 'Casi nada' },
      { valor: 1, texto: 'Menos de una cuarta parte' },
      { valor: 2, texto: 'Entre una cuarta parte y la mitad' },
      { valor: 3, texto: 'Más de la mitad' }
    ] },
  { id: 'fotos', tipo: 'unica', puntua: true, titulo: '¿Cómo son hoy las fotos de tus piezas?',
    opciones: [
      { valor: 0, texto: 'No tengo fotos buenas' },
      { valor: 1, texto: 'Con el móvil, sin método' },
      { valor: 2, texto: 'Cuidadas: luz, fondo y detalle' }
    ] },
  { id: 'precio', tipo: 'unica', puntua: true, titulo: '¿Cómo pones el precio?',
    opciones: [
      { valor: 0, texto: 'A ojo o lo que paga la gente' },
      { valor: 1, texto: 'Sumo el material y algo más' },
      { valor: 2, texto: 'Con un cálculo de material, horas, gastos y margen' }
    ] },
  { id: 'perfil', tipo: 'unica', puntua: true, titulo: 'Tu perfil de Instagram…',
    opciones: [
      { valor: 0, texto: 'No tengo o no lo uso' },
      { valor: 1, texto: 'Lo tengo, pero la bio está sin cuidar' },
      { valor: 2, texto: 'Bio clara, enlace y destacados' }
    ] },
  { id: 'frena', tipo: 'unica', titulo: '¿Qué te frena más ahora mismo?',
    opciones: [
      { valor: 'publicar', texto: 'No sé qué publicar' },
      { valor: 'tiempo', texto: 'No tengo tiempo' },
      { valor: 'precio', texto: 'Me regatean o vendo barato' },
      { valor: 'compran', texto: 'Me ven pero no me compran' },
      { valor: 'ferias', texto: 'Dependo demasiado de las ferias' }
    ] },
  { id: 'tiempo', tipo: 'unica', titulo: '¿Cuánto tiempo puedes dedicarle a la semana?',
    opciones: [
      { valor: 'menos-1h', texto: 'Menos de una hora' },
      { valor: '1-2h', texto: 'Entre una y dos horas' },
      { valor: 'mas-2h', texto: 'Más de dos horas' }
    ] },
  { id: 'meta', tipo: 'texto', opcional: true, titulo: '¿Qué te gustaría haber conseguido dentro de tres meses?',
    ayuda: 'Opcional. Lo leemos para preparar los directos.' }
];
const POR_ID = Object.fromEntries(PREGUNTAS.map(p => [p.id, p]));

const ITINERARIOS = {
  empieza: ['guia-primera-victoria', 'leccion-04-la-bio-que-vende', 'leccion-01-foto-de-producto',
    'leccion-02-tu-primer-reel', 'leccion-03-precios-con-margen', 'leccion-06-ferias-que-venden', 'reto-01-doce-reels'],
  publica: ['guia-primera-victoria', 'leccion-03-precios-con-margen', 'leccion-04-la-bio-que-vende',
    'biblioteca-plantillas', 'reto-01-doce-reels', 'leccion-01-foto-de-producto', 'leccion-02-tu-primer-reel',
    'leccion-06-ferias-que-venden'],
  vende: ['guia-primera-victoria', 'biblioteca-plantillas', 'leccion-02-tu-primer-reel', 'radar-ayudas',
    'leccion-03-precios-con-margen', 'leccion-06-ferias-que-venden']
};

// Prioridad 1, según lo que más frena. [versión completa, versión corta (< 1 h/semana)]
const PRIORIDAD_FRENA = {
  publicar: ['Graba tu primer reel del proceso con uno de los tres guiones de la biblioteca (lección 02).',
    'Graba un reel corto del proceso con uno de los guiones de la biblioteca (lección 02).'],
  tiempo: ['Prepara un mes de publicaciones en dos tardes con el calendario de la biblioteca.',
    'Prepara las publicaciones de una semana en una tarde con el calendario de la biblioteca.'],
  precio: ['Recalcula el precio de tus tres piezas más vendidas con la calculadora de la lección 03.',
    'Recalcula el precio de tu pieza más vendida con la calculadora de la lección 03.'],
  compran: ['Pasa la prueba de los cinco segundos a tu perfil: nombre, bio y enlace (lección 04).',
    'Pasa la prueba de los cinco segundos a tu bio (lección 04).'],
  ferias: ['Elige tus ferias del año con la calculadora de la lección 06 y mira las ayudas en el radar.',
    'Pasa por la calculadora de la lección 06 la próxima feria que tengas en mente.']
};
// Área que ya cubre cada respuesta de «qué te frena», para no repetirla.
const AREA_DE_FRENA = { publicar: 'constancia', tiempo: 'constancia', precio: 'precio', compran: 'bio', ferias: null };

// Prioridades 2 y 3: áreas flojas (0 o 1 punto). El orden del array es el de desempate.
const AREAS = [
  { area: 'precio', pregunta: 'precio',
    textos: ['Calcula el precio de una pieza con la calculadora de la lección 03.',
      'Calcula el precio de una pieza con la calculadora de la lección 03.'] },
  { area: 'fotos', pregunta: 'fotos',
    textos: ['Haz las tres fotos de una pieza con la lección 01.',
      'Haz la foto principal de una pieza con la lección 01.'] },
  { area: 'bio', pregunta: 'perfil',
    textos: ['Reescribe tu bio y tu campo nombre con la lección 04.',
      'Reescribe tu bio con la lección 04.'] },
  { area: 'constancia', pregunta: 'frecuencia',
    textos: ['Publica dos veces por semana durante cuatro semanas con el calendario de la biblioteca.',
      'Publica una vez por semana durante cuatro semanas con el calendario de la biblioteca.'] }
];
// Si no hay dos áreas flojas, se completa por nivel (la primera es la del documento;
// la segunda solo hace falta si la prioridad 1 ya cubría la única área floja).
const GUIA = 'Termina la guía de la primera victoria.';
const RETO = 'Apúntate al reto nº 1.';
const RADAR = 'Revisa el radar de ayudas de tu comunidad.';
const RELLENO_POR_NIVEL = { empieza: [GUIA, RETO], publica: [RETO, RADAR], vende: [RADAR, RETO] };

// Texto que ve el miembro: habla de su comunicación en internet, no del taller.
const NIVEL_TEXTO = { empieza: 'En internet estás empezando', publica: 'En internet ya publicas', vende: 'En internet ya vendes' };

function texto(v, max) { return typeof v === 'string' ? v.trim().slice(0, max) : ''; }

// Normaliza el cuerpo del formulario. Devuelve { respuestas, errores } donde
// errores es la lista de ids de pregunta sin responder o con valor no válido.
function validar(body) {
  body = body || {};
  const respuestas = {};
  const errores = [];
  for (const p of PREGUNTAS) {
    if (p.tipo === 'unica') {
      const raw = body[p.id];
      const op = p.opciones.find(o => String(o.valor) === String(raw));
      if (!op) errores.push(p.id); else respuestas[p.id] = op.valor;
    } else if (p.tipo === 'varias') {
      const raw = [].concat(body[p.id] || []).map(String);
      const vals = p.opciones.map(o => o.valor).filter(v => raw.includes(v));
      if (!vals.length) errores.push(p.id);
      respuestas[p.id] = vals;
    } else if (p.tipo === 'materiales') {
      const t = texto(body.materiales, 500);
      if (!t) errores.push(p.id);
      respuestas.materiales = t;
      respuestas.material_sobra_o_falta = body.material_sobra_o_falta === 'si' || body.material_sobra_o_falta === 'on';
    } else if (p.tipo === 'texto') {
      const t = texto(body[p.id], 1000);
      if (!t && !p.opcional) errores.push(p.id);
      respuestas[p.id] = t;
    }
  }
  return { respuestas, errores };
}

// Regla de asignación. Recibe respuestas ya validadas.
function calcular(r) {
  const puntos = PREGUNTAS.filter(p => p.puntua).reduce((s, p) => s + (Number(r[p.id]) || 0), 0);
  let nivel = puntos <= 4 ? 'empieza' : puntos <= 8 ? 'publica' : 'vende';
  // Excepción: si más de la mitad de las ventas ya llega por internet, vende.
  if (Number(r.online) === 3) nivel = 'vende';

  const corta = r.tiempo === 'menos-1h' ? 1 : 0;
  const prioridades = [];
  const p1 = PRIORIDAD_FRENA[r.frena];
  if (p1) prioridades.push(p1[corta]);

  const yaCubierta = AREA_DE_FRENA[r.frena] || null;
  const flojas = AREAS
    .map((a, orden) => ({ ...a, orden, pts: Number(r[a.pregunta]) || 0 }))
    .filter(a => a.pts <= 1 && a.area !== yaCubierta)
    .sort((a, b) => (a.pts - b.pts) || (a.orden - b.orden));
  for (const a of flojas) {
    if (prioridades.length >= 3) break;
    prioridades.push(a.textos[corta]);
  }
  for (const relleno of RELLENO_POR_NIVEL[nivel]) {
    if (prioridades.length < 3 && !prioridades.includes(relleno)) prioridades.push(relleno);
  }

  return {
    nivel,
    puntos,
    itinerario: ITINERARIOS[nivel].slice(),
    prioridades: prioridades.slice(0, 3),
    oficio: r.oficio || null
  };
}

module.exports = { PREGUNTAS, POR_ID, OFICIOS, ITINERARIOS, NIVEL_TEXTO, validar, calcular, ejemploDeOficio };
