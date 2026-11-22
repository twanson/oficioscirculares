# Encargo de noviembre de 2026 · Web, impacto y novedades del Club

Registro de lo hecho por bloque, en la rama `development`. Nada se ha pasado a `main`.
Entorno de pruebas: `https://oficioscirculares-production.up.railway.app`.

---

## Bloque 1 · Correcciones de la web pública

### 1.1 Testimonios

Eliminados (no eran de clientes):

| Dónde | Qué había | Qué queda |
|---|---|---|
| `views/index.ejs` (portada, sección «Comunidad») | María, Javier, Lucía y Antonio, con la nota «Testimonios inspirados en experiencias reales» | Sección eliminada entera. Se deja un ancla `#comunidad` vacía para que los menús antiguos no den error |
| `views/oficio-vertical.ejs` (las 16 páginas de oficio) | María, Javier y Lucía | Sección eliminada entera |
| `views/impulso-3d.ejs` («Lo que cuentan quienes ya lo usan») | Elena R. (Toledo) y «Taller familiar» (Andalucía) | Testimonio de Blanca (Asociación Hilandia) |
| `views/impulso-3d.ejs` (perfiles tipo) | Los perfiles llevaban nombre propio (Marta, Javier, Lucía, Antonio) | Los perfiles se mantienen sin nombre propio («Ceramista, en torno a 55 años») |
| `views/club.ejs` | Tarjetas de Maika (sin permiso) y de Jorge Esteban | Solo Blanca. Jorge queda únicamente en Conecta Lana. **21 nov: vuelve la tarjeta de Maika** (Jose confirma su permiso), con su inicial en lugar de la foto de banco de imágenes |
| `views/diagnostico-3d.ejs` | Cita anónima «Taller de diseño textil, Madrid» | Eliminada |
| `views/roadmap-3d.ejs` | Cita anónima «Taller de carpintería, Barcelona» | Eliminada |
| `views/conecta-lana.ejs` | Cita de Maika comentada en el HTML (visible en el código fuente) | Eliminada. Quedan Esther San Vicente (Al Fresco-Museos Efímeros) y Jorge Esteban (enlace a fenoquimica.es) |

Testimonio de Blanca: nuevo parcial `views/partials/testimonio-blanca.ejs`, con el texto aprobado el 16 de julio de 2026 (el que ya estaba en `/club`). Aparece en `/club`, `/impulso-3d` y `/servicios/talleres`.

Se borran las fotos provisionales `public/assets/images/club/avatar-maika.jpg` y `avatar-jorge.jpg`, que ya no usa nadie.

### 1.2 Precios

- Archivo único: `data/precios.json`, leído por `lib/precios.js`. Las plantillas EJS usan `precios.texto('clave')`, `precios.html('clave')` o `precios.num('clave')`, disponibles en todas las vistas (`app.locals.precios`).
- Las páginas estáticas (FAQ, blog) usan marcas `{{precio:clave}}` o `{{precio-html:clave}}`. Un middleware de `server.js` las sustituye al servir la página.
- Un importe `null` se mostraba como `[PENDIENTE JOSE: precio único]`. **Desde el 22 nov 2026 ya no se publica el marcador:** Roadmap y Sprint muestran «Precio cerrado tras el Diagnóstico» y el resto (Diagnóstico para empresas, soportes del Impulso) «Consultar» (`lib/precios.js`, `SIN_PRECIO`). Siguen pendientes en la lista de abajo.
- Diagnóstico: 90 € en todas partes. Eliminados «desde 90 €» (Impulso 3D, blog «IA para artesanos») y «90–350 €» (página del Diagnóstico y FAQ).
- Impulso 3D: 495 € e Impulso 3D Completo: 895 €, sin «Desde» ni «Precio final según tu proyecto». Los datos estructurados ya no llevan `unitText: "desde"`.
- Roadmap 3D y Sprint 3D: horquillas eliminadas (350–1.500 € y 1.500–4.500 €), igual que las preguntas frecuentes que explicaban el rango. Se muestra el marcador de pendiente.
- Soportes mensuales del Impulso (75–150 €/mes y 150–300 €/mes): no están en la tabla del encargo, así que se muestra el marcador de pendiente.
- Club: 15 €/mes o 150 €/año; fundadores, 12 €/mes o 120 €/año, desde el archivo de precios. Retirada la mención a «Taller Pro» (35 €/mes).

