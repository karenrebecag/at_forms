# Changelog

## v1.1.0 — atribución vía referrer

Tras investigación contra producción (15 jun 2026), corrección del modelo de atribución:

- **Atribución**: el motor ahora pone `referrer = window.location.href` antes de enviar
  (`captureLandingUrl`, default true). El pipeline de ATFX deriva `Landing_Page_Id__c` y los
  `utm_*__c` de ese referrer server-side. Se eliminó la inyección de campos `utm_*__c` /
  `Landing_Page_Id__c` / `GCLID__c`: el pipeline los ignoraba.
- `attribution.ts` reducido a `applyLandingUrl()`; removidos `DEFAULT_ATTRIBUTION`,
  `AttributionField`, `AttributionSource` y `FormConfig.attribution`.
- Documentados todos los hallazgos en `CLAUDE.md` (pipeline asíncrono en lotes, valores
  arbitrarios aceptados, atribución por referrer, test accounts sin enriquecimiento, CORS).

### Hallazgos clave
- Pipeline Elementor->SF es asíncrono y en lotes (~5-35 min); `success:true` = encolado, no = en SF.
- `Trading_Experience__c` no es picklist restringido: acepta cualquier valor (fix a descriptivos).
- `Landing_Page_Id__c` y `utm_*__c` se derivan del `referrer`, no de campos directos.
- `Is_Test_Account__c=true` (emails de prueba) se saltan el enriquecimiento de UTMs (90% vs 5%).

## v1.0.0 — scaffold inicial

- Estructura jsDelivr + esbuild + TypeScript + Zod, repo público `karenrebecag/atfx-forms`.
- Motor genérico: validación Zod, atribución (UTM/landing/gclid/GA), envío a Elementor
  con timeout + reintento, errores por campo, integraciones GA4/GTM/Meta.
- Form `webinar-25jun`: mapeo a campos de Salesforce, limpieza de valores legacy
  `_HolaMemo` en `Trading_Experience__c`, Zoom abierto solo tras éxito confirmado.
- CI `release.yml`: build + auto-tag patch + regenera loader + purga jsDelivr.
