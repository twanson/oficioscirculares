# Checklist del 4 de enero de 2027 · Volver a poner el Club en marcha

Informe de infraestructura, escrito el 21 de noviembre de 2026. **Este documento no cambia nada**: son los pasos, en orden, para el día de la vuelta. La apertura de plazas está prevista del 18 al 27 de enero (`club_apertura` / `club_cierre`).

---

## 1. Restaurar Supabase y aplicar las migraciones

1. Supabase → proyecto `club-oficios-circulares` (ref `yhpijtnhggrfpbnovzfv`) → **Restore project**. Está en pausa desde el 8 de septiembre de 2026. Se puede restaurar durante un año sin perder datos.
2. Cuando esté activo, en el SQL Editor y en este orden:
   1. `db/club-members.sql` (idempotente: no rompe lo que ya hay).
   2. `db/migrations/20270104_club_novedades.sql` (nivel, itinerario, prioridades, oficio y votación).
3. Comprobar en Table Editor que `club_members` tiene las columnas nuevas y que existe `club_votos` con RLS activada.
4. Comprobar que la fila de trabajo de Jose (`founder_number` = 2) sigue ahí, y decidir la numeración de los fundadores reales (empezar en el 3 o renumerar la de Jose).

### Decisión de Jose: ¿plan gratuito o de pago?

- **Plan gratuito:** un proyecto se pausa si recibe muy poca actividad durante una semana. Supabase avisa por correo una semana antes de pausarlo y otra vez cuando lo pausa. Dice que unas pocas peticiones al día suelen bastar para mantenerlo activo, pero no lo garantiza. Nuestra experiencia: el proyecto se pausó el 8 de septiembre aunque el cron del VPS lo consultaba cada dos días, y el cron siguió fallando seis semanas sin que nadie se enterase.
- **Plan Pro:** desde 25 $ al mes. Incluye 10 $ de crédito de cómputo, que cubren un proyecto en la instancia Micro, y 8 GB de disco por proyecto. Los proyectos de pago **no se pausan nunca por inactividad**. Se paga por organización, así que conviene revisar si `laboralbox-portal` está en la misma organización (contaría como segundo proyecto).
- Recomendación: Pro al menos de enero a marzo (apertura y primeras semanas). Si se queda en el gratuito, hace falta una vigilancia que **avise cuando falla**, no solo un cron.