### 1.3 Dos puertas

- Nuevas páginas (vista `views/servicios.ejs`):
  - `/servicios`: las dos puertas.
  - `/servicios/talleres`: Club, Diagnóstico 3D para talleres e Impulso 3D, con precios.
  - `/servicios/empresas`: Diagnóstico 3D para empresas, Roadmap 3D y Sprint 3D, con precios.
- Parcial reutilizable `views/partials/puertas.ejs`, usado en la portada y en las 16 páginas de oficio en lugar del bloque «Consultoría estratégica + Impulso 3D».
- Menú «Servicios» reorganizado en «Soy un taller o una marca artesana» y «Soy una empresa». En el pie, «Para talleres» y «Para empresas».
- Estilos en `public/assets/css/oc-puertas.css`.
- Añadidas al `sitemap.xml`.

### 1.4 Afirmaciones sin respaldo: frases eliminadas o reescritas

| Ubicación | Frase eliminada | Ahora |
|---|---|---|
| `views/sprint-3d.ejs`, bloque «¿Qué recibes a cambio?» | «Nuestros clientes suelen recuperar la inversión en 2-4 meses» | Eliminada |
| `views/sprint-3d.ejs`, mismo bloque | «6-8 meses de contenido y materiales incluidos» | «Los materiales de comunicación listados arriba» |
| `views/sprint-3d.ejs`, mismo bloque | «Nos hacemos cargo de que funcione (implementación garantizada)» | «Nos encargamos de la implementación contigo» |
| `views/sprint-3d.ejs`, mismo bloque | «Un caso de éxito real que te diferencia a largo plazo» | «Un caso documentado que puedes usar a largo plazo» |
| `views/sprint-3d.ejs`, portada y encaje | «Caso de éxito documentado…» / «Quieres tener un caso de éxito real» | «Caso documentado con datos medidos…» / «un caso documentado» |
| `views/sprint-3d.ejs`, insignias | «Resultados reales» | «Datos medidos» |
| `views/sprint-3d.ejs`, FAQ | «tenemos experiencia resolviendo los problemas típicos de cada tipo de implementación» | «los resolvemos juntos durante las cuatro semanas» |
| `views/roadmap-3d.ejs`, «Ejemplo real» | «Un estudio textil en Barcelona… Resultado: proceso validado y 3 meses de contenido listo» + cita «invertir 3.000 € en el piloto sabiendo que iba a funcionar» | Bloque eliminado |
| `views/roadmap-3d.ejs`, FAQ | «con garantías de éxito» | «paso a paso» |
| `views/roadmap-3d.ejs`, insignias | «Proveedores validados» | «Proveedores identificados» |
| `views/diagnostico-3d.ejs`, «Ejemplo real» | «taller de cerámica en Valencia… recuperar 72 kg al mes… 200 €/mes menos en gestión de residuos» | Bloque eliminado |
| `views/diagnostico-3d.ejs`, portada | «Datos concretos: kg que recuperas, dinero que ahorras, valor que ganas» | Eliminada (y la página se reescribe en el bloque 3) |
| `views/impulso-3d.ejs`, FAQ | «con el primero dedicas unas 2 horas a la semana a comunicar; con el segundo, menos de una hora» | «con el segundo, buena parte del trabajo te llega ya preparado» |
| `views/impulso-3d.ejs`, tarjeta Completo | «Quien quiere dedicar menos de una hora a la semana a comunicar» | «el menor tiempo posible» |
| `views/index.ejs` y `views/oficio-vertical.ejs` | «Historias de transformación real.» y «Cupos limitados por trimestre» | Eliminadas con sus secciones |
| `views/oficio-vertical.ejs`, ejemplo de diagnóstico | «Ejemplo real anonimizado» | «Ejemplo compuesto y anonimizado», con nota de caso compuesto |
| `data/oficios-seo.json` (16 oficios) | «Así trabajamos con un…» | «Así sería el trabajo con un…» |
| `data/oficios-seo.json` (3 FAQ) | «con 4 oportunidades priorizadas» | «con tres prioridades ordenadas» (coherente con el nuevo informe) |
| `data/oficios-verticales.json` (carpintería) | «El 74% de tus potenciales clientes buscan carpintero en Google» | «Mucha gente busca carpintero en Google» |
| `data/oficios-verticales.json` (16 oficios) | «Un diagnóstico gratuito (de 30 minutos) donde…» (contradecía el precio de 90 €) | «Un Diagnóstico 3D en el que…» |
| `views/club.ejs`, banda de credibilidad | «+200 talleres en el Mapa Circular Artesano» / «talleres acompañados uno a uno, cada mes» | Sin cifra / sin «cada mes» |
| `views/club.ejs`, bloque de datos | «8 de cada 10 pagarían algo más por lo hecho aquí al lado» (sin fuente; ya se había retirado de redes por eso) | «2 de cada 3 pagarían más por un producto que les diga cuánto dura y si se puede reparar (Observatorio Cetelem, 2025)», el dato con fuente que ya se usa en el correo 3 |
| `views/club.ejs`, FAQ | «método probado» | «método» |
| `views/partials/comunidad-recursos.ejs` | «Más de 200 talleres y puntos de economía circular artesana» | Sin cifra |
| `views/mapa-gate.ejs` (descripción y texto) | «+200 recursos circulares verificados» | Sin cifra ni «verificados» |
| `views/recurso-detail.ejs` (guía upcycling) | «Reducir hasta 60% los costes de tus materiales» / «Multiplicar x3 el valor percibido» | Sin cifras |
| `views/recurso-detail.ejs` (directorio lana) | «El primer directorio que reúne…» | «Un directorio que reúne…» |
| `public/faqs/index.html` | «Garantizamos metodología probada» | «Garantizamos método» |
| `public/casos/e-wear/` | Caso completo presentado como real («Un caso real»), con cifras que no cuadran entre sí (18 kg de plata de 62 kg de residuo), retorno de la inversión, empleos y lista de espera | **Retirado**: redirección temporal (302) a `/servicios`, fuera del sitemap, del índice del blog y de los enlaces de joyería (sustituido por el artículo de artesanía de lujo). Los archivos siguen en el repositorio |

