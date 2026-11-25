# Sistema de las páginas de aterrizaje (`oc-landing.css`)

Este es el sistema de las páginas principales: `/club`, `/conecta-lana`, `/servicios` (con talleres y empresas), Diagnóstico, Roadmap, Sprint, Impulso e Impacto. Cualquier página de aterrizaje nueva se monta con estos componentes. No se inventa un estilo propio para ella.

## Cómo se usa

```html
<%- include('partials/head-meta', { title: '…', description: '…', canonical: '/…' }) %>
<link rel="stylesheet" href="/assets/css/oc-landing.css?v=20261123c">
<%- include('partials/header') %>   <!-- trae nav.js: menú «Servicios» y menú móvil -->
<main class="oc-landing">
  … secciones …
</main>
<%- include('partials/footer') %>
```

- **Ámbito.** Las reglas valen para `.club-landing` y para `.oc-landing` con el selector `:is(.club-landing,.oc-landing) …`, en el mismo orden que tenían en `club.css`. `/club` no ha cambiado ni un píxel; está comprobado con capturas en `docs/capturas/fase-0/`.
- **Tokens.** Son los colores y fuentes de `.club-landing`: `--verde #023429`, `--verde-hondo #032A20`, `--terracota #934A1C`, `--arena #E8D5B7`, `--crema #FBF7EF`, `--serif` (Newsreader) y `--sans` (Manrope). No se añaden colores.
- **Ritmo.** Alterna tramos en verde hondo (`.prob`, `.resol`, `.cred`, `.confianza`, `.cl-doors`, `.cl-testimonio`) con tramos claros (`.cajas`, `.pasos`, `.testi`, `.quien`, `.precios`, `.faq`). No pongas dos secciones seguidas con el mismo tipo de bloque.
- **Aparición al hacer scroll.** Añade `.reveal` al elemento. El estado oculto solo se activa cuando el script pone `oc-reveal` en `<html>`; sin JavaScript, todo se ve. Si se activa reducir movimiento (`prefers-reduced-motion`), no hay animación. El script mínimo es este:
  ```js
  document.documentElement.classList.add('oc-reveal');
  const rev = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }), {threshold: .12});
  document.querySelectorAll('.reveal').forEach(el => rev.observe(el));
  ```

### Menú de las páginas estáticas

La cabecera tiene una sola fuente: `views/partials/header.ejs`. Las vistas la incluyen. Las páginas de `public/` (blog, FAQ, sobre nosotros, privacidad…) llevan una copia que pone un script. **No se edita a mano.**

Cada vez que cambies `header.ejs` o la versión de `nav.js`:

```bash
node scripts/menu-estatico.mjs
```

- Busca en `public/` todas las páginas con `<nav class="navbar">` (menos `_deprecated`). No hay lista que mantener.
- Cambia solo ese bloque y la versión de `nav.js`; el resto de la página no se toca.
- `node scripts/menu-estatico.mjs --comprobar` avisa sin escribir. `npm test` hace la misma comprobación (`test/menuEstatico.test.js`) y falla si una página se queda atrás.
- Una página estática nueva necesita un `<nav class="navbar"></nav>` y, justo después, `<script src="/assets/js/nav.js?v=…"></script>` sin `defer`, para que los scripts de la página no dupliquen el menú. El script rellena el resto.
- Si cambia `styles.css`, hay que subir aparte su versión en las páginas: el script no la toca.

### Club oculto o visible (`CLUB_VISIBLE`)

Una variable de entorno (`lib/clubVisible.js`). Solo `true` enseña el Club; sin ella, está oculto. Se lee al arrancar el servidor.

- Oculto: `/club…` y `/auth/callback` dan 404, y el Club no sale en el menú, el pie ni el sitemap.
- En las vistas: `<% if (clubVisible) { %>`.
- Las páginas estáticas guardan el menú completo con el Club entre `<!--club-->` y `<!--/club-->`; el servidor lo filtra al servirlas. `menu-estatico.mjs` y `npm test` comprueban los dos modos. Estas marcas valen también para otros textos de una página estática.

### Qué hoja lleva cada página

| Hoja | Dónde se usa |
|---|---|
| `styles.css` | Todas: cabecera, pie y base |
| `oc-landing.css` | Las páginas de este sistema |
| `home-v2.css` y `oc-puertas.css` | Portada y `/oficios/…` |
| `pages-v2.css` | Portada, oficios, blog, FAQ y las vistas con `head-meta` |

`impulso-3d.css` ya no existe. `pages-v2.css` y `oc-puertas.css` solo conservan clases en uso (poda de la fase 4).

## Dos plantillas sobre el mismo sistema

