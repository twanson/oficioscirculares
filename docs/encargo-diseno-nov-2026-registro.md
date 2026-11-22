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

---

## Decisiones de Jose tras la fase 1 (22 nov 2026)

- **Diagnóstico para talleres:**
  - Se publica el manifiesto A.
  - Se publica «¿Es para ti?», cambiando la frase de empresa por «Si eres una empresa, tu puerta es otra», con enlace a `/servicios/empresas`.
  - Vuelve la barra fija de móvil (`.oc-barra-movil`), solo en páginas con precio y compra directa.
- **Dos plantillas sobre `oc-landing`:**
  - «Relato» solo en el Diagnóstico para talleres y en Impulso 3D.
  - «Directa» en `/servicios`, talleres, empresas, Roadmap y Sprint.
  - `/impacto` y la guía de joyería van sin relato.
  - Están documentadas en `docs/sistema-landing.md`.

## Fase 2 · `/servicios`, `/servicios/talleres`, `/servicios/empresas` y portada (22 nov 2026)

### Qué se ha hecho

- **`views/servicios.ejs`:** se reconstruye con la plantilla directa. Las tres páginas siguen el orden cabecera a sangre · tarjetas con foto · método sobre verde hondo · prueba · cierre con foto.
  - **`/servicios`:** las dos puertas usan las tarjetas de `/conecta-lana` sobre fondo claro, con foto arriba. La prueba son tres cifras de la red, cada una con su fecha.
  - **Talleres:**
    - lleva el bloque breve «qué es y para quién»;
    - Club, Diagnóstico (destacado, con la portada del informe) e Impulso van en cajas con foto y precio grande;
    - la prueba es el testimonio de Blanca.
  - **Empresas:**
    - la cabecera es compacta y la línea de datos dice «Diagnóstico · Roadmap en 2 semanas · Sprint en 4 semanas · Precio cerrado tras el Diagnóstico»;
    - las tarjetas llevan imagen y el plazo visible;
    - el precio que falta va en texto pequeño bajo el nombre («Precio a consultar» y «Precio cerrado tras el Diagnóstico»);
    - la prueba son las cifras de la red, sin testimonio;
    - termina con «Cómo se llega al precio» en tres pasos y una foto de taller de metal.
- **Piezas nuevas:**
  - parciales `landing-hero`, `landing-final` y `landing-cifras`;
  - en `oc-landing.css`, las variantes `pasos--oscuro`, `cred--claro`, `cl-doors--claro`, `cl-card-foto`, `caja-precio`, `oc-intro`, `oc-camino` y `club-hero--compacta`;
  - las cifras de las páginas de servicios se leen de `data/impacto.json`.
- **Portada · Servicios:** conserva el bloque «Metodología Círculo de Valor 3D» con la foto del yunque y la cita del fundador. La puerta de talleres va en la tarjeta grande y la de empresas en la lateral, como en producción.
- **Portada · Comunidad:**
  - Lee los diez testimonios de `data/testimonios.json`: primero los cuatro con nombre y después los seis sin nombre.
  - Se ven seis y el botón «Ver más mensajes» enseña el resto. Sin JavaScript se ven los diez.
  - Blanca lleva su foto. Los demás llevan el sello de la marca sobre arena, con el mismo tamaño y forma que el retrato.
  - Esther, Jorge y Maika indican que son usuarios de Conecta Lana.
  - La nota al pie dice «Mensajes reales de usuarios de la red». La frase del permiso solo sale si todos los testimonios mostrados lo tienen.

### Comprobaciones

Hechas en local y en staging, a 1.280 y a 375 px:
- Sin desbordamiento horizontal.
- Sin errores en consola.
- El menú funciona con ratón, con teclado y en móvil en las cinco páginas.
- Ningún marcador `[PENDIENTE…]` visible.
- `npm test`: 18 pruebas, todas pasan.
- Las capturas están en `docs/capturas/fase-2/`.

**Criterios de aceptación** (secciones con imagen, sin contar la cabecera):

| Página | Tramos oscuros | Secciones con imagen |
|---|---|---|
| `/servicios` | método y cierre | 2 de 4 (puertas y cierre) |
| Talleres | método y cierre | 3 de 5 (cajas, testimonio y cierre) |
| Empresas | método y cierre | 3 de 5 (cajas, precio y cierre) |

**No medido:** Lighthouse. Sigue pendiente.

### Imagen asignada por sección