No se ha tocado (se deja anotado):
- Blog: frases sin cifra como «Lo hemos visto muchas veces» (artesanía de lujo) o «acompañamos a PYMEs… en todo el proceso» (PERTE). No son cifras de resultado.
- `views/conecta-lana.ejs` y el artículo de la lana: «apenas un 1,7 % se transforma dentro de España». Es un dato del sector y sale del directorio propio de OC, no es un resultado de OC.
- `views/sprint-3d.ejs`, bloque «Garantía»: «seguimos trabajando hasta que funcione, sin coste adicional». Es una política comercial, no una cifra. Jose decide si se mantiene.

### 1.5 Cómo se presenta OC

- Portada: insignia «Red y plataforma de materiales de oficio» y primer párrafo con el texto base. Meta descripción y descripción de la organización en datos estructurados, alineadas.
- «Sobre nosotros»: subtítulo, «Qué hacemos» (texto base + la red primero, los servicios como complemento) y «Qué somos» (deja de decir «consultora estratégica independiente»). Quitados los emojis de los botones y del pie.
- Pie global: retirado el emoji de Instagram.

### Comprobación

- Búsqueda de «María», «Javier», «Lucía», «Antonio», «Elena R.», «desde 90» y «90-350/90–350» en el repositorio: solo quedan el nombre del fundador («Jose María Moscardó» en datos estructurados), una referencia externa real del blog («Antonio García Enrile», zapatero citado en «Trabajar por encargo») y el caso E-WEAR retirado.
- Páginas comprobadas en local con respuesta 200: `/`, `/servicios`, `/servicios/talleres`, `/servicios/empresas`, `/servicios/diagnostico-3d`, `/servicios/roadmap-3d`, `/servicios/sprint-3d`, `/impulso-3d`, `/club`, `/conecta-lana`, `/faqs/`, `/sobre-nosotros/`, `/oficios/joyeria-artesanal`, `/blog/ia-para-artesanos/`.

### Pendiente del bloque 1
- Precios únicos de Diagnóstico 3D para empresas, Roadmap 3D, Sprint 3D y los dos soportes mensuales del Impulso.
- Qué hacer con el caso E-WEAR: borrarlo, reescribirlo como caso ilustrativo o recuperarlo con datos reales.

---

## Bloque 2 · Página pública de impacto

