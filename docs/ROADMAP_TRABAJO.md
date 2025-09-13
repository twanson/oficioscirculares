# Roadmap de trabajo – Oficios Circulares

Este documento resume lo realizado en esta sesión y el backlog pendiente para cerrar la funcionalidad y las tres landings de servicios.

## Resumen rápido
- Micro‑tarjetas de Consultoría: reparado el hover, posicionadas como overlay y animación sin retraso del texto.
- Landings implementadas: Diagnóstico 3D, Roadmap 3D y Sprint 3D con HERO split, SEO/OG, JSON‑LD, UTM passthrough y tracking GA4.
- Placeholders de imagen creados y estilos coherentes añadidos.

---

## Cambios realizados

### 1) Micro‑tarjetas (sección “Consultoría Estratégica” en home)
- Ajuste de estructura CSS para mostrar micro‑tarjetas como overlay centrado dentro de `.services .container`.
- Posicionamiento dinámico vía JS con `getBoundingClientRect()` y variable CSS `--micro-top`.
- Eliminado el “lag” del texto en el primer hover: el contenedor permanece renderizado con `opacity:0` y se muestra ocultando/mostrando por clase `.is-open` (sin `display:none`), pre‑calentando layout con `offsetHeight`.
- Animación suave solo a nivel de contenedor (fade/slide opcional), evitando afectar la opacidad del texto.
- Archivos clave:
  - `public/assets/css/styles.css` (bloque MICRO‑TARJETAS + estilos overlay)
  - `views/index.ejs` (cálculo de posición, control `.is-open`, GA4 ya existente)

### 2) Landing – Diagnóstico 3D (`/servicios/diagnostico-3d`)
- Estructura semántica completa con secciones: `encaje`, `entregable`, `flujo` (CTA inline), `ejemplo`, `precio`, `faq`, `cta-final`.
- HERO split: texto izq., imagen der.; móvil con imagen debajo.
- CTAs con UTM passthrough y GA4 `click_cta` (`cta_offer: diagnostico-3d`).
- SEO/OG y JSON‑LD `Service` incluidos.
- Estilos coherentes (verdes/ocres, `rounded-2xl`, sombras suaves).
- Archivos:
  - `views/diagnostico-3d.ejs`
  - `public/img/servicios/diagnostico-3d-hero.svg` (placeholder)
  - `views/partials/head-meta.ejs` (permite `ogImage` y `ogImageAlt`)

### 3) Landing – Roadmap 3D (`/servicios/roadmap-3d`)
- Secciones: `encaje`, `incluye` (Semana 1/2 + CTA), `entregables`, `ejemplo` (CTA), `precio`, `faq`, `cta-final`.
- HERO split + CTAs con UTM/GA4 (`cta_offer: roadmap-3d`).
- SEO/OG y JSON‑LD `Service`.
- Archivos:
  - `views/roadmap-3d.ejs`
  - `public/img/servicios/roadmap-3d-hero.svg` (placeholder)

### 4) Landing – Sprint 3D (`/servicios/sprint-3d`)
- Secciones: `encaje`, `incluye` (Semanas 1–4 + CTA), `entregables`, `kpis` (2 columnas), `mini-caso` (CTA), `precio`, `faq`, `cta-final`.
- HERO split + CTAs con UTM/GA4 (`cta_offer: sprint-3d`).
- SEO/OG y JSON‑LD `Service`.
- Archivos:
  - `views/sprint-3d.ejs`
  - `public/img/servicios/sprint-3d-hero.svg` (placeholder)

### 5) Estilos comunes y accesibilidad
- Estilos para HERO split, grids de secciones y tarjetas en `public/assets/css/styles.css`.
- Añadido foco visible para `.btn:focus-visible` (anillo verde sutil).

---

## Pendientes críticos (para lanzar)
- [ ] Sustituir placeholders por imágenes WebP optimizadas (1600×900 aprox.):
  - [ ] `public/img/servicios/diagnostico-3d-hero.webp`
  - [ ] `public/img/servicios/roadmap-3d-hero.webp`
  - [ ] `public/img/servicios/sprint-3d-hero.webp`
- [ ] Confirmar y actualizar URLs definitivas de CTAs:
  - [ ] Formularios (Tally/Calendly) para cada landing
  - [ ] PDF/URL de “ejemplo de entregable” (Roadmap)
  - [ ] PDF/URL de “mini‑caso” (Sprint)
- [ ] Generar versión social 1200×630 de las imágenes para OG (puede reutilizarse el mismo asset si mantiene relación y peso adecuado).
- [ ] Verificar que `dataLayer` está disponible en todas las páginas (GTM ya está cargado en `head-meta`).

---

## Pendientes de mejora (nice‑to‑have)
- [ ] Animación “solo fondo” para micro‑tarjetas (opcional) con pseudo‑elemento para que el texto no cambie de opacidad.
- [ ] Afinar timing/curva de la transición de micro‑tarjetas (actualmente ~160ms ease).
- [ ] Añadir breadcrumbs o micro‑nav entre los tres servicios.
- [ ] Añadir “related CTAs” al final de cada landing para cross‑linking (Diagnóstico → Roadmap → Sprint).
- [ ] Revisión de copy/tono en botones secundarios según conversión.

---

## QA y rendimiento sugeridos
- [ ] Lighthouse: accesibilidad sin errores críticos; verificar contraste.
- [ ] CLS: comprobar que las imágenes del hero no provocan saltos (los contenedores ya definen tamaño; al sustituir WebP, mantener proporción).
- [ ] Peso de imágenes: < 200–250 KB por hero si es posible, con compresión adecuada.
- [ ] Validar OG/JSON‑LD con herramientas de depuración (Twitter/FB debugger; Rich Results Test).

---

## Referencias de archivos
- Home (micro‑tarjetas):
  - `views/index.ejs`
  - `public/assets/css/styles.css`
- Landings:
  - `views/diagnostico-3d.ejs`
  - `views/roadmap-3d.ejs`
  - `views/sprint-3d.ejs`
- Meta y assets:
  - `views/partials/head-meta.ejs`
  - `public/img/servicios/*.svg` (placeholders)

## Notas
- El proyecto actual es Express + EJS + CSS propio (no Next/Tailwind). La implementación se ha adaptado fielmente manteniendo los requisitos funcionales (HERO split, UTMs, GA4, SEO/OG, JSON‑LD) y la estética vigente.

