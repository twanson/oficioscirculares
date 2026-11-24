# Club · Entrada fuera de plazo para quien compra un Diagnóstico

Quien compra el Diagnóstico 3D para talleres puede entrar en el Club aunque las plazas estén cerradas. Para eso hace falta un enlace de pago **privado**: no se publica en ninguna página. Solo se envía a mano a quien ha comprado el Diagnóstico.

## Estado (21 de noviembre de 2026)

**El enlace de prueba NO está creado.** En este equipo no hay clave de Stripe (`STRIPE_SECRET_KEY` no está en el `.env`) ni acceso a Stripe desde las herramientas de esta sesión. No se ha tocado nada en Stripe, ni en modo de prueba ni en real. Los dos enlaces de pago en uso (anual y mensual de fundador, en `views/club.ejs`) siguen igual.

## Cómo crear el enlace en modo de prueba (5 minutos)

1. Stripe → activa **Modo de prueba** (interruptor arriba a la derecha).
2. **Catálogo de productos** → crea el producto «Club de Oficios Circulares · entrada con Diagnóstico» con dos precios recurrentes:
   - Mensual: fundador (12 €) mientras queden plazas de las 40; después, normal (15 €).
   - Anual: fundador (120 €) mientras queden plazas; después, normal (150 €).
3. **Enlaces de pago** → nuevo enlace con ese precio:
   - Después del pago: redirigir a `https://oficioscirculares-production.up.railway.app/club/bienvenida`.
   - Recoger el correo del cliente (por defecto).
   - Opcional: limitar el número de pagos si se quiere controlar cuántos entran así.
4. Copia el ID del precio (`price_…`) y añádelo a la variable de entorno de staging (ver abajo), para que el webhook sepa qué plan es.
5. Prueba con la tarjeta de pruebas de Stripe `4242 4242 4242 4242` y comprueba que aparece la fila en `club_members` (requiere Supabase restaurado).

## Qué hay que tocar en el código cuando exista el precio

El webhook (`lib/stripeClub.js`) solo reconoce dos precios (`STRIPE_PRICE_ANNUAL` y `STRIPE_PRICE_MONTHLY`). Con un precio nuevo, el alta funciona igual pero el campo `plan` quedaría vacío. Hay dos opciones:
- **Reutilizar los precios de fundador** en el enlace privado (lo más sencillo: no hay que tocar código).
- O añadir `STRIPE_PRICE_DIAG_ANNUAL` y `STRIPE_PRICE_DIAG_MONTHLY` al mapa `PRICE_TO_PLAN`. Es un cambio de dos líneas que se puede hacer con el precio ya creado.

## El equivalente real (producción)

1. Mismos pasos con el **modo de prueba apagado**.
2. Redirección a `https://www.oficioscirculares.com/club/bienvenida`.
3. Añadir el ID del precio a las variables de entorno de producción en Railway.
4. Guardar el enlace en un sitio privado (no en el repositorio público ni en la web) y enviarlo a mano con la entrega del Diagnóstico.
5. Hacer una compra real de 1 € o la mínima posible, comprobar el alta y reembolsarla, como se hizo el 11 de agosto.

## Decisiones de Jose
- ~~Con qué precio entra quien viene del Diagnóstico~~ **Cerrado (24 nov 2026):** precio de fundador (12 € o 120 €) mientras queden plazas de las 40; después, precio normal (15 € o 150 €). Al agotarse las plazas hay que cambiar el enlace que se envía.
- Si se limita el número de entradas por este camino.
