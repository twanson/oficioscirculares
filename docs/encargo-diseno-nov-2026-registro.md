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

---

## Fase 3 · Roadmap, Sprint, Impulso, Impacto y guía de joyería (22 nov 2026)

### Qué se ha hecho

- **Roadmap 3D y Sprint 3D (plantilla directa).** Las dos páginas se migran por completo desde la plantilla antigua `service-*` y conservan sus textos.
  - **Orden:** cabecera compacta con plazo · qué te llevas (cajas con foto) · cómo trabajamos (pasos sobre verde hondo) · «tiene sentido si…» como lista, con la comparación al lado · el entregable con la portada del PDF de ejemplo en perspectiva · cifras de la red con su fecha · cómo se llega al precio (tres pasos y foto) · preguntas frecuentes · cierre.
  - **Sprint:** conserva la garantía («seguimos trabajando hasta que funcione»), que sigue pendiente de decisión.
- **Impulso 3D (plantilla relato).** Conserva todo su contenido. Los textos se han copiado del archivo anterior sin tocarlos.
  - **Relato:** los cuatro problemas de «Reconoces esto, ¿verdad?» van como relato del problema.
  - **Manifiesto:** usa el lema que ya tenía la página, «Menos tiempo en difusión. Más tiempo en tu oficio.», con el texto «Sin perder tu esencia».
  - **Resto de secciones:** el Método 3D, «¿Te reconoces?» y herramientas con foto. Siguen «No solo te ayudamos a comunicar», precios y entregables en cajas con foto, «¿Cómo empezamos?» en cinco pasos, el soporte, el testimonio de Blanca, «Quién está detrás» con su texto propio, las preguntas frecuentes y el cierre.
  - **«¿Te reconoces?»:** son los cuatro arquetipos, con foto, sin nombres propios y sin comillas.
  - **Barra fija de móvil:** lleva al Diagnóstico.
- **`/impacto`.**
  - **Cifras destacadas:** las cuatro van en grande sobre verde hondo, con el tratamiento de `/conecta-lana` (número enorme en Newsreader). Cada una lleva qué mide y la fecha en una etiqueta. Los emparejamientos llevan además una barra con «10 de 57».
  - **Otras cuatro cifras:** van en una banda de credibilidad sobre crema.
  - **Bloques:** «Cómo contamos», los objetivos (barra y cifra en texto) y «Qué lo respalda», cada uno con una foto.
  - **Cita a pantalla completa:** Esther, Jorge y los mensajes 1, 2 y 6, con la nota «Mensajes reales de usuarios de la red».
- **`/conecta-lana`.** Añade los mensajes 1, 2 y 6 debajo de los de Esther y Jorge, con la misma nota. El diseño no cambia.
- **Guía de joyería.**
  - **Cabecera:** una foto de taller de joyería (`espai-micra-taller`).
  - **Dentro del texto:** la textura de plata y el prototipo de anillo.
  - **Por qué cambia la cabecera:** así la textura puede ir dentro del texto sin repetir ninguna foto.
  - **Imágenes descartadas:** el resto de imágenes de E-WEAR (packaging, tarjeta y lotes) muestran el nombre «E-WEAR» o parecen documentos de un caso real.
- **CSS.** Hay variantes nuevas en `oc-landing.css`, todas bajo `.oc-landing`:
  - `oc-encaje`, `oc-documento` (y `--foto`), `oc-bloque` (y `--oscuro`, `--hueso`, `--invertido`);
  - `oc-cifras-hondo`, `oc-cifra-xl` y `oc-fecha`;
  - `cajas-grid--dos`, `--cuatro` y `pasos-grid--dos`, `--cinco`.
  - Se ha comprobado que `/club` sigue igual.

### Comprobaciones

Hechas en staging:
- `/servicios/roadmap-3d`, `/servicios/sprint-3d`, `/impulso-3d`, `/impacto`, `/conecta-lana` y la guía:
  - consola sin errores;
  - ningún marcador `[PENDIENTE…]` visible;
  - sin desbordamiento a 375 px. Sprint se salía 4 px por una rejilla de dos columnas; está corregido.
