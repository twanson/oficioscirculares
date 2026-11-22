# Encargo de diseño · Llevar las páginas de servicios al nivel de las páginas principales

Fecha: 22 de noviembre de 2026. Repositorio: `oficioscirculares` (carpeta local `_repo_website`). Rama: `development`.

Este documento sustituye a las instrucciones de diseño anteriores. Las reglas de contenido del encargo `Prompt_ClaudeCode_Web_Impacto_Club_Nov2026.md` siguen vigentes.

---

## 1. Qué se quiere conseguir

La web tiene hoy dos niveles de calidad. La portada, `/club` y `/conecta-lana` son páginas inmersivas, con fotografía, ritmo y carácter. Las páginas de servicios son una sucesión de tarjetas blancas sobre fondo claro, con una sola foto arriba. Al pasar de unas a otras parece que se cambia de web.

El objetivo es que cualquier página de servicios se perciba como hermana de `/club` y `/conecta-lana`: el mismo lenguaje visual, la misma densidad de imagen y el mismo cuidado. No se trata de retocar márgenes ni de añadir sombras. Se trata de reconstruir estas páginas con el sistema de las páginas principales.

Páginas dentro del encargo:

| Página | Vista |
|---|---|
| `/servicios` | `views/servicios.ejs` |
| `/servicios/talleres` | `views/servicios.ejs` o la que corresponda |
| `/servicios/empresas` | ídem |
| `/servicios/diagnostico-3d` | `views/diagnostico-3d.ejs` |
| `/servicios/roadmap-3d` | `views/roadmap-3d.ejs` |
| `/servicios/sprint-3d` | `views/sprint-3d.ejs` |
| `/impulso-3d` | `views/impulso-3d.ejs` |
| `/impacto` | `views/impacto.ejs` |
| `/blog/joyeria-plata-recuperada/` | la guía nueva |
| Portada, secciones de servicios y «Comunidad» | `views/index.ejs` |

No se tocan el diseño de `/club`, de `/conecta-lana` ni de la cabecera de la portada. Son la referencia.

---

## 2. Reglas

1. Solo se trabaja en `development`. Nada pasa a `main` sin el visto bueno expreso de Jose.
2. `/club` y sus rutas conservan `noindex`.
3. No se inventa ningún dato, cifra, testimonio ni nombre. Lo que falte se anota en la lista de pendientes; en la página no puede verse ningún marcador del tipo `[PENDIENTE…]`.
4. Colores y tipografía: los tokens que ya existen en `club.css` (verde `#023429`, verde hondo `#032A20`, terracota `#934A1C`, arena `#E8D5B7`, crema `#FBF7EF`, Newsreader y Manrope). No se añaden colores nuevos.
5. Sin emojis. Sin menciones a la inteligencia artificial. Tuteo.
6. Ningún estado se distingue solo por rojo y verde. Se usa texto, icono o el contraste ámbar y azul.
7. Los textos actuales de cada página se conservan salvo que este documento diga otra cosa. Este encargo es de diseño; si para una sección nueva hace falta texto que no existe, se propone en el informe y se espera aprobación.
8. No se envían correos, no se tocan Stripe ni Brevo.
9. Un commit por fase. Registro en `docs/encargo-diseno-nov-2026-registro.md`.

---

## 3. Diagnóstico medido en el entorno de pruebas (22 de noviembre)

Mediciones tomadas a 1.280 px de ancho.

| Página | Alto total | Imágenes en la página | Familia de estilos |
|---|---|---|---|
| `/club` (referencia) | 13.022 px | 17, repartidas en 8 de sus 13 secciones | `club.css` |
| `/conecta-lana` (referencia) | 6.782 px | 12, más vídeo en la cabecera | estilos en la propia vista (`cl-*`) |
| Portada (referencia) | 6.471 px | 11 | `home-v2.css` |
| `/servicios` | 4.323 px | 2: la de cabecera y la de la banda final | `impulso-3d.css` + `oc-puertas.css` |
| `/servicios/talleres` | 5.307 px | 3 | ídem |
| `/servicios/empresas` | 4.772 px | 2 | ídem |
| `/servicios/diagnostico-3d` | 7.254 px | 3 | ídem |
| `/servicios/roadmap-3d` | 6.905 px | 1: solo la de cabecera | plantilla antigua `service-*` de `pages-v2.css` |
| `/servicios/sprint-3d` | 7.743 px | 1 | ídem |
| `/impacto` | 6.017 px | 2 | `impulso-3d.css` + `oc-puertas.css` |

