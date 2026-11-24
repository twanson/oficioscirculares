# Publicar `development` en `main`: lista de comprobación (24 nov 2026)

**Nada está fusionado.** `development` lleva unos 100 commits que no están en `main` y cambia unos 340 archivos (incluidos documentos y capturas).

## 0. Bloqueos: resolver antes de publicar

- [x] **Resuelto (24 nov): plazas cerradas y sin enlaces de pago; la lista de espera falla con un error visible si Brevo no guarda el alta. Falta una clave de Brevo válida (hoy responde 401 «API Key is not enabled»).** Antes: **El Club se podía comprar.** `/club` va con `noindex`, pero el menú, el pie y las páginas de servicios enlazan a él. `club-config.json` tiene `plazas_abiertas: true` y la página lleva dos enlaces de pago de Stripe. La apertura es del 18 al 27 de enero y Supabase está en pausa: quien pague hoy no podría entrar. Opciones:
  - poner `plazas_abiertas: false`: los botones pasan a lista de espera, que necesita `BREVO_API_KEY`; sin ella el correo no se guarda y la página responde igual que si sí;
  - o quitar `/club` del menú, el pie y los servicios hasta enero.
- [x] **Resuelto (24 nov): rama local `release/nov-2026`, desde `main` (`5c3a921`) con `development` fusionada; 21 pruebas pasan. Falta probarla en un entorno y volver a fusionar lo que cambie después.** Antes: **la fusión directa tenía 28 conflictos (30 al prepararla).** La base común es del 14 de julio y muchos cambios de `main` se llevaron a `development` a mano. Hay que hacerla en una rama aparte, resolver archivo por archivo y probarla en staging antes de tocar `main`.
  - Vistas: `index`, `oficio-vertical`, `diagnostico-3d`, `impulso-3d`, `roadmap-3d`, `sprint-3d`, `conecta-lana`, `viaje-lana`, `partials/header`, `partials/head-meta`.
  - Blog: `blog/index`, `blog.js` y los artículos de lana (aislamiento), incendios, corcho y trabajar por encargo.
  - Otros: `server.js`, `styles.css`, `sitemap.xml`, `oficios-seo.json`, `oficios-verticales.json`, `dir/index`, `plantillas/index`, tres PDF (corcho, relevo y lana frente a sintéticos) y la página `/casos/e-wear` (borrada en `development`).
  - PDF de ejemplo de textil: en las dos ramas queda **retirado** (en `development` seguía; se ha quitado el 24 nov).
- [ ] **No perder lo que solo está en `main`:** `.github/workflows/sitemap.yml` y `oficios/hilandia-escarmenando.jpg` (la usa la newsletter). `brand/og-default.png` se conserva en la rama: ninguna página la usa ya, pero enlaces compartidos antiguos pueden apuntar a ella.
- [ ] **Compra del Diagnóstico:** decidir si el botón sigue yendo al formulario de contacto (hoy va ahí).
- [ ] **Decisión pendiente:** garantía del Sprint («seguimos trabajando hasta que funcione») y plazo del Diagnóstico para empresas.
- [ ] **Ramas abiertas:** `fix/pdf-segunda-linea` (dos PDF, en local). Si se publica `development`, ya no hace falta.

## 1. Qué cambia

- Menú, cabecera y pie comunes; menú «Servicios» en dos puertas (talleres y empresas).
- Portada: presentación como red, dos puertas, Comunidad con testimonios, fotos adaptadas.
- Diagnóstico, Roadmap, Sprint, Impulso: rediseño completo. Fuera precios orientativos, cifras sin fuente y testimonios inventados.
- Precios desde `data/precios.json`, testimonios desde `data/testimonios.json`, cifras desde `data/impacto.json`.
- 37 PDF de descargas con el logo de 2026, los ejemplos de Sprint y Roadmap corregidos y la guía corta de materiales sin distintivos.
- Oficios: sin testimonios y con ejemplos presentados como compuestos.
- Consola: corregido el error del carrusel que hoy sale en producción, y el de `/blog/` y `/sobre-nosotros/`.
- Dependencias nuevas: `@supabase/ssr`, `@supabase/supabase-js`, `cookie-parser`, `stripe`.

## 2. Páginas

| Nuevas | Estado |
|---|---|
| `/servicios`, `/servicios/talleres`, `/servicios/empresas` | Públicas, en el sitemap |
| `/impacto` | Pública, en el sitemap |
| `/blog/joyeria-plata-recuperada/` | Pública, en el sitemap |
| `/club`, `/club/lista-espera`, `/club/entrar`, `/club/bienvenida`, `/club/dentro` y subrutas, `/auth/callback` | `noindex` |
| `POST /webhooks/stripe` | Responde 503 si falta la configuración |

| Eliminadas o cambiadas | Qué pasa |
|---|---|
| `/casos/e-wear/` | 301 a `/blog/joyeria-plata-recuperada/` |
| PDF de ejemplo de textil | 404 (también en producción) |
| `#soporte` en `/impulso-3d` | La sección desaparece; el ancla ya no existe |
| `impulso-3d.css` y fotos retiradas | 404, sin uso en la web |

## 3. Redirecciones