- El menú funciona con ratón, con teclado y en móvil en las cinco páginas con la cabecera común. `/conecta-lana` tiene su propia cabecera.
- Las capturas a 1.280 y a 375 px están en `docs/capturas/fase-3/`.
- **No medido:** Lighthouse.

### Imagen asignada por sección

| Página | Sección | Imagen | Origen |
|---|---|---|---|
| Roadmap | Cabecera | `landing/roadmap/hero-roadmap-taller-metal.webp` | `taller clasico metal.jpg` |
| Roadmap | Operación / Comunicación | `caja-operacion-material.webp` / `caja-comunicacion-plan.webp` | `viaje-lana/interludio-textura` / `img/servicios/Hero_Roadmap3d.png` |
| Roadmap | Entregable | `documento-portada.webp` | portada de `downloads/ejemplo-roadmap-3d.pdf` |
| Roadmap | Precio / Cierre | `precio-materiales.webp` / `cierre-bobinas.webp` | `oficios/barro-artesanal` / `viaje-lana/puerto-bobinas` |
| Sprint | Cabecera | `landing/sprint/hero-sprint-contenedores.webp` | `viaje-lana/puerto-contenedores` |
| Sprint | Operación / Comunicación | `caja-mejora-tablero.webp` / `caja-contarlo-producto.webp` | `img/servicios/sprint3d-hero.png` / `viaje-lana/escaparate-punto` |
| Sprint | Entregable | `documento-portada.webp` | portada de `downloads/mini-caso-sprint-3d.pdf` |
| Sprint | Precio / Cierre | `precio-forja.webp` / `cierre-vidrio.webp` | `oficios/forja-y-herreria` / `oficios/vidrio-artesanal` |
| Impulso | Cabecera | `landing/impulso/hero-impulso-artesana.webp` | `artesana artista pinta casa.jpg` (la de antes, `mirandomadera.jpg`, mide 612 px) |
| Impulso | Relato 1–4 | `prob-1-artesana`, `prob-2-manos-barro`, `prob-3-retrato`, `prob-4-taller-vacio` | `artesana blanco y negro`, `pottery_hands` (800 px), `cara pintada`, `Taller vacio` |
| Impulso | ¿Te reconoces? | `perfil-*.webp` | los cuatro retratos de arquetipo que ya tenía la página |
| Impulso | Herramientas | `herramientas-mesa.webp` | `artesana moderna despacho flores` |
| Impulso | Precios | portada del Diagnóstico de cerámica, `caja-impulso-herramientas`, `caja-completo-taller` | `assets/diagnosticos`, `herramientas cortar madera amarilla`, `pinturas en tabla` |
| Impulso | Cierre | `cierre-yunque.webp` | `yunque 2.jpg` |
| Impacto | Cabecera | `landing/impacto/hero-impacto-rebano.webp` | `viaje-lana/cierre-rebano` |
| Impacto | Cómo contamos / Objetivos / Respalda | `contamos-vellones` / `objetivos-ovillo` / `respalda-rebano` | `viaje-lana/nave-vellones`, `taller-ovillo`, `interludio-rebano` |
| Impacto | Cierre | `cierre-tejiendo.webp` | `viaje-lana/taller-tejiendo` |
| Guía | Cabecera / texto | `blog/joyeria-plata-recuperada/hero-taller-joyeria`, `textura-plata`, `prototipo-anillo` | `oficios/espai-micra-taller`, `cases/e-wear/macro-textura-plata`, `cases/e-wear/prototipo-vs-final-anillo` |

### Imágenes que faltan

| Página | Sección | Qué haría falta |
|---|---|---|
| Impulso 3D | ¿Te reconoces? | Los cuatro retratos no casan con su descripción. Por ejemplo, «La Artesana Experimentada, ceramista, en torno a 55 años» muestra a una mujer joven, y «La Diseñadora Consciente, joyera, 28 años» muestra a una mujer mayor cosiendo. Son las imágenes que ya había. Harían falta cuatro retratos acordes. |
| Impulso 3D | Relato 02 | Una foto de manos en el taller de más resolución: `pottery_hands.jpg` mide 800 px. |
| Guía de joyería | Texto | Una tercera imagen de joyería sin marca, si se quieren tres dentro del texto. |
| Roadmap y Sprint | Tarjetas | Fotos de fabricación en el mismo tono. Las ilustraciones de oficina de Roadmap y Sprint no casan del todo con las demás. |

