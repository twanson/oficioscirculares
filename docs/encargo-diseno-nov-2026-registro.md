# Registro · Encargo de diseño de las páginas de servicios (noviembre 2026)

Encargo: `docs/encargo-diseno-servicios-nov-2026.md`. Rama: `development`. Nada pasa a `main` sin el visto bueno de Jose.

---

## Fase 0 · Sistema común, menú y errores (22 nov 2026)

### Qué se ha hecho

1. **`public/assets/css/oc-landing.css` (nuevo).** Lleva los tokens y todos los componentes de `/club`, más las puertas (`cl-doors`), la cifra grande (`cl-why`) y la cita a pantalla completa (`cl-testimonio`) de `/conecta-lana`.
2. **Cómo se evita duplicar reglas.** Las reglas de `club.css` se han **movido** a `oc-landing.css` sin tocarlas, cambiando solo el ámbito `.club-landing` por `:is(.club-landing,.oc-landing)`. Se elige esta vía porque es la de menos riesgo:
   - `:is()` toma la especificidad de su argumento más fuerte, que es una clase. La especificidad queda igual que antes.
   - Las reglas conservan el orden en que estaban, así que la cascada de `/club` es la misma.
   - `club.css` queda solo con lo exclusivo del Club: `html{scroll-behavior:smooth}` y `html,body{overflow-x:clip}`.
   - `/club` carga primero `oc-landing.css` y después `club.css`.
3. **Componentes de Conecta Lana.** Los bloques de puertas, cifra grande y cita se han **movido** del `<style>` de `views/conecta-lana.ejs` a `oc-landing.css`, sin cambiar su contenido. La vista enlaza `oc-landing.css` justo después de su `<style>`. Así esas reglas siguen yendo detrás de los ajustes base de `.cl-landing`, como antes.
4. **`.reveal` sin JavaScript.** El estado oculto solo se aplica si `<html>` tiene la clase `oc-reveal`, y esa clase la pone el script de aparición. Si el script no carga, todo se ve. Con `prefers-reduced-motion` no hay animación.
5. **Menú «Servicios».** La lógica del desplegable y del menú móvil está ahora en `public/assets/js/nav.js`, que carga `views/partials/header.ejs`.
   - Funciona en todas las vistas que usan la cabecera común, incluidas las que no cargan `script.js`: `/club`, `/mapa`, `/dir`, `/directorio`, las de gracias y las de acceso.
   - `script.js` ya no repite la lógica si `nav.js` la ha cargado (`window.__ocNav`), así que no hay doble apertura.
   - El menú móvil anuncia su estado (`aria-expanded`), se abre con Intro y se cierra con Escape.
6. **Error `showSlide`.** El pase de imágenes de `script.js` ya no se ejecuta en páginas sin diapositivas. La consola queda limpia en todas las vistas probadas.
7. **`pages-v2.css` cargado dos veces.** `head-meta` acepta ahora `cssPrevios`: hojas que se emiten antes de `pages-v2.css`. Las vistas de servicios, Impulso e Impacto pasan `impulso-3d.css` por ahí y ya no recargan `pages-v2.css`. Su aspecto no cambia: está comprobado píxel a píxel en `/impulso-3d`, `/servicios/talleres`, `/impacto` y `/servicios/diagnostico-3d`.
8. **`data/testimonios.json` (nuevo)** y `lib/testimonios.js`:
   - Contiene los 4 testimonios autorizados con nombre y los 6 mensajes sin nombre que Jose dio el 22 nov. Estos seis llevan `"permiso": "pendiente"` y avatar con el sello.
   - El reparto por páginas es el que pidió Jose.
   - Hay pruebas en `test/testimonios.test.js`:
     - el texto aprobado es literal;
     - ningún testimonio de Conecta Lana ni sin permiso aparece en páginas de pago;
     - el reparto por páginas es el pedido.
   - Las vistas todavía no leen de aquí: se conectan en las fases 2 y 3 (portada, `/impacto` y `/conecta-lana`).
9. **`docs/sistema-landing.md` (nuevo).** Lista de componentes con ejemplos de marcado.

### Comprobaciones