- [ ] Nueva: `/casos/e-wear`, `/casos/e-wear/` y cualquier subruta → 301 a la guía. Comprobada en staging.
- [ ] Siguen: `/diagnostico-3d`, `/roadmap-3d` y `/sprint-3d` → `/servicios/…`.
- [ ] Siguen las demás 301 de `main` (PDF antiguos, barras finales): probar cinco al azar tras publicar.

## 4. Variables de entorno en producción

Nombres mirados en Railway el 24 nov (sin valores): producción ya tiene `APP_URL`, `BREVO_API_KEY`, `BREVO_WAITLIST_LIST_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y las tres de Supabase. No tiene `CLUB_ABIERTO` ni `DIRECTOS_VISIBLE`, y no hacen falta: valen `false` por defecto. Para la web pública **no hace falta ninguna nueva**: las actuales (`GOOGLE_SERVICE_ACCOUNT_JSON`, `SPREADSHEET_ID`, `SHEET_NAME`, `DIRECTORIO_*`, `CONECTA_LANA_*`, `MAILCHIMP_*`, `REISSUE_*`, `NODE_ENV`) deben seguir igual.

| Variable nueva | Al publicar | En enero |
|---|---|---|
| `CLUB_ABIERTO` | `false` o sin poner | `true` el día de apertura |
| `DIRECTOS_VISIBLE` | `false` o sin poner | `true` con tres invitados con fecha |
| `APP_URL` | `https://www.oficioscirculares.com` (recomendada) | igual |
| `BREVO_API_KEY`, `BREVO_WAITLIST_LIST_ID=14` | Solo si se abre la lista de espera | sí |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | no | sí |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | no; el webhook de producción sigue desactivado | sí |
| `STRIPE_PRICE_*`, `CLUB_APERTURA`, `CLUB_CIERRE`, `TELEGRAM_INVITE_URL` | no | según la checklist del 4 de enero |

- [ ] Comprobar que `CLUB_ABIERTO` y `DIRECTOS_VISIBLE` no están a `true` en producción: la variable manda sobre `club-config.json`.

## 5. Qué queda oculto

| Qué | Cómo se oculta | ¿Se puede llegar? |
|---|---|---|
| Club | `noindex` en la vista y cabecera `X-Robots-Tag` en `/club…`; fuera del sitemap | **Sí**: menú, pie, portada de servicios y enlace directo (ver bloqueo) |
| Área de miembros | Pide sesión de Supabase; sin Supabase redirige a `/club/entrar` | No |
| Bloque del Club en el Diagnóstico | `CLUB_ABIERTO=false` | No |
| Directos con artesanos | `DIRECTOS_VISIBLE=false` (la página redirige al área de miembros) | No |
| Precio del Club para quien compra el Diagnóstico | Solo en el bloque anterior; el enlace de pago no está creado | No |

## 6. Antes de fusionar

- [ ] Rama de integración desde `main`, fusión de `development`, conflictos resueltos, `npm ci` y `npm test` (21 pruebas).
- [ ] Anotar el commit de `main` para volver atrás (hoy `5c3a921`).
- [ ] Repaso en staging: menú con ratón, teclado y móvil; consola; formularios de contacto y Tally; una descarga por tipo.
- [ ] Buscar `[PENDIENTE`, `{{precio` y `oficioscirculares-production` en el HTML servido: cero resultados.
- [ ] GTM sin cambios (`GTM-W7CH52J6`); comprobar que llegan `generate_lead`, `file_download` y `click_cta`.

## 7. Después de publicar

- [ ] Páginas públicas en 200, redirecciones en 301 y archivos retirados en 404.
- [ ] `/club`: `noindex` y sin pago posible, según lo decidido.
- [ ] Precios: Diagnóstico talleres 90 €, empresas 190 €, Impulso 495 € y 895 €, todos + IVA.
- [ ] Comunidad: nueve mensajes con nombre y uno sin nombre, con la nota nueva.
- [ ] Reenviar el sitemap en Search Console y vigilar los registros de Railway una hora.
- [ ] Lighthouse en móvil: `/`, `/servicios`, `/servicios/diagnostico-3d`, `/impulso-3d`.

## 8. Comprobación automática y vuelta atrás

Rama: `release/nov-2026`. `main` anterior a publicar: **`9161c33`**. Volver a mirarlo justo antes de fusionar: el robot del sitemap puede haber añadido un commit los lunes.

Tras fusionar y subir `main`:

```bash
node scripts/comprobar-publicacion.mjs https://www.oficioscirculares.com --esperar --alta prueba-lista-espera-www-AAAAMMDD@example.com
```

Comprueba páginas, Club (plazas cerradas, sin enlaces de pago, `noindex`), `/casos/e-wear`, archivos retirados, sitemap, consola y menú (ratón, teclado y móvil), y hace **un** alta de prueba. Marca la visita como interna. La confirmación del alta es la respuesta de Brevo: mirar además el contacto en la lista 14 y borrarlo.

Si algo falla, no se toca nada sin decisión de Jose. Dos maneras de volver:

1. **Railway, la más rápida:** servicio de producción → Deployments → despliegue de `9161c33` → Redeploy. No cambia Git; el siguiente push a `main` volvería a publicar la versión nueva.
2. **Git, la definitiva:** `git revert -m 1 <commit de la fusión>` sobre `main` y push. No reescribe el historial; `main` queda con los archivos de `9161c33`. Para volver a publicar después habrá que revertir ese revert.

No se usa `push --force`.