### Textos nuevos que conviene revisar

- **Roadmap y Sprint:**
  - los tres pasos de «Cómo se llega al precio», los mismos que en empresas;
  - la frase de Roadmap «Incluye 2 semanas de trabajo dedicado y todas las plantillas listas para usar», que ya existía;
  - los titulares de cierre «Un plan claro de 90 días» y «En 4 semanas, funcionando».
- **Impulso:** el manifiesto es el lema que ya existía; no hay texto nuevo.
- **Impacto:**
  - «Cifra 01…04» como antetítulo;
  - «Cerrados con entrega, de los gestionados» en la barra;
  - el cierre «Suma tus materiales a la red», que ya existía.

### Pendientes para Jose

1. Precio y plazo del Diagnóstico para empresas. Los precios de Roadmap, Sprint y los soportes.
2. Mantener o no la garantía del Sprint.
3. Las imágenes de la tabla de arriba.
4. Medir Lighthouse en móvil.
5. Fase 4: limpieza de CSS sin uso (`oc-puertas.css`, `impulso-3d.css`, plantilla `service-*`).
6. Permiso o nombre para los seis mensajes sin nombre.

### Direcciones para revisar

Base: `https://oficioscirculares-production.up.railway.app`

- `/servicios/roadmap-3d`
- `/servicios/sprint-3d`
- `/impulso-3d`
- `/impacto`
- `/conecta-lana`: los tres mensajes nuevos al final de la cita
- `/blog/joyeria-plata-recuperada/`

---

## Arreglos previos a la fase 4 (23 nov 2026)

### Qué se ha hecho

1. **Titulares centrados seguidos.** Regla: no puede haber dos secciones seguidas que sean solo etiqueta, titular y párrafo centrados.
   - **Talleres:** se elimina el bloque `oc-intro`. Su frase «Para cualquier taller o marca artesana…» abre ahora el subtítulo de la cabecera.
   - **Impulso 3D:** «No solo te ayudamos a comunicar» tenía el mismo problema (bloque centrado seguido de «Tu camino con Oficios Circulares»). Ahora es un `oc-bloque` con foto al lado y el mismo texto.
   - **Resto de páginas:** revisadas, sin más casos. Las demás secciones llevan tarjetas, pasos, cifras, lista o foto tras su titular. El manifiesto (`.resol`) va solo sobre verde hondo y le sigue una sección con pasos.
2. **Cabecera partida** (`landing-hero` con `partida: true`) en Roadmap y Sprint, con sus dos ilustraciones. En móvil la ilustración va debajo del texto.
3. **Pertinencia de las imágenes.** Tabla completa abajo. Las tarjetas y el precio de Roadmap y Sprint enseñan páginas de sus propios PDF de ejemplo (`caja-foto--doc`). De Sprint se han dejado fuera las cifras ilustrativas del piloto.
4. **Impulso, «¿Te reconoces?»:** cuatro fotos de `oficios/`, sin caras.
5. **Corregido de paso:** en Impulso, los dos párrafos de «Herramientas que hablan como tú» salían oscuros sobre verde y no se leían. Era un fallo de la fase 3.
6. Se han borrado las imágenes de `landing/` que ya no usa ninguna página. Los originales siguen en `assets/images`.

### Aviso: dos fotos con marca de agua

`workshop_tools.jpg` y `pottery_hands.jpg` llevan visible la marca de agua de un banco de imágenes (dreamstime) y miden 800 px. Se han quitado de `/servicios`, el Diagnóstico e Impulso. **`workshop_tools.jpg` sigue en la portada, en `/club` y en las páginas de oficio** (`oc-cta-band`, `oficio-vertical`), que no entraban en este encargo. Hay que sustituirla o comprar la licencia. Está también en producción.

### Imágenes y por qué están ahí (sustituye a las tablas anteriores)