Lo que se deduce de la tabla y de la revisión visual:

1. **Falta imagen.** Las páginas de servicios tienen una foto arriba y, como mucho, otra en la banda final. Entre medias hay de tres a seis secciones seguidas sin una sola imagen. En `/club` hay imagen en ocho de trece secciones.
2. **No hay secciones oscuras.** Las páginas principales alternan tramos en verde hondo con tramos en crema. Las de servicios son todas claras, salvo la cabecera.
3. **Todo es la misma tarjeta.** Problema, método, entregables, precio y preguntas frecuentes se resuelven con la misma tarjeta blanca de esquinas redondeadas y sombra suave. No hay cambio de escala ni de ritmo.
4. **La cabecera es más pobre.** Las de servicios son un degradado verde con una foto recortada en una caja a la derecha. Las de `/club` y `/conecta-lana` son foto o vídeo a sangre, con velo, insignia, titular enorme con una parte en cursiva y una línea de precio.
5. **Conviven cuatro sistemas.** `club.css`, los estilos `cl-*` dentro de `conecta-lana.ejs`, `impulso-3d.css` con `oc-puertas.css`, y la plantilla `service-*`. Roadmap y Sprint ni siquiera comparten componentes con el resto de servicios.
6. **La tipografía es tímida.** Los titulares de sección de servicios rondan los 32 px; los de `/club` usan escalas fluidas mucho mayores y cursiva de acento.
7. **Detalles.** `pages-v2.css` se carga dos veces en las páginas de servicios. La sección «Comunidad» de la portada muestra una sola tarjeta centrada con mucho vacío a los lados.

---

## 4. La referencia: qué hace buenas a las páginas principales

Antes de escribir una línea, abre en el navegador `/club` y `/conecta-lana` de principio a fin, a 1.280 px y a 375 px, y lee `public/assets/css/club.css` completo. Estos son los componentes que hay que reutilizar. Todos existen ya en `club.css`, bajo el ámbito `.club-landing`:

| Componente | Clases | Para qué sirve |
|---|---|---|
| Cabecera inmersiva | `.club-hero`, `.hero-media`, `.hero-slides`, `.hero-overlay`, `.hero-inner`, `.hero-badge`, `.micro` | Foto a sangre con paso suave entre imágenes, velo, insignia, titular y línea de precio |
| Relato del problema | `.prob`, `.prob-grid`, `.prob-sticky`, `.prob-visual`, `.beat`, `.pildora` | Tramo oscuro en el que el texto avanza y la foto queda fija a un lado. Cifra o frase grande por paso |
| Manifiesto | `.resol` | Frase central grande sobre fondo oscuro, que cierra el problema |
| Banda de credibilidad | `.cred`, `.cred-items`, `.cred-item` | Tres o cuatro datos comprobables en una franja |
| Cajas con foto | `.cajas`, `.cajas-grid`, `.caja`, `.caja--dark`, `.caja--light`, `.caja--accent`, `.caja-foto` | Lo que incluye el servicio, con una caja destacada y foto dentro |
| Pasos | `.pasos`, `.pasos-grid`, `.paso` | Proceso numerado |
| Testimonios | `.testi`, `.testi-grid`, `.testi-card` | Retrato en duotono con cita |
| Quién está detrás | `.detras`, `.detras-grid`, `.detras-foto`, `.detras-firma` | Jose, con foto y firma |
| Para quién sí y para quién no | `.quien`, `.quien-grid`, `.quien-col` | Dos columnas enfrentadas |
| Precio | `.precios`, `.planes`, `.plan`, `.plan--destacado`, `.plan-precio`, `.perks` | Precio con jerarquía clara |
| Preguntas frecuentes | `.faq` | Acordeón |
| Cierre | `.final`, `.confianza` | Foto a sangre con llamada a la acción y banda de confianza |
| Botones y etiquetas | `.club-btn` y variantes, `.eyebrow`, `.pill-sec` | — |
| Aparición al hacer scroll | `.reveal` | — |