Decisión de Jose, 22 nov 2026. Las dos plantillas comparten:
- la cabecera (`partials/landing-hero.ejs`);
- tramos oscuros y claros alternos;
- fotos dentro de las secciones;
- botones, radios y tipografía;
- el cierre (`partials/landing-final.ejs`).

Las dos cumplen los criterios de aceptación del apartado 11 del encargo.

### Plantilla «relato» (como `/club`)

**Solo para:** Diagnóstico 3D para talleres (`/servicios/diagnostico-3d`) e Impulso 3D.

**Estructura, de arriba abajo:**
1. Cabecera inmersiva.
2. Relato del problema: `.prob`, con la foto fija y los pasos `.beat`.
3. Manifiesto: `.resol`.
4. Cómo funciona: `.pasos`.
5. Qué incluye: `.cajas`.
6. Un ejemplo para ver: `.oc-ejemplos`.
7. Para quién sí y para quién no: `.quien`.
8. Precio: `.precios`, con un plan.
9. Testimonios: `.testi`.
10. Quién está detrás: `.detras`.
11. Preguntas frecuentes: `.faq`.
12. Cierre: `.final` y `.confianza`.

Necesita `oc-landing.js`, que mueve la foto fija del relato y hace aparecer los bloques al hacer scroll.

**Barra fija de móvil:** `.oc-barra-movil`. Va solo en páginas con precio y compra directa.

### Plantilla «directa» (como la portada)

**Para:** `/servicios`, `/servicios/talleres`, `/servicios/empresas`, Roadmap 3D y Sprint 3D.

**No lleva** tramo de scroll con pasos fijos ni manifiesto. Lo que en el encargo era «relato corto del problema» o «tiene sentido si…» va como tarjetas o lista.

**Estructura, de arriba abajo:**
1. Cabecera a sangre con foto, insignia y titular (`landing-hero`), o partida si la imagen no da para ir a sangre (Roadmap y Sprint). En las páginas para empresas va compacta (`compacta: true`), para que lo que se entrega y los plazos se vean en la primera pantalla y media.
2. Qué es y para quién: en el subtítulo de la cabecera. No se abre un bloque centrado solo para eso.
3. Tarjetas con imagen:
   - `.cajas` con `.caja-foto`, o `.caja-doc` si se enseña un documento;
   - o las puertas `.cl-doors--claro` con `.cl-card-foto`.
4. Método en pasos sobre verde hondo: `.pasos.pasos--oscuro` con `.pasos-grid--tres`.
5. Prueba, según la página:
   - cifras de la red con su fecha (`partials/landing-cifras.ejs`, `.cred--claro`);
   - o el testimonio autorizado (`.testi`).
6. Precio, o cómo se llega al precio: `.oc-camino`, que tiene la variante `.oc-camino-wrap` con foto al lado.
7. Preguntas frecuentes, solo donde ya existan: `.faq`.
8. Cierre con foto: `landing-final`.

**Páginas para empresas:**
- Tono sobrio y frases cortas.
- Fotos de fabricación y de material, no de manos de artesano.
- Mientras falte el precio, se pone un texto pequeño bajo el nombre (`.caja-precio--texto`), nunca con tamaño de precio.

### Piezas comunes nuevas

| Pieza | Archivo o clase | Para qué |
|---|---|---|
| Cabecera | `partials/landing-hero.ejs` | `img`, `badge`, `titulo` (con `<em>`), `sub`, `ctas`, `datos`, `compacta`, `partida` (con `alt`) |
| Cierre | `partials/landing-final.ejs` | `img`, `eyebrow`, `titulo`, `texto`, `cta`, `pd`, `confianza` |
| Cifras con fecha | `partials/landing-cifras.ejs` | `impacto`, `ids`, `titulo`, `claro` |
| Precio dentro de una caja | `.caja-precio` (con `small`) y `.caja-precio--texto` | Precio con jerarquía, o texto pequeño si aún no hay precio |
| Precarga de la cabecera | `head-meta` con `precargaImagen` | La foto de cabecera se pide la primera |

### Cabecera partida (`partida: true`)

Para imágenes que no dan para ir a sangre (ilustraciones de unos 1.000 px). Clases: `.club-hero--partida`, `.hero-texto` y `.hero-ilustracion`.
- Texto a la izquierda sobre verde hondo: insignia, titular, subtítulo, botones y línea de dato.
- Ilustración a la derecha, con radio de 24 px y la sombra del sistema. No lleva velo.
- Hasta 980 px, la ilustración va debajo del texto.
- La ilustración es contenido: necesita `alt`.