| Página | Sección | Imagen | Por qué esta imagen aquí |
|---|---|---|---|
| `/servicios` | Cabecera | `hero-servicios-artesanos` | Dos personas trabajando en un taller: a quién acompañan los servicios |
| `/servicios` | Puerta talleres | `puerta-talleres-torno` | Un artesano en su taller, que es quien entra por esa puerta |
| `/servicios` | Puerta empresas | `puerta-empresas-bobinas` | Fabricación textil: empresa con material y proceso |
| `/servicios` | Cierre | `cierre-servicios-cesteria` | Manos haciendo una pieza: «Tu oficio tiene valor» |
| Talleres | Cabecera | `hero-talleres-alfarero` | Alfarero con sus piezas: el oficio que hay que dar a entender |
| Talleres | Club | `caja-club-manos` | Varias personas sobre la misma mesa: comunidad. Sustituye a una foto con niños, de 640 px |
| Talleres | Diagnóstico | portada de ejemplo | Es el documento que se entrega |
| Talleres | Impulso | `impulso/caja-impulso-perfil` | Perfil de Instagram de ejemplo, que es lo que prepara el Impulso |
| Talleres | Testimonio | retrato de Blanca | Es quien firma el testimonio |
| Talleres | Cierre | `cierre-talleres-taller` | Un taller con todo a la vista: «Empieza por saber qué tienes» |
| Empresas | Cabecera | `hero-empresas-bobinas` | Planta de hilatura: empresas que fabrican o transforman materiales |
| Empresas | Diagnóstico | `caja-empresas-material` | Corcho recogido en cubos: «materiales, proceso y lo que desechas» |
| Empresas | Roadmap | `caja-empresas-roadmap` | Ilustración del servicio: carpeta «Roadmap 3D» y calendario |
| Empresas | Sprint | `caja-empresas-sprint` | Ilustración del servicio: tablero del piloto y su lanzamiento |
| Empresas | Precio | `precio-empresas-matriz` | La matriz con la que se elige «cuál conviene hacer primero» (PDF de ejemplo) |
| Empresas | Cierre | `cierre-empresas-vellones` | Lana acumulada en una nave: material con una oportunidad por descubrir |
| Diagnóstico | Cabecera | `hero-manos-cuero` | Mesa de trabajo con material: «lo que ya tienes» |
| Diagnóstico | Relato 01 | `prob-1-ceramista` | Ceramista mirando su pieza: nadie ve ese valor |
| Diagnóstico | Relato 02 | `prob-2-mesa` | Artesana sentada a su mesa: por dónde empezar a contar |
| Diagnóstico | Relato 03 | `prob-3-restos` | Corcho triturado: restos que tienen salida |
| Diagnóstico | Relato 04 | `prob-4-cestas` | Un puesto de cestas casi iguales: «todos dicen lo mismo» |
| Diagnóstico | Informe y ejemplos | portadas | Son los documentos de ejemplo |
| Diagnóstico | Testimonio / Jose | retratos | Son las personas de las que habla la sección |
| Diagnóstico | Cierre | `cierre-herramientas` | Herramientas junto a una hoja en blanco: empezar |
| Roadmap | Cabecera | `hero-roadmap-ilustracion` | Ilustración del servicio: carpeta, calendario de 90 días y cronograma |
| Roadmap | Operación | `caja-operacion-plan90` | El cronograma de 90 días con hitos (PDF de ejemplo, p. 5) |
| Roadmap | Comunicación | `caja-comunicacion-piezas` | La lista de piezas por producir (PDF de ejemplo, p. 6) |
| Roadmap | Entregable | `documento-portada` | Portada del documento que se entrega |
| Roadmap | Precio | `precio-alcance` | Lo que incluye y lo que no: el alcance cerrado (PDF de ejemplo, p. 7) |
| Roadmap | Cierre | `cierre-trazado` | Trazar el patrón antes de cortar: planificar antes de invertir |
| Sprint | Cabecera | `hero-sprint-ilustracion` | Ilustración del servicio: tablero del piloto, ficha, landing y caso |
| Sprint | Operación | `caja-operacion-piloto` | Los cinco pasos del piloto (mini-caso, p. 4) |
| Sprint | Comunicación | `caja-comunicacion-kit` | Las piezas del kit comercial (mini-caso, p. 5) |
| Sprint | Entregable | `documento-portada` | Portada del mini-caso |
| Sprint | Precio | `precio-alcance` | Lo que incluye y lo que se cotiza aparte (mini-caso, p. 8) |
| Sprint | Cierre | `cierre-mosaico` | Piezas de barro colocadas: el mini-caso va «del recorte al mosaico» |
| Impulso | Cabecera | `hero-impulso-artesana` | Artista en mitad de su trabajo: sin tiempo para contarlo |
| Impulso | Relato 01 | `prob-1-artesana` | Artesana concentrada en lo que quiere hacer: su oficio |
| Impulso | Relato 02 | `prob-2-cuero` | Detalle de técnica que no se ve en la pieza acabada |
| Impulso | Relato 03 | `diagnostico/prob-4-cestas` | Un puesto donde todo se parece: competir por ser visible |
| Impulso | Relato 04 | `prob-4-taller-noche` | Trabajo de noche: la comunicación como carga añadida |
| Impulso | Ceramista | `oficio-ceramista` | Manos con una pieza de cerámica (`precio-ceramista-etiqueta`, sin cara) |
| Impulso | Carpintero | `oficio-carpintero` | Manos con un tablero (`carpinteria-y-ebanisteria`) |
| Impulso | Joyera | `oficio-joyera` | Vitrina de un taller de joyería (`espai-micra-taller`, sin personas) |
| Impulso | Taller cerámico | `oficio-taller-ceramico` | Manos entregando un encargo, con estantes de cerámica (`precio-entrega-pieza`) |
| Impulso | Herramientas | `herramientas-mesa` | Artesana trabajando en su cuaderno: el cuaderno de trabajo |
| Impulso | Circularidad | `circularidad-pieza` | Pieza hecha con corcho triturado: reutilizar residuos |
| Impulso | Precios | portada, `caja-impulso-perfil`, `caja-completo-video` | Lo que se entrega: informe, perfil de Instagram y vídeo corto |
| Impulso | Cierre | `cierre-yunque` | El oficio en marcha: «Tu oficio tiene valor» |
| Impacto | Cabecera | `hero-impacto-rebano` | El origen de la lana que mueve la red |
| Impacto | Cómo contamos | `contamos-vellones` | El material que se pesa |
| Impacto | Objetivos | `objetivos-ovillo` | La lana ya convertida en hilo: adónde se quiere llegar |
| Impacto | Respalda | `respalda-fibra` | Lana sin procesar, el material del ensayo de acolchado (no es una foto del ensayo) |
| Impacto | Cierre | `cierre-tejiendo` | Manos que usan la lana: la otra parte de la red |
| Guía | Cabecera / texto | taller, plata y anillos | Joyería y plata, el tema de la guía |