De `/conecta-lana` hay que tomar además las tres tarjetas de puertas con degradado, icono y etiquetas (`.cl-doors`), el tramo de cifra grande con barra de proporción (`.cl-why`) y la cita a pantalla completa sobre verde hondo (`.cl-testimonio`).

---

## 5. Fase 0 · Un solo sistema de diseño para las páginas de aterrizaje

Hoy los componentes buenos están encerrados en `.club-landing` o escritos dentro de una vista. Antes de rediseñar ninguna página hay que hacerlos reutilizables.

1. Crea `public/assets/css/oc-landing.css` con los tokens y los componentes de la tabla del apartado 4, bajo un ámbito genérico `.oc-landing`. Incluye también las puertas, el tramo de cifra grande y la cita a pantalla completa de `conecta-lana.ejs`.
2. No dupliques reglas. La forma más limpia es que los selectores valgan para los dos ámbitos, por ejemplo `:is(.club-landing, .oc-landing) .caja`, o mover las reglas al archivo nuevo y que `club.css` conserve solo lo exclusivo del Club. Elige la que menos riesgo tenga y explícala en el registro.
3. **`/club` y `/conecta-lana` no pueden cambiar de aspecto.** Antes de empezar, guarda capturas de las dos a página completa, a 1.280 px y a 375 px. Al terminar la fase, repite las capturas y compáralas. Cualquier diferencia se corrige.
4. Cuando las páginas de servicios estén migradas, elimina las reglas de `oc-puertas.css`, de `impulso-3d.css` y de la plantilla `service-*` de `pages-v2.css` que ya no use nadie. Quita la carga duplicada de `pages-v2.css`.
5. Escribe `docs/sistema-landing.md`: una página con la lista de componentes, para qué sirve cada uno y un ejemplo de marcado. Es lo que evitará que la próxima página nueva vuelva a salir plana.

**Punto de control.** Al terminar la fase 0, para y enseña las capturas de antes y después de `/club` y `/conecta-lana`.

---

## 6. Fase 1 · Una página piloto: `/servicios/diagnostico-3d`

Se rediseña primero una sola página, completa, y se espera el visto bueno antes de seguir. Se elige el Diagnóstico para talleres porque es la puerta de entrada y la que más contenido tiene.

Estructura, de arriba abajo:

1. **Cabecera inmersiva.** Foto a sangre con velo. Insignia «Diagnóstico 3D para talleres». Titular actual, con la parte final en cursiva de acento. Subtítulo. Botón principal y botón secundario «Ver qué incluye». Línea de precio: «90 € + IVA · Sin llamadas · Informe y vídeo en tu correo».
2. **Relato del problema**, en verde hondo, con foto fija a un lado. Convierte las cuatro tarjetas de «¿Te suena esto?» en cuatro pasos, cada uno con su frase en grande. Sin cifras inventadas: aquí el protagonismo es de la frase, no del número.
3. **Manifiesto.** Una frase central que resuma la promesa. Propón dos opciones a partir de los textos que ya hay en la página; no la publiques sin aprobación.
4. **Cómo funciona.** Los tres pasos actuales con el componente de pasos, sobre crema.
5. **Qué incluye el informe**, con cajas con foto. La caja destacada enseña el informe: usa como imagen la portada de un diagnóstico de ejemplo de `public/assets/diagnosticos/`, presentada como un documento sobre una mesa o en ligera perspectiva, con sombra. Las otras cajas llevan icono.
6. **Un ejemplo para ver.** Una fila con tres o cuatro portadas de diagnósticos de ejemplo de distintos oficios, tomadas de `public/assets/diagnosticos/`, con el texto «Así es un Diagnóstico 3D». No uses la de textil.
7. **Para quién sí y para quién no.** Dos columnas. Redacta la propuesta a partir de las preguntas frecuentes actuales y espera aprobación del texto.
8. **Precio.** Una sola tarjeta de plan, grande, con los 90 € bien jerarquizados y lo que incluye.
9. **Testimonios.** Dos tarjetas con el componente de testimonios (apartado 9).
10. **Quién está detrás.** El bloque de Jose, igual que en `/club`.
11. **Preguntas frecuentes**, en acordeón.
12. **Cierre** con foto a sangre y banda de confianza.

**Punto de control.** Despliega solo esta página en el entorno de pruebas, guarda capturas a página completa a 1.280 px y a 375 px en `docs/capturas/`, y para. Jose decide si el nivel es el que busca antes de replicarlo.

