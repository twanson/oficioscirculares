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
| `views/club.ejs` | Tarjetas de Maika (sin permiso) y de Jorge Esteban | Solo Blanca. Jorge queda únicamente en Conecta Lana |
| `views/diagnostico-3d.ejs` | Cita anónima «Taller de diseño textil, Madrid» | Eliminada |
| `views/roadmap-3d.ejs` | Cita anónima «Taller de carpintería, Barcelona» | Eliminada |
| `views/conecta-lana.ejs` | Cita de Maika comentada en el HTML (visible en el código fuente) | Eliminada. Quedan Esther San Vicente (Al Fresco-Museos Efímeros) y Jorge Esteban (enlace a fenoquimica.es) |

Testimonio de Blanca: nuevo parcial `views/partials/testimonio-blanca.ejs`, con el texto aprobado el 16 de julio de 2026 (el que ya estaba en `/club`). Aparece en `/club`, `/impulso-3d` y `/servicios/talleres`.

Se borran las fotos provisionales `public/assets/images/club/avatar-maika.jpg` y `avatar-jorge.jpg`, que ya no usa nadie.

### 1.2 Precios

- Archivo único: `data/precios.json`, leído por `lib/precios.js`. Las plantillas EJS usan `precios.texto('clave')`, `precios.html('clave')` o `precios.num('clave')`, disponibles en todas las vistas (`app.locals.precios`).
- Las páginas estáticas (FAQ, blog) usan marcas `{{precio:clave}}` o `{{precio-html:clave}}`. Un middleware de `server.js` las sustituye al servir la página.
- Un importe `null` se muestra como `[PENDIENTE JOSE: precio único]`, con estilo ámbar y borde discontinuo (`.precio-pendiente`).
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