```ejs
<%- include('partials/landing-hero', { img: '…webp', ancho: 1000, alto: 1000, partida: true, alt: 'Qué se ve', badge: '…', titulo: '… <em>…</em>', sub: '…', ctas: [ … ], datos: '…' }) %>
```

### Caja con página de documento (`.caja-foto.caja-foto--doc`)

Enseña una página del PDF de ejemplo dentro de una caja: más alta, sin velo y alineada arriba.

### Testimonios: añadir una foto

1. Guarda la imagen en `public/assets/images/testimonios/` (por ejemplo, `esther.webp`).
2. En `data/testimonios.json`, pon la ruta en ese testimonio: `"foto": "/assets/images/testimonios/esther.webp"`. Para quitarla, `"foto": null`.
3. Opcional: `"foto_alt"` con lo que se ve. Si falta, se lee «Foto de» y el nombre.

No hay que tocar plantillas. `npm test` falla si la ruta no existe.

| | Medida |
|---|---|
| Formato | WebP (calidad 80) o JPG; perfil sRGB |
| Tamaño | Cuadrada, 1000 × 1000 px. Mínimo 800 × 800 |
| Peso | Hasta 150 KB |
| Encuadre | La cara o las manos en la franja central: la portada recorta a 4:3 (arriba y abajo) y las páginas de servicio, a un círculo de 56 px |
| Color | Se sube en color. La portada la pone en blanco y negro y vuelve al color al pasar el ratón |

Pide permiso para publicar la foto, aparte del permiso de la cita.

**Rejilla de Comunidad (portada).** La calcula `rejilla()` en `lib/testimonios.js`:
- Sin foto: nombre, proyecto y cita. No hay recuadro ni sello.
- Con foto: va delante, con el mismo ancho y dos filas de alto (en móvil, una detrás de otra).
- Se ven seis casillas (una foto cuenta dos) y «Ver más mensajes» enseña el resto, siempre por fila completa.
- Si a tres columnas sobra hueco al final, la cita más larga ocupa ese sitio, ensanchada.

El nombre, el texto y la foto de `/club` y las citas de Conecta Lana escritas en su vista siguen en su plantilla: este campo no las cambia.

## Componentes

| Componente | Clases | Para qué |
|---|---|---|
| Cabecera inmersiva | `.club-hero` `.hero-media` `.hero-slides` `.hero-overlay` `.hero-inner` `.hero-badge` `.sub` `.cta-row` `.datos-linea` | Foto o vídeo a sangre con velo, insignia, titular enorme con cursiva y línea de precio |
| Relato del problema | `.prob` `.prob-grid` `.beats` `.beat` `.grande` (`--frase`, `--uno`) `.prob-visual` `.prob-sticky` `.prob-movil` `.pildoras` `.pildora` `.bar` | Tramo oscuro: el texto avanza y la foto queda fija al lado |
| Manifiesto | `.resol` `.sello` `.puente` | Una frase central grande sobre verde hondo |
| Banda de credibilidad | `.cred` `.cred-inner` `.cred-titulo` `.cred-items` `.cred-item` | Tres o cuatro datos comprobables, con su fecha |
| Cajas con foto | `.cajas` `.cab` `.cajas-grid` `.caja` (`--dark`, `--light`, `--accent`) `.caja-foto` `.chip` `.num` `.lema` `.dato` `.tags` `.tag` | Lo que incluye un servicio; la `--dark` es la destacada |
| Pasos | `.pasos` `.pasos-grid` `.paso` `.bola` `.cuando` | Proceso numerado (hasta cuatro) |
| Testimonios | `.testi` `.testi-grid` (`--dos`) `.testi-card` `.comillas` `.firma` `.avatar` `.rol` `.nota` | Cita con retrato. Se leen de `data/testimonios.json` (`lib/testimonios.js`). Foto: ver «Testimonios: añadir una foto» |
| Quién está detrás | `.detras` `.detras-grid` `.detras-foto` `.detras-texto` `.detras-firma` | Jose, con foto y firma |
| Para quién sí y no | `.quien` `.quien-grid` `.quien-col.si` `.quien-col.no` `.quien-cta` | Dos columnas enfrentadas, con icono y texto (no solo color) |
| Precio | `.precios` `.planes` `.plan` (`--destacado`, `--mensual`) `.plan-badge` `.plan-eyebrow` `.plan-precio` `.plan-equiv` `.perks` `.perk` | Precio con jerarquía |
| Preguntas frecuentes | `.faq` con `<details><summary>…</summary><p class="resp">…</p></details>` | Acordeón nativo, accesible con teclado |
| Cierre | `.final` `.fondo` `.contenido` `.pd` | Foto a sangre con llamada a la acción |
| Banda de confianza | `.confianza` | Sello y frase final sobre verde hondo |
| Botones y etiquetas | `.club-btn` con `--terracota`, `--verde`, `--arena` y `--ghost`; `.eyebrow` (`--arena`); `.micro` (`--luz`) | — |
| Puertas (de Conecta Lana) | `.cl-doors` `.cl-d-head` `.cl-ey` `.cl-cards` `.cl-card` (`--t`, `--m`, `--b`) `.cl-ico` `.cl-who` `.cl-chips` `.cl-chip` `.cl-cta` | Tarjetas de entrada con degradado, icono, etiquetas y botón |
| Cifra grande (de Conecta Lana) | `.cl-why` `.cl-sc` `.cl-left` `.cl-why-step` `.cl-k` `.cl-big` `.cl-viz` `.cl-bar` `.cl-bl` `.cl-track` `.cl-fill` `.cl-note` `.cl-why-chips` `.cl-right` `.cl-sticky` `.cl-frame` `.cl-cap` `.cl-prog` `.cl-why-mimg` | Número enorme en Newsreader con barra de proporción y foto fija |
| Cita a pantalla completa (de Conecta Lana) | `.cl-testimonio` `.cl-testimonio__eyebrow` `.cl-testimonio__firma` `.cl-testimonio__secundaria` | Una cita grande sobre verde hondo |