- **Capturas a página completa de `/club` y `/conecta-lana`, a 1.280 y a 375 px**, en `docs/capturas/fase-0/antes/` y `docs/capturas/fase-0/despues/` (JPG; la comparación se hizo sobre los PNG originales).
  - Para tomar las de «antes» se levantó el código de antes de la fase en una copia aparte. En `/club` se fijó la variante de cabecera con `?hero=slides`, porque la página elige al azar entre fotos y vídeo.
  - Resultado de la comparación píxel a píxel:
    - `/club` a 1.280 px: **idéntica**.
    - `/club` a 375 px: **idéntica**.
    - `/conecta-lana` a 375 px: **idéntica**.
    - `/conecta-lana` a 1.280 px: solo cambian los primeros 800 px, que son la cabecera de vídeo. Esa misma diferencia aparece entre dos capturas seguidas del código sin tocar, así que es el vídeo y no un cambio de diseño.
- **Menú en todas las vistas con la cabecera común**, probado con ratón, teclado y en móvil:
  - Vistas probadas (23): `/`, `/club`, los servicios, Roadmap, Sprint, Impulso, Impacto, contacto, recursos, oficios, coming-soon, gracias, `/dir`, `/mapa`, `/directorio`, `/mapa-gate`, `/dir-confirmacion` y `/renovar-acceso`.
  - Con teclado, Intro abre el desplegable y pone el foco en la primera opción; Escape y el tabulador lo cierran. En móvil, la hamburguesa abre el menú y el desplegable dentro.
  - Todas pasan, sin errores en consola.
  - `/conecta-lana`, `/viaje/lana` y las vistas `club-*` del área de miembros no usan la cabecera común: tienen la suya.
- `npm test`: 18 pruebas, todas pasan.

### Fuera de alcance, detectado

- **Páginas HTML estáticas `/blog/` y `/sobre-nosotros/`:** tienen un error de consola anterior a este encargo (`observerOptions` declarado dos veces). El código del propio HTML choca con `script.js`. Corregirlo en `script.js` hace que su menú propio se enlace dos veces y deje de funcionar, así que se deja como estaba. Hay que arreglarlo en esos HTML.
- **Página estática `/faqs/`:** el desplegable «Servicios» no se abre, y ya pasaba antes de esta fase. Usa su propia cabecera estática.

### Pendiente de fases siguientes

- Eliminar las reglas sin uso de `oc-puertas.css`, `impulso-3d.css` y la plantilla `service-*` de `pages-v2.css` cuando las páginas estén migradas (fase 4).

---

## Fase 1 · Página piloto `/servicios/diagnostico-3d` (22 nov 2026)

La página está reconstruida entera con el sistema `oc-landing` (`views/diagnostico-3d.ejs`). Conserva los textos que ya tenía. Los componentes nuevos que no existían en `/club` están al final de `oc-landing.css`, en el bloque «Ampliaciones» y solo bajo `.oc-landing`:
- caja sin foto;
- caja con un documento en perspectiva;
- fila de portadas;
- pasos a tres columnas;
- testimonio y plan únicos centrados.

El comportamiento (relato y aparición) está en `public/assets/js/oc-landing.js`. La imagen de cabecera se precarga (`head-meta` acepta `precargaImagen`).

### Estructura y criterios de aceptación

Orden de arriba abajo: cabecera inmersiva · relato del problema (verde hondo) · [manifiesto, propuesta] · cómo funciona · qué incluye el informe · un ejemplo para ver (verde hondo) · [para quién sí y no, propuesta] · precio · testimonio · quién está detrás · preguntas frecuentes · cierre con foto · banda de confianza (verde hondo).

- **Tramos oscuros:** relato, ejemplos, cierre y confianza, alternados con tramos claros.
- **Imagen en las secciones:** sin contar la cabecera, 6 de las 10 secciones publicadas llevan imagen (relato, informe, ejemplos, testimonio, Jose y cierre).
- **Ritmo:** no hay dos secciones seguidas con el mismo tipo de bloque.
- **375 px:** sin desbordamiento horizontal.
- **Consola y menú:** sin errores en consola, en local y en staging. El menú funciona con ratón, con teclado y en móvil.
- **Marcadores:** ninguno visible.
- **Testimonios:** solo Blanca. Es el único autorizado para páginas de pago.
- **Rendimiento:** la imagen de cabecera se precarga y el resto se carga en diferido. **No se ha medido Lighthouse**: no está instalado y no se ha descargado. Queda pendiente medirlo antes de la fase 2.

