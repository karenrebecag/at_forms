# Changelog

## v1.0.0 — scaffold inicial

- Estructura jsDelivr + esbuild + TypeScript + Zod, repo público `karenrebecag/atfx-forms`.
- Motor genérico: validación Zod, atribución (UTM/landing/gclid/GA), envío a Elementor
  con timeout + reintento, errores por campo, integraciones GA4/GTM/Meta.
- Form `webinar-25jun`: mapeo a campos de Salesforce, limpieza de valores legacy
  `_HolaMemo` en `Trading_Experience__c`, Zoom abierto solo tras éxito confirmado.
- CI `release.yml`: build + auto-tag patch + regenera loader + purga jsDelivr.