---

## 7. Fase 2 · El resto de páginas

Aplica la misma estructura, adaptada a cada caso. No hace falta que todas tengan las doce secciones; sí que todas alternen tramos oscuros y claros, tengan imagen en al menos la mitad de sus secciones y no repitan el mismo tipo de bloque dos veces seguidas.

### `/servicios`
- Cabecera inmersiva con el titular «¿Por dónde entras?».
- Las dos puertas, con el diseño de las tres tarjetas de `/conecta-lana` (degradado, icono, etiquetas y botón). Cada puerta lleva además una foto en la parte superior de la tarjeta: un taller para la de talleres y un entorno de fabricación para la de empresas.
- El método en tres pasos, sobre verde hondo, con el componente de pasos.
- Banda de credibilidad con tres cifras de `data/impacto.json`, cada una con su fecha.
- Cierre.

### `/servicios/talleres`
- Cabecera inmersiva.
- Relato corto del problema, con tres pasos.
- «Tu camino con Oficios Circulares»: las tres tarjetas actuales (Club, Diagnóstico e Impulso) pasan a ser cajas con foto. Cada una con una imagen distinta en la parte superior. La del Diagnóstico sigue siendo la destacada.
- Método, testimonios (dos), quién está detrás y cierre.

### `/servicios/empresas`
- La misma estructura que la de talleres.
- **Las tres tarjetas (Diagnóstico, Roadmap y Sprint) llevan imagen en la parte superior.** Hoy solo tienen un icono. Usa las ilustraciones que ya existen en `public/img/servicios/`: `diagnostico-3d-hero.jpg`, `Hero_Roadmap3d.png` y `sprint3d-hero.png`. Si alguna no encaja por proporción o por estilo con las otras dos, dilo y no la fuerces.
- Mientras falten los precios, la tarjeta del Diagnóstico muestra «Precio a consultar» y las otras dos «Precio cerrado tras el Diagnóstico». Que esos textos no tengan el tamaño de un precio: van en cuerpo pequeño, bajo el nombre.
- Esta página no tiene testimonio de empresa. No pongas uno de taller en su lugar; usa la banda de credibilidad con cifras de la red.

### `/servicios/roadmap-3d` y `/servicios/sprint-3d`
- Son las más alejadas: usan la plantilla antigua `service-*`, con una sola imagen en toda la página. Se migran por completo al sistema nuevo.
- Estructura: cabecera inmersiva, «tiene sentido si…» como relato del problema, qué te llevas en cajas con foto, cómo trabajamos en pasos, qué incluye el entregable con una imagen del documento, inversión, preguntas frecuentes y cierre.
- En la sección de inversión no puede quedar una tarjeta casi vacía con «Precio cerrado tras el Diagnóstico» en el centro. Sustitúyela por un bloque que explique en tres pasos cómo se llega al precio: primero el Diagnóstico, después una propuesta cerrada, y solo entonces la decisión.

### `/impulso-3d`
- Conserva todo su contenido, incluida la sección «¿Te reconoces?» con los cuatro perfiles, que son arquetipos y no testimonios. Si se retiró, se restaura sin nombres propios y sin citas entre comillas.
- Se migra al sistema nuevo: cabecera inmersiva, el problema como relato, y fotos dentro de las secciones de herramientas y de entregables.

### `/impacto`
- Cabecera inmersiva con una foto de lana o de rebaño de `public/assets/images/viaje-lana/`.
- Las cuatro cifras de la red, en un tramo en verde hondo, con el tratamiento de cifra grande de `/conecta-lana`: número enorme en Newsreader, una línea que explica qué mide y la fecha del dato bien legible. Una cifra por fila o dos, no cuatro tarjetas pequeñas.
- Las otras cuatro cifras, en una banda de credibilidad sobre crema.
- «Cómo contamos», objetivos con barra de progreso (la cifra siempre también en texto) y «Qué lo respalda», cada bloque con una foto.
- Cierre.

### Guía de joyería
- Usa la plantilla de artículo del blog: imagen de cabecera, ancho de lectura y tipografía de los demás artículos. Dentro del texto, dos o tres imágenes de `public/assets/images/cases/e-wear/` que no muestren el nombre «E-WEAR» ni den a entender que hubo un cliente: valen la textura de plata y el prototipo de anillo. No uses las fichas de lote ni el ensayo de pureza, porque parecen documentos de un caso real.