### Imagen asignada por sección

| Sección | Imagen | Origen |
|---|---|---|
| Cabecera | `landing/diagnostico/hero-manos-cuero.webp` (1920×1280) | `manos cuero2.jpg` |
| Relato 01 | `prob-1-ceramista.webp` | `oficios/precio-ceramista-etiqueta.jpg` |
| Relato 02 | `prob-2-mesa.webp` | `artesana moderna despacho flores.jpg` |
| Relato 03 | `prob-3-madera.webp` | `oficios/carpinteria-y-ebanisteria.jpg` |
| Relato 04 | `prob-4-taller-noche.webp` | `oficios/precio-taller-noche.jpg` |
| Qué incluye (caja destacada) | `portada-barro-artesanal.webp`, en perspectiva | `assets/diagnosticos/barro-artesanal-cover.jpg` |
| Ejemplos | portadas de cerámica, carpintería, joyería y cuero (no textil) | `assets/diagnosticos/*-cover.jpg` |
| Testimonio | `club/blanca-hilandia.jpg` | aprobado |
| Quién está detrás | `fotosobrenosotrosOC.png` | la misma de `/club` |
| Cierre | `workshop_tools.jpg` | la misma de la portada y de `/club` |

`pottery_hands.jpg` no se usa en la cabecera porque mide 800 px de ancho y se ve borrosa a sangre.

### Imágenes que faltan

| Página | Sección | Qué haría falta |
|---|---|---|
| `/servicios/diagnostico-3d` | Testimonios | Un segundo testimonio autorizado de un taller que haya hecho el Diagnóstico (texto y retrato). El encargo pide dos tarjetas y solo hay uno válido para páginas de pago. |
| `/servicios/diagnostico-3d` | Qué incluye | Una foto o captura real de un informe abierto (páginas interiores). Hoy se enseña la portada de un diagnóstico de ejemplo. |

### Textos que esperan aprobación

Solo se ven en local con `?propuestas=1`; con `&manifiesto=b` se ve la opción B. En staging y en producción no aparecen. Hay capturas en `docs/capturas/fase-1/propuestas/`.

**Manifiesto**, hecho a partir de frases que ya hay en la página:
- **A.** «Un cuestionario, un informe y un vídeo. *Y sabrás qué hacer primero.*»
- **B.** «Lo que ya tienes para contar, *en tres prioridades ordenadas.*»

**Para quién sí y para quién no**, sacado de las preguntas frecuentes y de los distintivos de la página:
- **Es para ti si…**
  - Tienes un taller o una marca artesana que hace piezas físicas: cerámica, madera, textil, cuero, joyería, cosmética natural y más.
  - Prefieres responder a tu ritmo, con audios y fotos, sin llamadas.
  - Quieres saber qué hacer primero, con tres prioridades ordenadas.
- **No es para ti si…**
  - Eres una empresa: tienes tu propio Diagnóstico para empresas.
  - Quieres resolverlo todo en una llamada: aquí todo funciona por escrito.
  - Buscas una etiqueta verde: el Diagnóstico solo cuenta lo que se puede demostrar.

### Otras decisiones

- **«Quién está detrás»:** lleva el bloque de `/club` sin su segundo párrafo, que habla del Club.
- **Banda de confianza:** usa los distintivos que ya tenía la página («Sin llamadas · Sin greenwashing · Precio cerrado») y la frase del descuento.
- **Barra móvil fija con botón:** la página antigua tenía una («Quiero mi Diagnóstico» / «Escribir primero») y se ha quitado, porque el sistema de `/club` no la usa. Si se quiere recuperar, se añade.
- **Enlaces de la página:** conservan sus parámetros `oc_*` y los eventos de GA4.

### Direcciones para revisar

- Staging: `https://oficioscirculares-production.up.railway.app/servicios/diagnostico-3d`
- Capturas: `docs/capturas/fase-1/diagnostico-3d-1280.jpg`, `diagnostico-3d-375.jpg` y `propuestas/`.
