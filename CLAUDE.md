# atfx-forms

Librería versionada de formularios para ATFX LATAM. Lógica + estilos servidos vía jsDelivr;
**Elementor solo aporta semántica HTML**. Build con esbuild + TypeScript + Zod.

## Identidad

| Campo | Valor |
|---|---|
| Repo | `karenrebecag/at_forms` (público — requisito de jsDelivr /gh/) |
| CDN loader | `https://cdn.jsdelivr.net/gh/karenrebecag/at_forms@latest/loader.js` |
| Sitio destino | www.atfxlatam.com (WordPress + Elementor Pro, detrás de Cloudflare, WP Engine) |
| Endpoint de envío | `POST /wp-admin/admin-ajax.php` con `action=elementor_pro_forms_send_form` |
| Salesforce org (alias sf) | `atfx` (solo lectura desde MCP Salesforce DX) |

## Arquitectura

```
src/*.ts  --esbuild-->  dist/forms.js (Zod inlined, minificado) + dist/forms.css
push main -> CI (release.yml): typecheck + build + tag patch + regenera loader + purga jsDelivr
loader.js @latest -> inyecta el tag inmutable @vX.Y.Z
Elementor (widget HTML): <form data-atfx-form="KEY"> + <script .../loader.js>
```

El motor intercepta el submit del form, valida con Zod, enriquece, envía a admin-ajax.php,
maneja errores por campo, dispara integraciones y abre Zoom solo si SF confirma.

### Estructura
- `src/index.ts` — autoDetect `[data-atfx-form]`, side-effect imports de cada form.
- `src/core/` — engine genérico (types, registry, dom, attribution, errors, submit, form-engine).
- `src/schemas/<key>.ts` — schema Zod + mensajes.
- `src/forms/<key>.ts` — FormConfig (fields, transforms, integrations) + registerForm.
- `src/integrations/` — GA4 / GTM / Meta (corren tras éxito confirmado).
- `src/styles/forms.css` — estados error/loading/success.

### Contrato de desacople
Lo único que debe permanecer estable es el `name` de cada input (`form_fields[...]`).
La semántica (labels, orden, columnas) puede cambiar en Elementor sin tocar el repo.
El mapping campo->Salesforce vive en `src/forms/<key>.ts`.

## Hallazgos verificados contra producción (15 jun 2026)

Investigación del form del webinar 25jun (Elementor -> admin-ajax -> middle DB -> Salesforce).

### 1. El pipeline a Salesforce es ASÍNCRONO y en lotes
- `admin-ajax.php` responde `success:true` al instante (encola en el middle DB), pero el lead
  aparece en Salesforce **en lotes** (~cada 5-35 min, job que dispara en segundo `:38`).
  Doc CRM: "Through middle database or Zapier go into Salesforce."
- Implicación: nunca esperes el lead en SF inmediatamente. `success:true` = encolado, no = en SF.
- `aanumber` (ej. `wp20260615...`) en la respuesta = id de confirmación del lado WordPress.

### 2. admin-ajax acepta valores arbitrarios (no valida contra picklists)
- `Trading_Experience__c` NO es un picklist restringido: SF guarda exactamente lo que recibe.
  Verificado: `persona_2`, `Principiante`, `Beginner`, `0-6 meses (Principiante)` se guardaron
  literales. Los `persona_2/4/5` originales eran solo lo que el form mandaba, no un requisito de SF.
- **Fix aplicado**: el `<select>` envía valores descriptivos (`Principiante`/`Intermedio`/`Avanzado`).
  El schema además limpia el sufijo legacy `_HolaMemo` con `z.preprocess`.

### 3. Atribución: se deriva del `referrer`, NO de los campos que mandes
- `Landing_Page_Id__c` se deriva del campo top-level **`referrer`** (la URL de aterrizaje).
  Si `referrer` lleva query string con UTMs, se guarda completo; si no, queda la URL base.
- Los campos `utm_source__c`, `utm_medium__c`, `utm_campaign__c`, `utm_content__c`, `utm_term__c`,
  `GCLID__c` enviados directo en el form **se ignoran**. Una automatización server-side los
  parsea de la landing URL.
- **Bug raíz del form actual**: el hidden `referrer` está fijo con la URL base SIN UTMs ->
  ningún lead del webinar tiene atribución.
- **Fix aplicado**: el motor sobrescribe `referrer` = `window.location.href` antes de enviar
  (`captureLandingUrl`, default true). NO se inyectan campos utm_*__c (se eliminó esa lógica).

