# Changelog

> Nota: el CI hace solo bump de patch en cada push a `main` con cambios en `src/**`.
> Cambios solo de docs (`CLAUDE.md`, `CHANGELOG.md`) no disparan release ni tag.

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