## Ejemplos de marcado

**Cabecera inmersiva**
```html
<header class="club-hero" id="top">
  <div class="hero-media"><div class="hero-slides">
    <img src="/assets/images/…/foto.webp" alt="Qué se ve" width="1600" height="1067" fetchpriority="high">
  </div><div class="hero-overlay"></div></div>
  <div class="hero-inner">
    <span class="hero-badge">Diagnóstico 3D para talleres</span>
    <h1>Descubre qué puedes hacer <em>con lo que ya tienes</em></h1>
    <p class="sub">Subtítulo.</p>
    <div class="cta-row"><a class="club-btn club-btn--terracota" href="#…">Botón</a> <a class="club-btn club-btn--ghost" href="#…">Secundario</a></div>
    <p class="datos-linea">90 € + IVA · Sin llamadas · Informe y vídeo en tu correo</p>
  </div>
</header>
```

**Caja con foto**
```html
<section class="cajas"><div class="wrap">
  <div class="cab"><span class="eyebrow">Qué incluye</span><h2>Lo que te <em>llevas</em></h2></div>
  <div class="cajas-grid">
    <div class="caja caja--dark reveal">
      <div class="caja-foto"><img src="…webp" alt="…" width="800" height="533" loading="lazy"></div>
      <div class="chip"><svg …></svg></div>
      <span class="num">01</span><h3>Título</h3><p class="lema">Lema.</p>
      <ul><li><strong>Algo:</strong> explicación</li></ul>
    </div>
  </div>
</div></section>
```

**Banda de credibilidad**
```html
<section class="cred"><div class="wrap cred-inner">
  <span class="cred-titulo">La red, con fecha</span>
  <div class="cred-items">
    <div class="cred-item"><b>177 altas</b><span>en Conecta Lana · 12 nov 2026</span></div>
  </div>
</div></section>
```

## Reglas

- Imágenes en WebP, con `width` y `height`. Todas con `loading="lazy"` salvo la de la cabecera, que va con `fetchpriority="high"`. Texto alternativo que describa lo que se ve.
- Ninguna foto de cabecera se repite entre páginas, y ninguna foto aparece dos veces en la misma página.
- Sin marcadores `[PENDIENTE…]` visibles, sin emojis y sin testimonios fuera de `data/testimonios.json`.
- **Pertinencia:** cada imagen tiene relación directa con lo que dice su sección y se justifica en una línea en el registro («por qué esta imagen aquí»). Si no se puede justificar, se cambia o pasa a «imágenes que faltan».
- **Ritmo de titulares:** no hay dos secciones seguidas que sean solo etiqueta, titular y párrafo centrados.
- **Marca de agua:** no se sube ninguna foto con marca de un banco de imágenes ni se recortan firmas para taparlas. Ante la duda, se mira el original y sus metadatos.
- **Logo pequeño:** hasta 56 px se usa `brand/oc-logo-2026-cuadrado-168.webp` (12 KB). El PNG de 195 KB es solo el original.
- **Fotos a sangre:** `srcset` con varios anchos y `sizes` pensado para `object-fit: cover` (`max(100vw, 150vh)` en foto apaisada). Los carruseles piden cada foto cuando la anterior ya se ve; no se usa `data-src`, porque `script.js` carga de golpe todo lo que lo lleva.
