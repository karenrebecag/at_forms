# Changelog

> Nota: el CI hace solo bump de patch en cada push a `main` con cambios en `src/**`.
> Cambios solo de docs (`CLAUDE.md`, `CHANGELOG.md`) no disparan release ni tag.

## Próximos pasos (next steps)

- **Afinar el design system**: definir los tokens de marca ATFX (color, tipografía Mulish, radios,
  spacing) para light y dark. Hoy el DS es neutro de arranque; falta igualar la marca.
- **Usar GSAP más allá del reveal**: micro-interacciones (error shake, foco, hover del botón,
  transición form -> thank-you). GSAP ya está como dep y bundleado.
- **Validar utm_*__c reales** con un email no-test controlado (va a ventas; coordinar y limpiar).
- **Confirmar dónde caen los campos de webinar** (topic/date/zoom) — probablemente Campaign record.
- **Tamaño del bundle**: GSAP subió `forms.js` a ~150kb. Si pesa, considerar import selectivo de
  GSAP (core) o cargarlo aparte. Evaluar tras definir qué animaciones se usan.
- **Más formularios**: el patrón ya es genérico (config + atributos). Añadir casos no-webinar.
- **Lead `@gmail.com` de pruebas**: identificar los `karentest*@gmail.com` en SF para depuración.

## v1.0.4 — theme + GSAP (en progreso)

- Atributo `data-theme="light|dark"`: switch de tokens vía `.atfx-form[data-atfx-theme]` (sin
  recrear CSS). Light = `:root`; dark = fondo translúcido, texto claro, acento cyan.
- **GSAP** agregado como dependencia y bundleado. `src/ui/motion.ts`: `revealForm` (stagger de
  campos al cargar) y `revealThankYou` (entrada + pop del icono). Respeta `prefers-reduced-motion`.
- Bundle `forms.js` ~150kb (incluye GSAP).

## v1.0.3 — formulario general + i18n

- **Shortcode reutilizable** dirigido por atributos del mount (no se duplica por caso de uso):
  `data-zoom-link` (webinar vs lead), `data-lang`, `data-webinar-topic/date`, `data-lead-source`.
- **Zoom condicional**: solo abre si hay `data-zoom-link`; popup en el gesto, se cierra si SF falla.
- **Thank-you inline sin redirect**: al confirmar, el form se reemplaza in situ por una pantalla de
  gracias (con CTA de Zoom de respaldo) tras disparar conversiones GA4/GTM/Meta.
- **i18n es/en/pt**: `src/i18n` traduce labels, opciones, mensajes Zod, errores y thank-you;
  mapea a códigos SF reales (ESP/ENG/PTG, esp/en/pt). Value de Trading Experience canónico.
- Reemplazado `webinar-25jun` por config genérica `lead`.

## v1.0.2 — atomic design + design system por tokens

- Pivote a render por JS: Elementor solo aporta `<div data-atfx-form-mount="key">`.
- `ui/atoms` (input/select/acceptance/button/label/error), `ui/molecules/field-group`,
  `ui/organisms/form`, `data/options`, y CSS con tokens `--atfx-*`.
- `FieldDef` como fuente única: render + mapping SF + validación Zod.

## v1.0.1 — atribución vía referrer (validado en producción)

Tras investigación contra producción (15 jun 2026), corrección del modelo de atribución:

- **Atribución**: el motor ahora pone `referrer = window.location.href` antes de enviar
  (`captureLandingUrl`, default true). El pipeline de ATFX deriva `Landing_Page_Id__c` y los
  `utm_*__c` de ese referrer server-side. Se eliminó la inyección de campos `utm_*__c` /
  `Landing_Page_Id__c` / `GCLID__c`: el pipeline los ignoraba.
- `attribution.ts` reducido a `applyLandingUrl()`; removidos `DEFAULT_ATTRIBUTION`,
  `AttributionField`, `AttributionSource` y `FormConfig.attribution`.
- Documentados todos los hallazgos en `CLAUDE.md`.

### Validación end-to-end (confirmada en Salesforce)
- Payload del bundle nuevo: `referrer = location.href` y SIN `form_fields[Landing_Page_Id__c]`. ✓
- En SF, `Landing_Page_Id__c` = exactamente el `referrer` enviado por el motor. ✓
- `Trading_Experience__c` guardado descriptivo (`Avanzado`, `Principiante`). ✓

### Hallazgos clave
- Pipeline Elementor->SF es asíncrono y en lotes (~5-35 min); `success:true` = encolado, no = en SF.
- `Trading_Experience__c` no es picklist restringido: acepta cualquier valor (fix a descriptivos).
- `Landing_Page_Id__c` y `utm_*__c` se derivan del `referrer`, no de campos directos.
- `Is_Test_Account__c=true` se salta el enriquecimiento de UTMs (90% reales vs 5% test). El flag
  NO depende del dominio: un `@gmail.com` con "test" en nombre/email también quedó marcado test.
- jsDelivr cachea la resolución de `@latest`: tras un tag nuevo puede seguir sirviendo el
  anterior varios minutos aunque el purge responda 200. Las URLs por commit resuelven al instante.

## v1.0.0 — scaffold inicial

- Estructura jsDelivr + esbuild + TypeScript + Zod, repo público `karenrebecag/atfx-forms`.
- Motor genérico: validación Zod, atribución (UTM/landing/gclid/GA), envío a Elementor
  con timeout + reintento, errores por campo, integraciones GA4/GTM/Meta.
- Form `webinar-25jun`: mapeo a campos de Salesforce, limpieza de valores legacy
  `_HolaMemo` en `Trading_Experience__c`, Zoom abierto solo tras éxito confirmado.
- CI `release.yml`: build + auto-tag patch + regenera loader + purga jsDelivr.