- Ruta nueva `/impacto` (indexable, en el `sitemap.xml`). Vista `views/impacto.ejs`, estilos en `oc-puertas.css`.
- Datos en `data/impacto.json`: cada indicador lleva valor, detalle, una línea «qué mide» y su fecha. Para la revisión trimestral basta con cambiar ese archivo.
- Las ocho cifras son las de la tabla del encargo, cada una con su fecha.
- Debajo, los tres bloques: «Cómo contamos», «Qué queremos conseguir antes de octubre de 2027» (barras de progreso con la cifra también en texto; «Materiales con red activa» va sin barra porque no hay dato actual) y «Qué lo respalda» (ensayo de acolchado en Ourense con analíticas del INORDE y Promálaga Base 2026, sin nombres de personas).
- Enlaces: en el pie global (sustituye a «Comunidad»), en el menú principal, y en «Sobre nosotros» (texto y pie).
- Sin gráficos decorativos.

### Comprobación
`/impacto` responde 200 en local y todas las cifras y fechas coinciden con la tabla del encargo.

### Pendiente del bloque 2
- Confirmar qué cuenta «Personas en la comunidad» (1.070). Lleva un marcador visible en la página.
- Revisar las líneas «qué mide» de cada cifra. Están redactadas a partir del nombre del indicador, sin añadir datos.

---

## Bloque 3 · Página del Diagnóstico 3D para talleres

- `views/diagnostico-3d.ejs` reescrita como «Diagnóstico 3D para talleres» (misma URL, `/servicios/diagnostico-3d`, para no perder posicionamiento).
- Proceso sin llamadas, en tres pasos: compras (90 € desde `data/precios.json`), respondes un cuestionario de unos 20 minutos (con audios y fotos) y recibes el informe en PDF y un vídeo de 5 a 10 minutos en el que Jose te lo explica. El plazo lleva el marcador `[PENDIENTE JOSE: plazo de entrega]`.
- «Qué incluye el informe»: mapa del taller y de su entorno, inventario de lo que ya comunica, presencia en internet, oportunidades de circularidad y tres prioridades ordenadas.
- Bloque «quien compra el Diagnóstico puede entrar en el Club aunque las plazas estén cerradas»: solo se muestra con `club_abierto: true` en `club-config.json` o con la variable de entorno `CLUB_ABIERTO=true` (manda la variable). Hoy está apagado. Comprobado que aparece y desaparece al cambiar el valor.
- Eliminadas todas las menciones a la sesión o llamada de 45 minutos: cabecera, «Cómo funciona», precio, FAQ («¿45 minutos dan para algo?») y «Lo único que necesitas preparar». También en Impulso 3D («¿Cómo empezamos?», pasos 1 y 2) y en Sprint 3D («Diagnóstico (45 min)»).
- Añadido el testimonio de Blanca. Quitado el enlace al ejemplo «marca artesanal»; se mantiene el ejemplo «taller pequeño» (PDF ya publicado).
- El botón de compra sigue llevando al formulario de contacto (`/contacto?service=diagnostico-3d`), porque no hay enlace de pago propio del Diagnóstico.

### Pendiente del bloque 3
- Plazo de entrega del informe y del vídeo.
- Enlace de pago del Diagnóstico (Stripe), si se quiere que la compra sea directa.
- Confirmar que se mantiene «si después decides seguir con nosotros, te descontamos el importe del diagnóstico», que ya estaba publicado.

---

## Bloque 4 · Novedades del Club (solo entorno de pruebas)

La base de datos del Club (Supabase `club-oficios-circulares`) sigue en pausa. **No se ha restaurado.**

### Migración
- `db/migrations/20270104_club_novedades.sql`, para aplicar el 4 de enero de 2027 (paso 1 de `docs/checklist-4-enero.md`). Es idempotente.
  - `club_members`: columnas `nivel` (solo `empieza`, `publica` o `vende`), `itinerario`, `prioridades` (máximo tres), `oficio`, `autodiagnostico_respuestas` y `autodiagnostico_at`.
  - Tabla `club_votos` (clave primaria miembro + ronda: un voto por miembro y ronda; se borra con el miembro) y vista `club_votos_recuento`. RLS activada y sin políticas, como `club_members`.
- Probada contra un Postgres local (PGlite 0.2.17) con el esquema actual de `db/club-members.sql`: se aplica dos veces sin error, guarda un resultado de autodiagnóstico, rechaza un nivel inválido, más de tres prioridades y una ronda mal escrita, impide el segundo voto, borra el voto al borrar al miembro y deja RLS activa.