### Imágenes que faltan (actualizada)

| Página | Sección | Qué haría falta |
|---|---|---|
| Impulso | ¿Te reconoces?, joyera | Manos trabajando joyería: en `oficios/` solo hay vitrina y piezas |
| Impulso y Talleres | Tarjetas Impulso y Completo | Capturas de un kit real. Hoy son recortes de las portadas de las lecciones del Club, con un perfil de ejemplo («Taller Alba») |
| Impulso y Diagnóstico | Relato «otros más visibles» y «todos dicen lo mismo» | Una foto propia para cada página: hoy comparten la de las cestas |
| Impacto | Qué lo respalda | Una foto del ensayo de acolchado en Ourense |
| Empresas | Diagnóstico y cierre | Fotos de una empresa real con su material sobrante |
| Empresas | Tarjetas Roadmap y Sprint | Se mantienen las ilustraciones: explican el servicio, pero el tono es más claro que el resto |
| Portada | Comunidad | Retratos de Esther, Jorge y Maika |
| Diagnóstico | Testimonios | Un segundo testimonio autorizado |

### Lighthouse móvil (23 nov 2026, v13.6.0, una pasada por página)

Staging, con `npx lighthouse` y sus ajustes móviles por defecto. Columna «producción»: rendimiento de la página que hoy está en www, para el criterio 9 (no bajar más de cinco puntos).

