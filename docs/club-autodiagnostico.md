# Club · Autodiagnóstico en el alta (propuesta)

**Estado: PROPUESTA, pendiente de la aprobación de Jose. El formulario NO está construido.**

Lo que ya está hecho y no depende de las preguntas:
- Migración `db/migrations/20270104_club_novedades.sql`: columnas `nivel`, `itinerario`, `prioridades`, `oficio`, `autodiagnostico_respuestas` y `autodiagnostico_at` en `club_members`.
- `lib/clubMembers.js → saveAutodiagnostico()` guarda el resultado.
- La página de inicio del área (`/club/dentro`) ya muestra «Tu punto de partida»: el nivel, las tres prioridades, el siguiente paso y el itinerario, en cuanto el miembro tiene `nivel` guardado.
- El oficio guardado destaca el diagnóstico de ejemplo de su oficio en las lecciones.

## Dónde hacerlo: dentro de la web, no en Tally

**Recomendación: dentro de la propia web.** El resultado se guarda en `club_members` en el mismo paso y el miembro ve su página de inicio al momento, sin webhook ni n8n entre medias que puedan fallar el día de la apertura.

Flujo propuesto: pago en Stripe → `/club/bienvenida` → primer acceso por enlace mágico → si `autodiagnostico_at` está vacío, el servidor lleva a `/club/dentro/empezar` (el formulario) → al enviarlo, se calcula el resultado, se guarda y se entra a `/club/dentro`. Así el autodiagnóstico queda «después del pago y antes de entrar por primera vez», como pide el encargo. Si alguien lo cierra a medias, se le vuelve a mostrar en el siguiente acceso.

## Las preguntas (9 + 1 opcional)

Todas de opción única salvo la 2. Se responden en 3 o 4 minutos.

| # | Pregunta | Respuestas | Para qué sirve |
|---|---|---|---|
| 1 | ¿Cuál es tu oficio? | Alimentación · Barro y alfarería · Cerámica · Cestería y fibras vegetales · Construcción tradicional · Cosmética natural · Cuero · Encuadernación · Forja y herrería · Joyería · Lana y costura · Madera · Restauración y upcycling · Textil · Turismo rural · Vidrio · Otro | Guarda `oficio` (diagnóstico de ejemplo y chat por oficios). No puntúa |
| 2 | ¿Dónde vendes hoy? (puedes marcar varias) | Ferias y mercados · Tienda o taller abierto al público · Por encargo, boca a boca · Instagram u otras redes · Tienda online propia · Etsy u otro marketplace · Tiendas de otros | Contexto para Jose y para los directos. No puntúa |
| 3 | ¿Con qué frecuencia publicas en redes? | Nunca o casi nunca (0) · Cuando me acuerdo (1) · Una vez por semana (2) · Dos o más por semana (3) | Constancia |
| 4 | ¿Qué parte de tus ventas te llega por internet? | Casi nada (0) · Menos de una cuarta parte (1) · Entre una cuarta parte y la mitad (2) · Más de la mitad (3) | Venta online |
| 5 | ¿Cómo son hoy las fotos de tus piezas? | No tengo fotos buenas (0) · Con el móvil, sin método (1) · Cuidadas: luz, fondo y detalle (2) | Foto |
| 6 | ¿Cómo pones el precio? | A ojo o lo que paga la gente (0) · Sumo el material y algo más (1) · Con un cálculo de material, horas, gastos y margen (2) | Precio |
| 7 | Tu perfil de Instagram… | No tengo o no lo uso (0) · Lo tengo, pero la bio está sin cuidar (1) · Bio clara, enlace y destacados (2) | Bio |
| 8 | ¿Qué te frena más ahora mismo? | No sé qué publicar · No tengo tiempo · Me regatean o vendo barato · Me ven pero no me compran · Dependo demasiado de las ferias | Primera prioridad |
| 9 | ¿Cuánto tiempo puedes dedicarle a la semana? | Menos de una hora · Entre una y dos horas · Más de dos horas | Ajusta el tamaño de las prioridades. No puntúa |
| 10 | (Opcional, texto libre) ¿Qué te gustaría haber conseguido dentro de tres meses? | — | Para Jose y para el directo. No puntúa |

## La regla de asignación

### Nivel
Suma de las preguntas 3, 4, 5, 6 y 7: de 0 a 12 puntos.

| Puntos | Nivel |
|---|---|
| 0 a 4 | **empieza** |
| 5 a 8 | **publica** |
| 9 a 12 | **vende** |

Excepción: si en la pregunta 4 responde «Entre una cuarta parte y la mitad» o «Más de la mitad», el nivel es **vende** aunque sume menos. Ya vende por internet y lo que necesita es tiempo y sistema.

### Itinerario (orden de las lecciones)
Sale de los tres perfiles que ya están en el mapa del contenido:

| Nivel | Itinerario |
|---|---|
| empieza | Guía de la primera victoria → Lección 04 (bio) → Lección 01 (foto) → Lección 02 (reel) → Lección 03 (precios) → Lección 06 (ferias) → Reto nº 1 |
| publica | Guía → Lección 03 (precios) → Lección 04 (bio) → Biblioteca de plantillas → Reto nº 1 → Lección 01 → Lección 02 → Lección 06 |
| vende | Guía → Biblioteca de plantillas → Lección 02 (grabar en lote) → Radar de ayudas → Lección 03 → Lección 06 |

### Tres prioridades para el primer mes
1. **La primera sale de la pregunta 8:**

| Respuesta | Prioridad 1 |
|---|---|
| No sé qué publicar | Graba tu primer reel del proceso con uno de los tres guiones de la biblioteca (lección 02) |
| No tengo tiempo | Prepara un mes de publicaciones en dos tardes con el calendario de la biblioteca |
| Me regatean o vendo barato | Recalcula el precio de tus tres piezas más vendidas con la calculadora de la lección 03 |
| Me ven pero no me compran | Pasa la prueba de los cinco segundos a tu perfil: nombre, bio y enlace (lección 04) |
| Dependo demasiado de las ferias | Elige tus ferias del año con la calculadora de la lección 06 y mira las ayudas en el radar |

2. **La segunda y la tercera** salen de las dos áreas con menos puntos (fotos, precio, bio, constancia), sin repetir la primera. En caso de empate, el orden es: precio, fotos, bio, constancia.

| Área floja | Prioridad |
|---|---|
| Fotos (pregunta 5 = 0 o 1) | Haz las tres fotos de una pieza con la lección 01 |
| Precio (pregunta 6 = 0 o 1) | Calcula el precio de una pieza con la calculadora de la lección 03 |
| Bio (pregunta 7 = 0 o 1) | Reescribe tu bio y tu campo nombre con la lección 04 |
| Constancia (pregunta 3 = 0 o 1) | Publica dos veces por semana durante cuatro semanas con el calendario de la biblioteca |

Si no hay dos áreas flojas, se completan según el nivel: empieza → «Termina la guía de la primera victoria»; publica → «Apúntate al reto nº 1»; vende → «Revisa el radar de ayudas de tu comunidad».

Si en la pregunta 9 responde «Menos de una hora», las prioridades se quedan en tres pero se muestran con la versión corta (una pieza, una foto, una publicación).

## Lo que necesito de Jose
- Aprobar o cambiar las preguntas y la regla.
- Confirmar que se hace dentro de la web, no en Tally.

Con la aprobación, construirlo lleva una sesión: el formulario en `/club/dentro/empezar`, el cálculo en `lib/clubAutodiagnostico.js` con pruebas y la redirección en el primer acceso.