### 4.1 Autodiagnóstico en el alta
- Preguntas, regla de nivel, itinerario y prioridades en `docs/club-autodiagnostico.md`. **Aprobado por Jose el 21 nov 2026 con cuatro cambios y construido** (`lib/clubAutodiagnostico.js`, `views/club-empezar.ejs`, `/club/dentro/empezar`, 14 pruebas con `npm test`). Sin probar contra Supabase, que sigue en pausa.
- Recomendación: dentro de la web, no en Tally. El resultado se guarda en `club_members` en el mismo paso, sin webhook ni n8n entre medias.
- Ya preparado: `saveAutodiagnostico()` en `lib/clubMembers.js`, y el bloque «Tu punto de partida» en `/club/dentro` (nivel, tres prioridades, siguiente paso e itinerario), que aparece en cuanto el miembro tiene nivel. Comprobado renderizando la plantilla con un miembro de prueba.

### 4.2 Diagnósticos de ejemplo por oficio
- Revisados los 15 de `2_AREAS/Servicios_OC/_compartido/Plantillas_Comerciales/` (Markdown completo + texto del PDF):
  - **14 subidos**, todos casos compuestos sin nombres reales: alimentación, barro, construcción, cosmética, cuero, encuadernación, fibras, forja, joyería, lana, madera, turismo, upcycling y vidrio.
  - **Textil NO se sube.** No tiene nombres, pero junta detalles que podrían identificar a un taller real: taller en una capital del norte, tienda de museo de primer nivel, aparición en una televisión autonómica, volumen y precios por pieza.
- Están en `club-content/diagnosticos-ejemplo/` (fuera de `public`, solo para miembros) y se sirven en `/club/dentro/diagnosticos/:oficio`.
- En cada lección (01-04 y 06), al final de «En tu oficio», se añade un bloque con un enlace por oficio. Si el miembro tiene oficio guardado, el suyo sale destacado. Se inyecta al servir la página (`lib/clubLecciones.js`); los HTML originales no se tocan.
- **Aviso:** el PDF público `public/downloads/diagnosticos/ejemplo-diagnostico-textil-sostenible.pdf`, enlazado desde `/oficios/textil-sostenible` y ya en producción, contiene esos mismos detalles. No se ha tocado; lo decide Jose.

### 4.3 Mapa del contenido
- Lección 06 «Ferias que venden» copiada de la carpeta local del Club a `club-content/` y añadida a la estantería (portada de texto hasta que haya imagen).
- Mapa de lecciones con el estado escrito en texto, además del color (azul «Disponible», ámbar «Próximamente», ámbar con borde discontinuo «Pendiente»):
  - en `/club/dentro` (datos en `lib/clubContent.js → MAPA_LECCIONES`);
  - en `club-content/mapa-del-contenido.html` (sección nueva «Las lecciones, una a una»).
- Estados: 01-04 y 06 disponibles; 05 WhatsApp Business `[PENDIENTE JOSE]` (no se ha inventado); 07 «Contar la historia de tu marca», próximamente, febrero de 2027; 08 «Lo circular como argumento de precio», próximamente, marzo de 2027; desde abril, una lección al mes por votación.
- Votación: bloque en «Este mes en el Club» con la lista de temas y un voto por miembro (la base de datos impide el segundo). Temas en `club-content/votacion.json`, ronda `2027-04`: Etsy vs. tienda propia, Email básico, y Encargos a medida y Envíos y embalaje (las dos candidatas nuevas que ya estaban decididas en `ESTADO-DEL-PROYECTO.md`). WhatsApp y Ferias salen de la votación porque ya tienen número de lección.
- El mapa (secciones 01, 06 y 07) ya no habla de «otoño de 2026» ni de votar con #pido en el chat.

### 4.4 Directos con artesanos
- Página `/club/dentro/directos` (vista `views/club-directos.ejs`, datos en `club-content/directos.json`): próximos encuentros y archivo de grabaciones.
- Oculta: con `directos_visible: false` (o `DIRECTOS_VISIBLE=false`) la ruta redirige al hogar y no se enlaza desde ningún sitio. No aparece en la página de venta.