| Página | Sección | Imagen (`landing/servicios/`) | Origen |
|---|---|---|---|
| `/servicios` | Cabecera | `hero-servicios-artesanos.webp` | `artesanos en taller.jpg` |
| `/servicios` | Puerta talleres | `puerta-talleres-torno.webp` | `new_hero_potter.jpg` |
| `/servicios` | Puerta empresas | `puerta-empresas-bobinas.webp` | `viaje-lana/puerto-bobinas-1600.webp` |
| `/servicios` | Cierre | `workshop_tools.jpg` | — |
| Talleres | Cabecera | `hero-talleres-alfarero.webp` | `alfarero.jpg` |
| Talleres | Club | `caja-club-taller.webp` | `community_workshop.jpg` (640 px de origen) |
| Talleres | Diagnóstico | portada del Diagnóstico de barro, en perspectiva | `assets/diagnosticos/` |
| Talleres | Impulso | `caja-impulso-textil.webp` | `artesania textil.jpg` |
| Talleres | Cierre | `cierre-talleres-taller.webp` | `Taller vacio.png` |
| Empresas | Cabecera | `hero-empresas-acero.webp` | `taller acero.jpg` |
| Empresas | Diagnóstico | `caja-empresas-diagnostico.webp` | `img/servicios/diagnostico-3d-hero.jpg` |
| Empresas | Roadmap | `caja-empresas-roadmap.webp` | `img/servicios/Hero_Roadmap3d.png` |
| Empresas | Sprint | `caja-empresas-sprint.webp` | `img/servicios/sprint3d-hero.png` |
| Empresas | Cómo se llega al precio | `precio-empresas-taller-metal.webp` | `taller clasico metal.jpg` |
| Empresas | Cierre | `cierre-empresas-ladrillo.webp` | `oficios/barro-artesanal.jpg` |

**Aviso sobre las ilustraciones de empresas.** Las de Roadmap y Sprint son ilustraciones claras de oficina: un portátil y un tablero con notas. La del Diagnóstico es una foto oscura de una mano sobre una mesa. Las tres se pueden usar por proporción, una vez recortadas a 16:10, pero en tono no casan del todo con las fotos de fabricación de la página. Se usan porque son las del encargo. Si se quiere más coherencia, hacen falta fotos de fabricación para las tres tarjetas.

### Imágenes que faltan

| Página | Sección | Qué haría falta |
|---|---|---|
| Portada | Comunidad | Retratos de Esther, Jorge y Maika (hoy, sello de la marca) |
| Empresas | Tarjetas | Tres fotos de fabricación o de material, en el mismo tono, para Diagnóstico, Roadmap y Sprint (ver el aviso de arriba) |
| Talleres | Club | Una foto de comunidad o taller compartido de más resolución: la actual mide 640 px |

### Textos nuevos que conviene revisar

No había texto previo para estas piezas. Salen de lo que ya decía cada página o de lo que pide el encargo.
- **Talleres, bloque «qué es y para quién»:**
  - El titular repite la frase de la puerta: «Método, comunidad y acompañamiento para que tu oficio se entienda y se venda».
  - El texto viene de las preguntas frecuentes del Diagnóstico: «Para cualquier taller o marca artesana que haga piezas físicas: cerámica, madera, textil, cuero, joyería, cosmética natural y más».
- **Empresas, «Cómo se llega al precio»** (estructura que pide el encargo):
  - «Diagnóstico: detectamos las oportunidades y cuál conviene hacer primero».
  - «Propuesta cerrada: te enviamos alcance, plazo y precio cerrados para el Roadmap o el Sprint».
  - «Decides: solo entonces decides si seguimos».
- **Cierres:** reutilizan frases de cada página.
  - `/servicios`: «Tu oficio tiene valor, vamos a contarlo».
  - Talleres: «Empieza por saber qué tienes».
  - Empresas: «Convierte una mejora circular en un caso que puedes contar».

### Pendientes para Jose

1. Precio y plazo del Diagnóstico para empresas. Hoy la página dice «Precio a consultar» y no da plazo.
2. Fotos de la tabla «Imágenes que faltan».
3. Medir Lighthouse en móvil, antes y después.
4. Los testimonios 1, 2 y 6 en `/conecta-lana` y en `/impacto`. Se hace en la fase 3, con Impacto.

### Direcciones para revisar

Base: `https://oficioscirculares-production.up.railway.app`

- `/`: portada, secciones Servicios y Comunidad
- `/servicios`
- `/servicios/talleres`
- `/servicios/empresas`
- `/servicios/diagnostico-3d`: textos aprobados y barra de móvil