### 4. Los leads de prueba se saltan el enriquecimiento de UTMs
- Cobertura de `utm_source__c`: leads reales 1831/2043 (**90%**); test 2/40 (**5%**).
- El flag `Is_Test_Account__c=true` **NO depende del dominio**: un `@gmail.com` con "test" en
  nombre/email también quedó marcado test. Lo dispara probablemente el substring "test" y/o la
  landing de preview (`?...&preview=true`). Buena noticia: esos leads **no** se asignan a ventas.
- Implicación: **no se puede verificar el desglose de UTMs con emails de prueba** — el
  enriquecimiento no corre para test accounts. `Landing_Page_Id__c` sí se puebla incluso en test
  (de ahí se valida el canal `referrer -> Landing_Page_Id__c`). Para ver los `utm_*__c`
  poblándose haría falta un email real (con cuidado: ese sí va a ventas).

### 5. Otros
- CORS: `admin-ajax.php` solo permite `Origin: https://www.atfxlatam.com`. Desde otro origen
  (localhost, file://) el fetch se bloquea; curl y forms nativos no aplican CORS.
- El checkbox de aceptación es **required a nivel Elementor/WP**: enviarlo vacío rechaza el lead
  antes de llegar a SF (`{"success":false, errors:{...:"This field is required."}}`).
- gaconnector_* y campos GA: dependen del plugin GA Connector (cookies/JS del navegador);
  no se pueblan en envíos sin sesión de browser.
- Algunos envíos nunca sincronizan a SF (vimos `@test.com` y un duplicado caer fuera) pese a
  `success:true`: el middle DB deduplica/descarta. No es bug del form.

### 6. jsDelivr cachea la resolución de `@latest` (operacional)
- Tras crear un tag nuevo, `@latest/loader.js` puede seguir sirviendo el anterior varios
  minutos aunque `purge.jsdelivr.net` responda 200 (el purge limpia el archivo, no re-resuelve
  el ref de inmediato). Confirmado: tardó ~min en pasar de 1.0.0 a 1.0.1.
- Para test inmediato sin esperar cache: URL por commit `@<hash>` (inmutable, resuelve al toque).
  El usuario NO quiere fijar versiones en Elementor; se queda en `@latest` y se espera la propagación.

## Validación end-to-end (15 jun 2026, confirmada en SF)
- Payload del bundle v1.0.1: `referrer = location.href` y **sin** `form_fields[Landing_Page_Id__c]`.
- En Salesforce: `Landing_Page_Id__c` = exactamente el `referrer` que puso el motor. Canal probado.
- `Trading_Experience__c` guardado descriptivo (`Avanzado`/`Principiante`), ya no `persona_*`.
- Falta solo la prueba con UTMs reales (requiere landing publicada + URL con utm_* + email no-test).

## Pendiente de despliegue en la landing real
- Lo validado corre en el form de **preview** `pruebaskarencodeform`, NO en la página publicada
  `training-sessions-25jun`. Mientras la página real siga con el form viejo, seguirá mandando
  `persona_*`/`_HolaMemo`.
- Para cerrar: en la página publicada (1) reemplazar el form por el HTML descriptivo
  (`~/Desktop/atfx-form-webinar-25jun.html`), (2) dejar el `<script>` del loader `@latest`,
  (3) quitar el form/script viejos (incluido el que abría Zoom en el click).

## Reglas de operación
- Salesforce vía MCP es **solo lectura**: usar para verificar, nunca para escribir.
- No meter secretos/tokens en este repo: el bundle es público en jsDelivr (visible en el browser).
- Pegar el form en un widget **HTML** de Elementor (no en el widget Form) para evitar doble submit.
- Para probar contra producción usar emails `@debugtest.com` (quedan marcados como test).
- Deploy = `git push origin main` (remote por SSH: `git@github.com:karenrebecag/at_forms.git`).

## Verificación de leads (SOQL útil)
```sql
SELECT FirstName, Email, Trading_Experience__c, utm_source__c, utm_campaign__c,
       Landing_Page_Id__c, Is_Test_Account__c, CreatedDate
FROM Lead WHERE Email IN ('...') ORDER BY CreatedDate DESC
```
Campos clave del Lead: `Trading_Experience__c`, `Landing_Page_Id__c`, `utm_source__c`,
`utm_medium__c`, `utm_campaign__c`, `utm_content__c`, `utm_term__c`, `GCLID__c`,
`Is_Test_Account__c`, `Entity__c`, `Country_of_Residence_Lead__c`, `Email_language_lead__c`.