Fuentes: [Precios de Supabase](https://supabase.com/pricing) · [Pausa de proyectos gratuitos](https://supabase.com/docs/guides/platform/free-project-pausing) · [FAQ de pausa por inactividad](https://supabase.com/kb/faqs/platform/free-project-pausing). Consultadas el 21 de noviembre de 2026; volver a mirar el precio el día 4.

## 2. Brevo: clave de envío y correos transaccionales

1. Brevo → SMTP y API → comprobar que la clave SMTP **`club-oc-supabase`** sigue activa (lleva sin usarse desde el 8 de septiembre y Brevo caduca las que no se usan). Si ha caducado, crear una nueva y ponerla **a la vez** en Supabase (Authentication → SMTP Settings) y en el `.env` local.
2. Crear una clave API nueva para la lista de espera (la `club-oc-railway` se dejó caducar) y ponerla en `BREVO_API_KEY` en Railway (los dos entornos).
3. Prueba: pedir un enlace mágico en `/club/entrar` con el correo de Jose y comprobar que llega a la bandeja de entrada, con remitente `hola@oficioscirculares.com`, y que el enlace lleva a `/club/dentro`.
4. Prueba de la lista de espera: con `plazas_abiertas: false` en staging, apuntar un correo de prueba y comprobar que entra en la lista #14. Borrarlo después.
5. Las campañas E1-E5 siguen suspendidas y conservan el `scheduledAt` de septiembre. Antes de volver a programarlas hay que reescribir las fechas del texto (lista en `docs/encargo-nov-2026.md`, apartado 4.5) y cambiar la hora de envío.

## 3. Stripe: webhook y compra de prueba

1. Stripe → Desarrolladores → Webhooks:
   - `club-oc-staging` → `https://oficioscirculares-production.up.railway.app/webhooks/stripe`
   - `club-oc-produccion` → `https://www.oficioscirculares.com/webhooks/stripe` (estaba **deshabilitado** a propósito; habilitarlo solo al pasar a producción).
   - Eventos: `checkout.session.completed`, `customer.subscription.updated` y `customer.subscription.deleted`.
2. Comprobar que el secreto de firma de cada uno coincide con `STRIPE_WEBHOOK_SECRET` en su entorno de Railway.
3. Comprobar que los enlaces de pago redirigen a `/club/bienvenida` del entorno correcto (en producción, a `www`).
4. Compra de prueba en staging (modo de prueba o la compra mínima real con reembolso, como el 11 de agosto): la fila aparece en `club_members` en segundos y los registros de Railway muestran `✅ [club] alta/activación`.
5. Crear el enlace privado de entrada fuera de plazo si Jose ya decidió el precio (`docs/club-entrada-fuera-de-plazo.md`).

## 4. Variables de entorno en Railway

| Variable | Staging (`development`) | Producción (`main`) | Notas |
|---|---|---|---|
| `APP_URL` | `https://oficioscirculares-production.up.railway.app` | `https://www.oficioscirculares.com` | Sin barra final |
| `NODE_ENV` | `production` | `production` | Fuerza HTTPS |
| `SUPABASE_URL` | la del proyecto | la misma | |
| `SUPABASE_ANON_KEY` | la del proyecto | la misma | |
| `SUPABASE_SERVICE_ROLE_KEY` | la del proyecto | la misma | Secreta |
| `STRIPE_SECRET_KEY` | `sk_test_…` o `sk_live_…` | `sk_live_…` | |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` de `club-oc-staging` | `whsec_…` de `club-oc-produccion` | Distinto en cada entorno |
| `STRIPE_PRICE_ANNUAL` / `STRIPE_PRICE_MONTHLY` | opcional | opcional | Tienen valor por defecto (los precios de fundador) |
| `BREVO_API_KEY` | clave nueva | clave nueva | La de agosto ya no vale |
| `BREVO_WAITLIST_LIST_ID` | `14` | `14` | |
| `TELEGRAM_INVITE_URL` | enlace del grupo | enlace del grupo | O en `club-config.json` |
| `CLUB_APERTURA` | opcional | opcional | Por defecto `2027-01-18` (`club-config.json`) |
| `CLUB_CIERRE` | opcional | opcional | Por defecto `2027-01-27T23:59:00+01:00` |
| `CLUB_ABIERTO` | `true` para probar | `false` hasta el día de apertura | Aviso de entrada al Club en el Diagnóstico |
| `DIRECTOS_VISIBLE` | `false` | `false` | Hasta tener tres invitados con fecha |
| `GOOGLE_SERVICE_ACCOUNT_JSON`, `SPREADSHEET_ID`, `SHEET_NAME`, `DIRECTORIO_*`, `CONECTA_LANA_*` | sin cambios | sin cambios | Web pública, no del Club |
| `MAILCHIMP_*`, `REISSUE_*` | sin cambios | sin cambios | Web pública, no del Club |

Supabase (Authentication → URL Configuration): las dos direcciones `…/auth/callback` siguen en las Redirect URLs.

## 5. Prueba completa en staging

Con un correo de prueba que no sea el de Jose:

1. **Compra:** enlace de pago mensual → pago → llega a `/club/bienvenida`.
2. **Alta:** la fila aparece en `club_members` con `status = active`, `plan = monthly` y su `stripe_customer_id`.
3. **Acceso:** `/club/entrar` → llega el correo → el enlace lleva a `/club/dentro`.
4. **Autodiagnóstico** (aprobado y construido el 21 nov): el primer acceso pasa por `/club/dentro/empezar` y el hogar muestra «Tu punto de partida» con nivel y tres prioridades. Comprobar en Supabase `nivel`, `itinerario` y `prioridades`.
5. **Lección:** abrir una lección, comprobar el bloque «Diagnóstico de ejemplo» en «En tu oficio» y abrir un PDF.
6. **Votación:** votar y comprobar que un segundo voto se rechaza.
7. **Baja:** cancelar la suscripción desde el portal de Stripe → el webhook pone `status = canceled` → `/club/dentro` deja de dar acceso.
8. **Limpieza:** borrar la fila de prueba de `club_members` (sus votos se borran solos) y reembolsar si fue un pago real.

Después: revisar que `/club` y todo `/club/…` siguen con `noindex` hasta que Jose decida quitarlo, y no pasar nada a `main` sin su visto bueno.
