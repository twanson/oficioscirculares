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