### 4.5 Fechas
Variables de configuración en `club-config.json`, que se pueden sobreescribir por variable de entorno: `club_apertura` = `2027-01-18` y `club_cierre` = `2027-01-27T23:59:00+01:00`.

Sitios del repositorio con fecha escrita a mano:

| Archivo | Había | Ahora |
|---|---|---|
| `views/club.ejs`, cabecera | «40 plazas hasta el 23 de septiembre» | «40 plazas, del 18 de enero al 27 de enero» (configuración) |
| `views/club.ejs`, precios | «Abrimos el Club con 40 plazas hasta el 23 de septiembre» | «…del 18 de enero al 27 de enero de 2027» (configuración) |
| `views/club.ejs`, cierre | «40 plazas fundador · Cierre: 23 de septiembre» | «Cierre: 27 de enero» (configuración) |
| `club-content/guia-primera-victoria.html` | «[DÍA Y HORA — p. ej. jueves 24 de septiembre, 19:00]» | «[DÍA Y HORA del primer directo]» |
| `club-content/mapa-del-contenido.html` | «Otoño 2026: primera lección votada…» | Febrero, marzo y abril de 2027 |
| `docs/club-area-miembros.md` | «el 23 de septiembre» y el ejemplo de directo de octubre | Remite a `club_cierre` |

El número de plazas (40) también sale ya de un único sitio (`data/precios.json`); `club-config.json` ya no lo repite.

No se ha tocado:
- `club-content/radar-ayudas-edicion-0.html`: «Aragón · hasta 1 sept», «Verano (jul–sept)». Son plazos de convocatorias de la edición de verano de 2026, no fechas del lanzamiento. Esa edición se sustituye por la Edición 1 en enero.

Plantillas de correo de Brevo: **no hay ninguna en el repositorio.** Están en la carpeta local del Club (`1_PROYECTOS/Club Oficios Circulares/Emails_Brevo/`) y no se han modificado. Fechas de septiembre que contienen:

| Correo | Fechas |
|---|---|
| `email-0-bienvenida-fundador.html` | comentario de envío «desde el 14 sept» |
| `email-1-lun-7-sept-la-historia.html` | envío «lunes 7 de septiembre de 2026»; texto «el lunes 14 de septiembre abrimos las primeras plazas» |
| `email-2-mie-9-sept-la-cuenta.html` | envío «miércoles 9 de septiembre de 2026»; texto «El lunes 14 de septiembre abrimos» |
| `email-3-vie-11-sept-circulares.html` | envío «viernes 11 de septiembre de 2026» |
| `email-4-lun-14-sept-apertura.html` | envío «lunes 14 de septiembre»; asunto «(hasta el 23 de septiembre)»; texto «hasta el miércoles 23 de septiembre»; banda «40 plazas · hasta el 23 de septiembre» |
| `email-5-mie-23-sept-cierre.html` | envío «miércoles 23 de septiembre de 2026»; banda «40 plazas · hasta el 23 de septiembre» |

