# Club — Área de miembros · Puesta en marcha

Área de miembros del Club (magic link con Supabase + webhook de Stripe). Todo el
código está en `development`. Para que funcione en staging/producción hay que
poner unas variables de entorno **a mano** (nunca en el repo) y configurar dos
cosas en Supabase y Stripe. Los pasos exactos, abajo.

## 1. Variables de entorno en Railway

Añádelas en el servicio del sitio (Railway → Variables). Las mismas en staging y
en producción, cambiando solo lo que corresponda (p. ej. la URL de Supabase es la
misma; los precios y el billing portal también).

| Variable | Qué es | Dónde se saca |
|---|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase | Supabase → Project Settings → API |
| `SUPABASE_ANON_KEY` | anon/public key | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (secreta) | Supabase → Project Settings → API |
| `STRIPE_SECRET_KEY` | `sk_live_...` (o `sk_test_...` en pruebas) | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` del endpoint | Stripe → Webhooks (paso 3) |
| `BREVO_API_KEY` | API key de Brevo (lista de espera) | Brevo → SMTP & API → API Keys |
| `BREVO_WAITLIST_LIST_ID` | ID de la lista "Club — Lista de espera" | Brevo → Contactos → Listas (nº de la lista) |

Opcionales (tienen valor por defecto en el código):
| Variable | Default | Para qué |
|---|---|---|
| `STRIPE_PRICE_ANNUAL` | `price_1TwQF6DytfUJink6YjRYrrjk` | mapear checkout → plan anual |
| `STRIPE_PRICE_MONTHLY` | `price_1TwQFNDytfUJink6V8OYL1ZT` | mapear checkout → plan mensual |
| `TELEGRAM_INVITE_URL` | (vacío) | enlace al grupo en `/club/dentro` (o ponlo en `club-config.json`) |

> El sitio arranca aunque falten estas variables: el área de miembros degrada
> (login siempre da el mensaje neutro, el webhook responde 503) pero la web
> pública y la landing `/club` siguen funcionando igual.

## 2. Supabase

1. **Tabla**: ejecuta `db/club-members.sql` en el SQL Editor del proyecto. Crea
   `club_members` con RLS activada (solo el service role escribe/lee).
2. **Redirect URLs** (Authentication → URL Configuration → Redirect URLs): añade
   - `https://oficioscirculares-production.up.railway.app/auth/callback`
   - `https://www.oficioscirculares.com/auth/callback`
   Sin esto, el magic link no vuelve al sitio.
3. **Site URL**: pon `https://www.oficioscirculares.com` (o la de staging mientras pruebas).
4. **Email**: por defecto usa el email de Supabase (rate-limitado). Para volumen
   real conviene un SMTP propio (Auth → Email → SMTP), pero para la beta vale el de Supabase.
5. **Fundadores ya pagados**: antes de activar el webhook, da de alta a mano con
   el SEED comentado al final de `db/club-members.sql` (incluye su `stripe_customer_id`,
   lo ves en Stripe, para que la cancelación futura se sincronice sola).

## 3. Webhook de Stripe

1. Stripe → Developers → **Webhooks** → *Add endpoint*.
2. Endpoint URL:
   - Staging: `https://oficioscirculares-production.up.railway.app/webhooks/stripe`
   - Producción: `https://www.oficioscirculares.com/webhooks/stripe`
3. Eventos a escuchar (Select events):
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copia el **Signing secret** (`whsec_...`) → variable `STRIPE_WEBHOOK_SECRET`.
5. Prueba con el CLI: `stripe trigger checkout.session.completed` → debe aparecer
   una fila en `club_members` y en los logs de Railway `✅ [club] alta/activación`.

## 4. El flag de plazas (`club-config.json`)

`club-config.json` (en la raíz del repo) controla la landing y el hogar:

```json
{
  "plazas_abiertas": true,
  "plazas_totales": 40,
  "proximo_directo": "Miércoles 8 de octubre, 19:00 (online)",
  "telegram_invite_url": "https://t.me/…",
  "stripe_billing_portal": "https://billing.stripe.com/p/login/9AQbMF7WPe2nfccdQQ"
}
```

**Cerrar las plazas** (cambio de un minuto — el 23 de septiembre O antes si se llenan las 40):
1. Edita `club-config.json`: `"plazas_abiertas": false`.
2. Commit + push a `development` (o a `main` para producción). Railway redeploya solo.
3. La landing `/club` sustituye automáticamente los botones de compra por el
   formulario de lista de espera; los emails van a la lista propia de Brevo.

Para reabrir: `"plazas_abiertas": true` y repite.

## 5. Rutas

| Ruta | Qué hace |
|---|---|
| `GET /club` | Landing pública (test A/B intacto). Con plazas cerradas → lista de espera |
| `GET/POST /club/entrar` | Login por magic link (mensaje neutro; no revela quién es miembro) |
| `GET /auth/callback` | Cierra el magic link → sesión (cookies) |
| `GET /club/dentro` | Hogar del miembro (protegida) |
| `GET /club/dentro/lecciones/:slug` | Sirve cada pieza autenticada (barra mínima inyectada) |
| `GET /club/salir` | Cierra sesión |
| `GET/POST /club/lista-espera` | Lista de espera pública (Brevo) |
| `POST /webhooks/stripe` | Sincroniza `club_members` |

Contenido en `/club-content/` (fuera de `/public`, solo se sirve autenticado).

## 6. QA pendiente (necesita las claves puestas)

Con las env vars en staging, verificar: magic link de un miembro seed → dentro;
email desconocido → mensaje neutro; incógnito sin sesión → redirect a entrar;
`stripe trigger` → fila en Supabase; cancelación simulada → sin acceso.