### Portada
- **Servicios.** Comprueba que la sección conserva la foto del yunque y la cita del fundador, y que las dos puertas tienen el mismo peso visual que «Forma parte de la Red».
- **Comunidad.** Hoy muestra una sola tarjeta centrada. Pasa a una rejilla con los cuatro testimonios autorizados (apartado 9). Con cuatro tarjetas, dos filas de dos en escritorio o una fila de cuatro, lo que quede mejor.

---

## 8. Imágenes

Inventario de lo que ya hay en el repositorio y se puede usar:

| Carpeta | Contenido |
|---|---|
| `public/assets/images/` | Unas 50 fotos de talleres, manos, herramientas y oficios: `alfarero.jpg`, `artesano yunque.jpg`, `artesanos en taller.jpg`, `cesteria.jpg`, `manos cuero.jpg`, `mirandomadera.jpg`, `pottery_hands.jpg`, `taller acero.jpg`, `taller clasico metal.jpg`, `natural_workshop.jpg`, `community_workshop.jpg`, entre otras |
| `public/assets/images/oficios/` | Una foto por oficio (21) y, en `cards/`, sus versiones para tarjeta |
| `public/assets/images/club/` | `hero-1` a `hero-4`, `prob-1` a `prob-3` y `blanca-hilandia.jpg`. Son del Club: no las repitas en servicios |
| `public/assets/images/viaje-lana/` | Fotos de lana, rebaños, naves y talleres textiles, en 900 y 1.600 px |
| `public/assets/images/conecta-lana/` | `vellon-crudo.jpg` |
| `public/img/servicios/` | Ilustraciones de cabecera de Diagnóstico, Roadmap y Sprint |
| `public/assets/diagnosticos/` | Portadas de los 16 diagnósticos de ejemplo por oficio |
| `public/assets/images/cases/e-wear/` | Imágenes del antiguo caso de joyería |

Reglas:

1. **Ninguna foto de cabecera se repite entre páginas**, y ninguna foto aparece dos veces en la misma página.
2. Las fotos de sección reciben el mismo tratamiento que en `/club`: esquinas con el radio del sistema, sombra y, en los retratos, duotono.
3. Para empresas, elige fotos de fabricación y de material (`taller acero.jpg`, `taller clasico metal.jpg`, `materiales-construccion.jpg`, `barro-artesanal.jpg`). Para talleres, fotos de manos y de taller pequeño.
4. Todas las imágenes nuevas van en WebP, con `width` y `height`, `loading="lazy"` salvo la de cabecera, y texto alternativo que describa lo que se ve.
5. Si para una sección no hay foto adecuada en el repositorio, **no pongas una de relleno ni generes una**. Anótalo en una tabla «Imágenes que faltan», con la página, la sección y qué tipo de foto haría falta, para que Jose la aporte.
6. Entrega en el registro una tabla con la imagen asignada a cada sección de cada página.

---

## 9. Testimonios

Solo se pueden publicar estos cuatro, con el texto que ya está aprobado en el repositorio:

| Persona | Cómo se firma | Dónde está el texto aprobado | Dónde se usa |
|---|---|---|---|
| Blanca Fernández | Asociación Hilandia · tejido artesanal | `views/partials/testimonio-blanca.ejs` | Servicios para talleres, Diagnóstico, Impulso, Club y portada |
| Esther San Vicente | Al Fresco-Museos Efímeros | `views/conecta-lana.ejs`, sección `cl-testimonio` | Conecta Lana, portada e Impacto |
| Jorge Esteban | Con enlace a `fenoquimica.es` | `views/conecta-lana.ejs`, sección `cl-testimonio` | Conecta Lana, portada e Impacto |
| Maika | Como figure en `views/club.ejs` | `views/club.ejs`, sección `testi` | Club y portada |

Reglas:

1. No cambies ni una palabra de las citas ni de las firmas.
2. Esther, Jorge y Maika hablan de Conecta Lana. No los pongas en páginas de servicios de pago como si fueran clientes de esos servicios. En la portada, la tarjeta de cada uno indica de qué habla: «Usuaria de Conecta Lana», por ejemplo.
3. Solo hay foto de Blanca. Para los otros tres no busques ni generes retratos. Usa un avatar con sus iniciales sobre arena, o el sello de la marca, con el mismo tamaño y forma que el retrato de Blanca, de modo que la rejilla quede equilibrada.
4. Lleva los cuatro testimonios a un único archivo de datos, `data/testimonios.json`, con nombre, firma, texto, foto, enlace y la lista de páginas donde puede aparecer. Las vistas leen de ahí.
5. Jose está pidiendo permiso a más usuarios de Conecta Lana. Cuando lleguen, se añadirán a ese archivo. Deja la rejilla preparada para seis.

---

## 10. Errores que hay que corregir

1. **El menú «Servicios» no se despliega en `/club`.** Causa comprobada: la lógica del desplegable está en `public/assets/js/script.js` (hacia la línea 433) y `views/club.ejs` no carga ese archivo. Ocurre lo mismo en cualquier vista que use la cabecera común y no cargue `script.js`: `conecta-lana.ejs`, `viaje-lana.ejs` y las vistas `club-*`. Solución: saca la lógica del menú (desplegable y menú móvil) a un archivo propio, `public/assets/js/nav.js`, y cárgalo desde `views/partials/header.ejs`, para que funcione en todas las páginas que usan la cabecera. Compruébalo en todas las vistas de `views/`, con ratón, con teclado (Intro, Escape y tabulador) y en móvil.
2. **Error de JavaScript en consola**: `Cannot read properties of undefined (reading 'classList')` en `showSlide`, `script.js` línea 410. El pase de imágenes se ejecuta en páginas que no lo tienen. Añade la comprobación y deja la consola limpia en todas las páginas.
3. **`pages-v2.css` se carga dos veces** en las páginas de servicios.
4. **Contenido invisible sin JavaScript.** Los elementos con `.reveal` solo aparecen al hacer scroll. Asegura que se ven si el script no carga y que se respeta `prefers-reduced-motion`.

---

## 11. Criterios de aceptación

Una página se da por buena cuando cumple todo esto:

1. Alterna al menos dos tramos en verde hondo con tramos claros.
2. Tiene imagen (foto, documento o ilustración) en al menos la mitad de sus secciones, sin contar la cabecera.
3. No hay dos secciones seguidas resueltas con el mismo tipo de bloque.
4. La cabecera es una foto a sangre con velo, insignia, titular con cursiva de acento y línea de precio o de dato.
5. Puesta al lado de `/club` a la misma altura de scroll, no se percibe un cambio de sistema: mismos radios, sombras, botones, escalas de titular y espaciado vertical.
6. A 375 px de ancho no hay desbordamiento horizontal, los titulares no se cortan y las tarjetas se apilan con aire.
7. Contraste de texto AA en todos los tramos, incluido el texto sobre foto.
8. Consola sin errores. El menú «Servicios» se despliega.
9. Rendimiento: la imagen de cabecera se precarga, el resto son diferidas, y la puntuación de rendimiento de Lighthouse en móvil no baja más de cinco puntos respecto a la versión actual de esa página.
10. No se ve ningún marcador de pendiente, ningún emoji y ningún testimonio fuera de los cuatro autorizados.

---

## 12. Orden de trabajo y qué entregar

| Fase | Qué | Punto de control |
|---|---|---|
| 0 | Sistema común `oc-landing.css` y corrección del menú y de los errores del apartado 10 | Capturas de antes y después de `/club` y `/conecta-lana` |
| 1 | Página piloto: `/servicios/diagnostico-3d` | Capturas a 1.280 y 375 px. **Esperar el visto bueno de Jose** |
| 2 | `/servicios`, `/servicios/talleres`, `/servicios/empresas` y portada | Capturas |
| 3 | Roadmap, Sprint, Impulso, Impacto y guía de joyería | Capturas |
| 4 | Limpieza de CSS sin uso y `docs/sistema-landing.md` | — |

Al terminar cada fase, entrega:

1. Las direcciones del entorno de pruebas para revisar.
2. Las capturas a página completa, a 1.280 y a 375 px, en `docs/capturas/<fase>/`.
3. La tabla de imagen asignada por sección y la tabla de imágenes que faltan.
4. Los textos nuevos propuestos que esperan aprobación (manifiestos y «para quién sí y para quién no»).
5. La lista de pendientes para Jose.

No pases nada a `main`. Después de la fase 1, para y espera.