Las campañas de Brevo (E1 #30, E2 #31, E3 #28, E4 #32, E5 #29) no se han tocado desde aquí.

### 4.6 Entrada fuera de plazo
- **No creado.** En este equipo no hay clave de Stripe ni acceso a Stripe desde las herramientas de la sesión, así que no se ha podido crear el enlace en modo de prueba. No se ha tocado nada en Stripe.
- Pasos para crearlo en prueba y en real, y el ajuste del webhook, en `docs/club-entrada-fuera-de-plazo.md`.

### 4.7 Vocabulario
- No quedaba «socios» referido a miembros del Club. Se reescriben las dos únicas apariciones, que hablaban de otras asociaciones, para no usar la palabra: radar de ayudas («…a quienes forman parte de ellas») y lección 06 («si perteneces o no a la federación»).

### 4.8 Página de venta del Club
- Pilar «Aprende»: «Una lección nueva cada mes (desde abril, por votación)» y «Diagnósticos de ejemplo de tu oficio».
- «Tu primera semana», día 1: el autodiagnóstico al entrar (nivel, orden de lecciones y tres prioridades).
- «Cada mes»: «Una lección nueva cada mes» (antes decía «una lección corta a la semana»).
- 40 plazas de fundador a 12 €/mes o 120 €/año, desde `data/precios.json` y con las fechas de la configuración.
- «Las 40 plazas fundador han volado» (con plazas cerradas) pasa a «Las plazas de fundador están cerradas». El cierre lo marca la configuración, no el número real de altas.
- No se mencionan los directos con artesanos. El directo mensual con revisión en vivo, que ya formaba parte del Club, sigue.

### noindex
- `/club` y todas las rutas que empiezan por `/club/` llevan ahora la cabecera `X-Robots-Tag: noindex, nofollow` desde un middleware. Además, `/club/lista-espera`, que estaba marcada como indexable, lleva ya la meta `noindex`. Comprobado en local con `/club`, `/club/lista-espera`, `/club/bienvenida`, `/club/entrar`, `/club/dentro`, `/club/dentro/directos` y `/club/dentro/diagnosticos/lana`.

### Comprobación del bloque 4
- Sin fecha de septiembre en el Club del repositorio (salvo los plazos del radar de verano, explicados arriba): hecho.
- «Directos» no visible: hecho (redirige y no hay enlaces).
- `/club` conserva `noindex`: hecho.
- **Alta de prueba que pasa por el autodiagnóstico: NO se puede hacer todavía.** El formulario espera la aprobación de Jose y la base de datos está en pausa hasta el 4 de enero. Lo que sí está comprobado: la plantilla del hogar con un miembro de prueba que ya tiene nivel, itinerario y prioridades muestra «Tu punto de partida», y la migración funciona contra un Postgres local.

### Pendiente del bloque 4
- Aprobar las preguntas y la regla del autodiagnóstico (y construir el formulario).
- Lección 05 (WhatsApp Business).
- Precio de la entrada fuera de plazo y creación del enlace en Stripe (prueba y real).
- Qué hacer con el PDF público de textil.
- Portada (imagen) de la lección 06 para la estantería.
- Reescribir y reprogramar los cinco correos de Brevo con las fechas de enero (fuera del repositorio).

---

## Bloque 5 · Informe de infraestructura

`docs/checklist-4-enero.md`: restaurar Supabase y aplicar las migraciones (con la decisión entre plan gratuito y Pro), Brevo, webhook de Stripe, variables de Railway por entorno y prueba completa de compra, alta, autodiagnóstico, lección y baja. No modifica nada.

---

## Lista única de pendientes para Jose

1. **Precio único** del Diagnóstico 3D para empresas, del Roadmap 3D y del Sprint 3D (y de los dos soportes mensuales del Impulso: Básico y Activo). Se cambian en `data/precios.json`.
2. **Plazo de entrega** del informe y del vídeo del Diagnóstico para talleres. Mientras falte, la página no da plazo («Recibes el informe en PDF y un vídeo…»).
3. **Testimonios:** textos aprobados de Blanca, Maika, Jorge Esteban y Esther San Vicente. En la sección «Comunidad» de la portada (tarjetas con retrato) **solo se publica Blanca**: faltan las **fotos** de Maika, Jorge y Esther. Sus tarjetas están preparadas en `views/index.ejs` y salen solas en cuanto se añada la foto.
4. **Lección 05** (WhatsApp Business).
5. ~~Preguntas y regla del autodiagnóstico~~ **Aprobado y construido (21 nov 2026)**, dentro de la web.
6. **Plan de Supabase:** gratuito (se pausa por inactividad) o Pro (desde 25 $/mes, no se pausa).
7. Enlace de pago del Diagnóstico para talleres, si se quiere compra directa (hoy va al formulario de contacto).
8. Precio de la entrada al Club para quien compra el Diagnóstico, y crear ese enlace en Stripe (prueba y real).
9. **E-WEAR pasa a ser una guía del blog (22 nov 2026).** Tras un primer cambio el 21 nov (ejemplo ilustrativo en `/casos/e-wear/`), Jose decide que deje de ser un caso: ahora es la guía «Cómo lanzar una colección de joyería con plata recuperada, paso a paso» en `/blog/joyeria-plata-recuperada/` (desde el 22 nov, artículo estático con la plantilla del blog: `public/blog/joyeria-plata-recuperada/index.html`). Sin el nombre E-WEAR, sin insignia ni avisos de «ejemplo ilustrativo», sin cifras de resultado, sin citas y sin datos estructurados de caso o reseña. Mantiene diagnosticar, diseñar, difundir y «Qué habría que medir»; botón final a `/servicios` («Ver cómo trabajamos →»). `/casos/e-wear` (con o sin barra y subrutas) redirige con 301 a la guía. Está en el sitemap, en el índice del blog (HTML estático y `blog.js`, donde se ha quitado la antigua ficha «E-WEAR… Cómo Laura transformó… Un caso real») y en las lecturas de la página de joyería como «Guía». Las páginas de gracias de los PDF ahora dicen «Volver a la guía». Texto aprobado y subido a staging el 22 nov 2026.
10. PDF público de ejemplo de textil (`/downloads/diagnosticos/ejemplo-diagnostico-textil-sostenible.pdf`): tiene detalles que podrían identificar a un taller real. Cambio preparado en la rama `fix/retirar-pdf-textil` (sale de `main`), sin fusionar, a la espera del visto bueno de Jose.
11. Confirmar qué cuenta «Personas en la comunidad» (1.070) y revisar las líneas «qué mide» de `/impacto`. El marcador sigue en `data/impacto.json`, pero la página ya no lo muestra.
12. Mantener o no la garantía del Sprint («seguimos trabajando hasta que funcione, sin coste adicional») y el descuento del Diagnóstico si después se contrata otro servicio.
13. Reescribir con fechas de enero los cinco correos de Brevo (fuera del repositorio) antes de volver a programarlos.
14. Portada de la lección 06 para la estantería del Club.
15. ~~Arquetipos «¿Te reconoces?» de Impulso 3D~~ **Resuelto (22 nov 2026):** siguen en la página, sin nombres propios y sin comillas en sus frases.

## Rediseño visual de las páginas del encargo (22 nov 2026)

Las páginas nuevas pasan a usar los componentes de Impulso 3D (`impulso-3d.css`) y de la portada (`home-v2.css`) en vez de un estilo propio. `oc-puertas.css` queda reducido a los ajustes que esos componentes no traen.

- Parciales nuevos: `oc-hero` (cabecera verde con insignia, título, subtítulo y foto), `metodo-3d` (tres pasos numerados), `oc-cta-band` (banda «Transforma tu proyecto»). `puertas` usa las tarjetas de «Forma parte de la Red»; `testimonio-blanca` usa la tarjeta de testimonio de Impulso.
- Fotos de cabecera, sin repetir: `/servicios` artesanos en taller · `/servicios/talleres` alfarero · `/servicios/empresas` taller de metal · `/impacto` nave de vellones · Diagnóstico su foto de siempre · guía de joyería la macro de plata.
- Portada: vuelve el bloque «Metodología Círculo de Valor 3D» de producción (foto del yunque, cita del fundador) con la puerta de talleres en la tarjeta grande y la de empresas en la lateral; vuelve «Comunidad» con tarjetas de retrato, solo con testimonios autorizados y sin la nota «Testimonios inspirados en experiencias reales».
- Comparada con `main`, la portada solo había perdido esos dos bloques; el resto de imágenes y secciones sigue.
- Guía de joyería: artículo estático con la plantilla de los demás artículos del blog.

## Direcciones del entorno de pruebas para revisar

Base: `https://oficioscirculares-production.up.railway.app`

- `/`: portada (presentación como red, «Metodología Círculo de Valor 3D» con las dos puertas, «Comunidad» con Blanca)
- `/servicios`, `/servicios/talleres`, `/servicios/empresas`: las dos puertas y sus precios
- `/servicios/diagnostico-3d`: Diagnóstico 3D para talleres
- `/impulso-3d`: precios únicos y testimonio de Blanca
- `/servicios/roadmap-3d` y `/servicios/sprint-3d`: precio pendiente, sin cifras sin fuente
- `/impacto`: página de impacto
- `/sobre-nosotros/`: nueva presentación y enlace a impacto
- `/faqs/`: precios desde el archivo único
- `/conecta-lana`: testimonios de Esther y Jorge
- `/oficios/joyeria-artesanal` (o cualquier oficio): puertas, sin testimonios, ejemplo «compuesto»
- `/club`: página de venta actualizada (sigue con `noindex`)
- `/club/dentro`: área de miembros (necesita Supabase restaurado para entrar)
- `/blog/joyeria-plata-recuperada/`: guía con la plantilla del blog
- `/casos/e-wear/`: debe redirigir (301) a `/blog/joyeria-plata-recuperada/`

Nada de esto está en `main` ni en `www.oficioscirculares.com`.