| Página | Rendimiento | Producción | Accesibilidad | Prácticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | 91 | 72 | 95 | 73 | 100 | 3,3 s | 0 | 60 ms |
| `/servicios` | 95 | no existe | 95 | 77 | 100 | 2,7 s | 0 | 50 ms |
| `/servicios/talleres` | 97 | no existe | 95 | 77 | 100 | 2,3 s | 0,01 | 60 ms |
| `/servicios/empresas` | 98 | no existe | 95 | 77 | 100 | 1,9 s | 0 | 70 ms |
| `/servicios/diagnostico-3d` | 97 | 98 | 95 | 77 | 100 | 2,3 s | 0 | 70 ms |
| `/servicios/roadmap-3d` | 99 | 98 | 95 | 77 | 100 | 1,8 s | 0,008 | 60 ms |
| `/servicios/sprint-3d` | 98 | 99 | 95 | 77 | 100 | 1,9 s | 0,011 | 60 ms |
| `/impulso-3d` | 98 | 96 | 95 | 77 | 100 | 1,8 s | 0,03 | 60 ms |
| `/impacto` | 97 | no existe | 95 | 77 | 100 | 2,2 s | 0 | 70 ms |
| `/conecta-lana` | 98 | 99 | 94 | 77 | 100 | 1,9 s | 0 | 60 ms |
| Guía de joyería | 89 | no medida | 97 | 77 | 100 | 3,1 s | 0 | 90 ms |
| `/club` | 88 | no medida | 95 | 77 | 69 | 3,4 s | 0 | 80 ms |

- **Criterio 9:** se cumple en las seis páginas comparables. La bajada mayor es de un punto. Una sola pasada tiene unos puntos de variación; el 72 de la portada de producción salió con un LCP de 63 s, anómalo.
- **Prácticas 73–77:** cookies de terceros (LinkedIn), que entran por GTM. No se toca GTM.
- **Accesibilidad 94–97:** contraste en los créditos del pie (4,04 frente a 4,5) y salto de nivel de titulares en el pie (`h4`), ambos en la parte común. Solo se ha mirado el detalle en Roadmap.
- **SEO 69 de `/club`:** es por el noindex, que es intencionado.
- **Posibles mejoras:** el logo cuadrado pesa 195 KB y se muestra a 20 px; la portada descarga 12 MB en fotos de origen.

### Comprobaciones

- Menú con ratón, teclado y móvil, y consola limpia, en las ocho páginas del encargo (en local). Capturas a 375 px sin desbordamiento horizontal.
- En staging, todas las imágenes de `landing/` responden 200. `npm test`: 18 pruebas, todas pasan.

## Fase 4 y marcas de agua (23 nov 2026)

### Marcas de agua

`workshop_tools.jpg` y `pottery_hands.jpg` (dreamstime) se han borrado. La rama `fix/retirar-pdf-y-marcas-agua`, que sale de `main`, lleva lo mismo para producción, más la retirada del PDF de textil. No está fusionada.

| Sección | Antes | Ahora | Por qué esta imagen aquí |
|---|---|---|---|
| Portada, cierre | `workshop_tools.jpg` | `cierres/taller-oficio.webp` | Una persona en su taller: «cada creador se convierte en agente de transformación» |
| Oficios, cierre (los 16) | `workshop_tools.jpg` | `cierres/herramientas-oficio.webp` | Herramientas de varios oficios: sirve en cualquier vertical |
| `/club`, cierre | `workshop_tools.jpg` | `cierres/relevo-taller.webp` | Dos generaciones sobre la misma pieza: «pasando de mano en mano» |
| Talleres, cierre | recorte de `Taller vacio.png` | recorte de `taller acero.jpg` | Todo el herramental a la vista: «saber qué tienes». La anterior era una versión sin marca de la misma escena de dreamstime |

Revisión de todas las imágenes de `public/` a ojo y por metadatos, y de las imágenes incrustadas en los PDF. No hay más marcas de banco. Otras dudas, sin tocar:

| Archivo | Qué pasa | Dónde se ve |
|---|---|---|
| `mirandomadera.jpg` | Metadatos de Getty/iStock (PeopleImages) | Imagen para compartir de `/impulso-3d` y dentro de `Circular_Express…2025.pdf` |
| `blog/incendios-…/incendio-monte.jpg` | Metadatos de EFE, sin crédito en la página | Artículo de incendios |
| `new_hero_potter.jpg`, `hero_artisan_leather.jpg` | Firma «MULLINS» en la esquina | Recortada, sin la firma, en la puerta de talleres de `/servicios`. Los originales están en producción, sin uso |
| `cases/e-wear/ficha-lote-ejemplo-redactada.webp` | Distintivo de generador en la esquina | Sin uso |
| `OC_Guia_Materiales_Corta_2025.pdf` | El mismo distintivo en varias ilustraciones | Descargable |
| `Taller vacio.png` | Misma escena que la foto de dreamstime, sin marca | Sin uso |

### CSS

Se han borrado `impulso-3d.css` y tres partials sin uso (`oc-cta-band`, `oc-hero`, `testimonio-blanca`). En `pages-v2.css`, `oc-puertas.css` y `oc-landing.css` se han quitado las clases que no aparecen en ninguna vista, página, script ni dato: de 68 a 28 KB, de 7,7 a 2,3 KB y 0,8 KB menos. Comparadas 15 páginas a 1280 y 375 px: solo cambia lo buscado, más las cabeceras animadas.

### Portada

- Fotos en WebP con varios anchos. La primera con prioridad; las otras cinco se piden de una en una.
- Con Lighthouse móvil baja de unos 12 MB a 1,6 MB.
- Logo cuadrado: de 195 a 12 KB en todas las páginas que lo llevan. Sello: de 67 a 35 KB.

### Lighthouse móvil en staging (rendimiento)

| Página | Antes (una pasada) | Ahora | Mediana |
|---|---|---|---|
| `/` | 91 | 91, 90, 90, 89, 84 | 90 |
| Guía de joyería | 89 | 90, 93, 79, 93, 97 | 93 |
| `/club`, primera tanda | 88 | 90, 74, 86 | 86 |
| `/club`, dos tandas después | — | 74, 65, 67, 75 (una fallida) y 78, 71, 65, 74, 72 | 72–74 |

- **Portada:** el 91 de antes no contaba la foto de cabecera, que aún se estaba descargando cuando se pintaba el texto. Lo que más frena ahora es la hoja de Google Fonts (unos 0,9 s simulados).
- **`/club`:** reparte al azar vídeo (3,7 MB) o cuatro fotos (1,9 MB en JPG), y a veces el texto de cabecera salta (CLS 0,16). En `/club` solo han cambiado el logo y la foto del cierre, que es diferida, además del CSS podado. No se ha optimizado.

### Después de la fase 4 (23 nov 2026)

- `fix/retirar-pdf-y-marcas-agua` fusionada en `main` (`b352f86`) y comprobada en www.
- **Artículo de incendios:** fuera `incendio-monte.jpg` (EFE). En su lugar, `og-incendios-despoblacion.jpg`: la ladera de matorral es «lo que se encuentran cuando llegan». Es la misma escena que la cabecera, que va bajo un velo casi opaco. Rama para `main`: `fix/imagen-incendios`, sin fusionar.
- **Puerta de talleres en `/servicios`:** de `new_hero_potter.jpg` a un recorte de `artesana cermica.jpg` (manos en el barro: «para talleres y marcas artesanas»).
- **Distintivo «Ai»:** borrada `ficha-lote-ejemplo-redactada.webp`; recortadas las siete ilustraciones de `OC_Guia_Materiales_Corta_2025.pdf`, que pasa de 39 a 15 MB.
- **Sin tocar:** `mirandomadera.jpg` y `hero_artisan_leather.jpg`, hasta que Jose compruebe la licencia.
- **Menú «Servicios»:** las 25 páginas estáticas con cabecera cargan `nav.js`.
- **PDF del Sprint:** regenerado desde su fuente (`Servicios_OC/_compartido/Ejemplos_Descargables_Web/_fuente`). El logo y el sello de 2026 no están en esa fuente: se traspasan del PDF publicado.
- Pendientes de diciembre: `docs/pendientes-diciembre-2026.md`.
