# atfx-forms

Librería versionada de formularios para ATFX LATAM. Lógica + estilos servidos vía jsDelivr;
**Elementor solo aporta un punto de montaje**. Build: esbuild + TypeScript + Zod + GSAP.
Render atómico (atoms/molecules/organisms) con design system por tokens, i18n y theming.

## Identidad

| Campo | Valor |
|---|---|
| Repo | `karenrebecag/at_forms` (público — requisito de jsDelivr /gh/) |
| Remote | `git@github.com:karenrebecag/at_forms.git` (push por SSH) |
| CDN loader | `https://cdn.jsdelivr.net/gh/karenrebecag/at_forms@latest/loader.js` |
| Sitio destino | www.atfxlatam.com (WordPress + Elementor Pro, Cloudflare, WP Engine) |
| Endpoint de envío | `POST /wp-admin/admin-ajax.php` con `action=elementor_pro_forms_send_form` |
| Salesforce org (alias MCP) | `atfx` — **solo lectura** |
| Versión desplegada | ver tag más alto (`git ltag` / jsDelivr @latest). Última conocida: v1.0.3+ |

## Cómo se usa en Elementor (contrato actual)

Un widget **HTML** con un `<div>` de montaje + el loader. El mismo shortcode sirve todos los
casos de uso; el comportamiento lo definen los **atributos**:

```html
<div data-atfx-form-mount="lead"
     data-lang="es"                 <!-- es | en | pt   (default es) -->
     data-theme="light"             <!-- light | dark   (default light) -->
     data-zoom-link="https://atfx.zoom.us/webinar/register/WN_..."  <!-- opcional -->
     data-webinar-topic="Trading Experience"   <!-- opcional -->
     data-webinar-date="2026-06-25 18:00:00"   <!-- opcional -->
     data-lead-source="Webinar"                 <!-- opcional, default "Webinar" -->
     data-bdm-owner="005T1000007ZjueIAC"></div>  <!-- opcional: SF User Id del BDM -->

<script data-cfasync="false"
  src="https://cdn.jsdelivr.net/gh/karenrebecag/at_forms@latest/loader.js"></script>
```

Reglas de los atributos:
- `data-zoom-link` presente → **modo webinar**: setea `Webinar_venue_zoom_link__c`, abre Zoom en
  pestaña nueva al confirmar (popup abierto dentro del gesto de submit; se cierra si SF falla),
  e inyecta topic/date/Comment. Ausente/vacío → **lead simple** (solo envía).
- `data-lang` → traduce labels, opciones, mensajes de validación Zod, errores y thank-you;
  mapea a códigos SF (ver i18n).
- `data-theme` → switch de tokens CSS por `[data-atfx-theme]` (no recrea CSS).
- Varios forms en una página: basta **un** `<script>` del loader.
- Pegar en widget **HTML**, NO en el widget Form de Elementor (evita doble submit).

## Arquitectura

```
src/*.ts  --esbuild-->  dist/forms.js (Zod + GSAP inlined, minificado) + dist/forms.css
push main -> CI (.github/workflows/release.yml): typecheck + build + tag patch +
             regenera loader.js + commitea dist + purga jsDelivr @latest
loader.js @latest -> inyecta el tag inmutable @vX.Y.Z (CSS + JS)
```

### Estructura
```
src/
├── index.ts                 # boot: lee atributos del mount, arma instancia, render + bind + reveal
├── core/
│   ├── types.ts             # FieldDef (fuente única), FormConfig, FormInstance, ElementorResponse
│   ├── registry.ts          # registro de forms por key
│   ├── dom.ts               # collectValues / serializeForm / applyValidated / setLoading
│   ├── attribution.ts       # applyLandingUrl -> referrer = location.href
│   ├── errors.ts            # zod/server -> slots [data-error-for], banner de form
│   ├── submit-elementor.ts  # POST admin-ajax + timeout + reintento por red
│   └── form-engine.ts       # validar -> enriquecer -> enviar -> errores -> thank-you inline
├── ui/
│   ├── atoms/               # input, select, acceptance, button, label, error-message
│   ├── molecules/           # field-group (label + control + slot de error)
│   ├── organisms/           # form (renderForm), thank-you (renderThankYou)
│   └── motion.ts            # GSAP: revealForm / revealThankYou (respeta prefers-reduced-motion)
├── schemas/lead.ts          # createLeadSchema(t) — factory por idioma
├── forms/lead.ts            # config genérica "lead": fields + meta + hidden + integraciones
├── i18n/index.ts            # DICTS es/en/pt + resolveLang + códigos SF
├── data/options.ts          # COUNTRIES + DIALLING_CODES
└── styles/forms.css         # design system por tokens (--atfx-*) + theme dark + thank-you
```

### Conceptos clave
- **`FieldDef` es la fuente única**: `schemaKey` (validación/i18n) + `name` (envío form_fields[]) +
  `kind` (render) + `optionsRef` + `colSpan`. Render, mapping a SF y validación salen de ahí.
- **Labels NO viven en FieldDef**: se resuelven por `schemaKey` desde el diccionario del idioma.
- **Config genérica** (`key:"lead"`): la misma para todos los casos; la instancia se arma en
  `index.ts` mezclando hidden base + idioma + webinar según atributos.
- **Theme**: `index.ts` pone `form.dataset.atfxTheme`; CSS sobreescribe tokens en
  `.atfx-form[data-atfx-theme="dark"]`. Light = `:root`.
- **GSAP** se bundlea (no se asume presente como en Webflow). Sube el bundle a ~150kb.

## i18n (verificado contra producción)

Códigos SF reales (de `GROUP BY` en Lead):
| lang | `Email_language_lead__c` | `Landing_Page_Language__c` |
|------|--------------------------|----------------------------|
| es | ESP | esp |
| en | ENG | en |
| pt | PTG | pt |

- El **value** de `Trading_Experience__c` es canónico (`Principiante`/`Intermedio`/`Avanzado`) en
  todo idioma; solo el label visible se traduce → SF queda consistente.

## Hallazgos verificados (15 jun 2026) — pipeline Elementor -> SF

1. **Pipeline asíncrono en lotes** (middle DB / Zapier). `success:true` = encolado, NO = en SF.
   Los lotes caen irregulares (~5-35+ min). Nunca esperes el lead al instante.
2. **admin-ajax acepta valores arbitrarios** (no valida picklists). `Trading_Experience__c` no es
   restringido: los `persona_2/4/5` originales eran solo lo que el form mandaba. Fix = descriptivos.
3. **Atribución por `referrer`, no por campos**: `Landing_Page_Id__c` se deriva del campo top-level
   `referrer`; `utm_*__c`/`GCLID__c` enviados directo se IGNORAN (los parsea SF server-side de la
   landing URL). Por eso el motor pone `referrer = location.href` (`captureLandingUrl`, default true).
4. **Leads de prueba se saltan el enriquecimiento de UTMs**: `Is_Test_Account__c=true` (90% reales
   con utm vs 5% test). El flag NO es por dominio: un `@gmail.com` con "test" en nombre/email también
   se marca test. `Landing_Page_Id__c` sí se puebla en test. Para ver utm_*__c reales: email no-test.
5. **Campos de webinar no son columnas del Lead**: `Webinar_topic__c`/`Webinar_date_time__c`/
   `Webinar_venue_zoom_link__c` los mapea el connector; probablemente aterrizan en el **Campaign
   record** (doc CRM: "cada registro crea un campaign record"), no en el Lead.
6. **jsDelivr cachea la resolución de `@latest`**: tras un tag nuevo puede seguir sirviendo el
   anterior varios minutos aunque el purge responda 200. URLs por commit (`@<hash>`) resuelven al
   instante. El usuario NO quiere fijar versiones; se queda en `@latest` y se espera la propagación.
   Purge manual: `curl -s "https://purge.jsdelivr.net/gh/karenrebecag/at_forms@latest/loader.js"`.
7. **CORS**: admin-ajax solo permite `Origin: https://www.atfxlatam.com`. curl y forms nativos no
   aplican CORS; fetch desde otro origen sí se bloquea. La consola del propio sitio sí puede llamarlo.
8. El checkbox de aceptación es **required a nivel Elementor/WP**: vacío rechaza antes de SF.
9. **Entity__c es siempre sobreescrito a "GM" por el middleware** — el form puede mandar "MU" y
   llega "GM" en SF. El valor en `forms/lead.ts` es irrelevante; el connector lo pisa server-side.
   No cambiar a "GM" en el código: sería una falsa dependencia de comportamiento interno del CRM.
10. **Sesión de admin de WordPress silencia la acción de SF**: submits con cookie
    `wordpress_logged_in_*` activa devuelven 200 OK con `aanumber` pero no crean lead en SF.
    Siempre probar en incógnito (sin sesión WP) para validar el pipeline end-to-end.

## Hallazgos verificados (16 jun 2026) — fix del pipeline custom → SF (v1.0.11)

**Bug:** el form custom llegaba a WordPress (200 OK, `aanumber` asignado) pero nunca creaba
el lead en Salesforce. Los forms nativos de Elementor Pro sí funcionaban.

**Causa raíz:** dos diferencias en cómo `fetch` construye el request vs jQuery (usado por Elementor):

| Header / campo | Form nativo (Elementor Pro + jQuery) | Form custom antes del fix |
|---|---|---|
| `Content-Type` | `multipart/form-data` | `application/x-www-form-urlencoded` |
| `X-Requested-With` | `XMLHttpRequest` | ausente |

El handler PHP de Elementor Pro (o el plugin `atfx-general`) valida `X-Requested-With: XMLHttpRequest`
antes de disparar las acciones del form (incluida la de Salesforce). `fetch` nativo no agrega este
header; jQuery sí. Sin él, WordPress acepta el AJAX (200 OK) pero la acción SF se salta en silencio.

**Fix aplicado en `src/core/submit-elementor.ts` (v1.0.11):**
```ts
// Antes:
headers: { "Content-Type": "application/x-www-form-urlencoded" },
body: payload.toString(),

// Después:
const formData = new FormData();
for (const [key, value] of payload.entries()) formData.append(key, value);
// fetch sin Content-Type explícito → browser pone multipart/form-data con boundary correcto
headers: { "X-Requested-With": "XMLHttpRequest" },
body: formData,
```

**Diagnóstico del pipeline** (verificado contra SF vía MCP):
- 200 OK + `success:true` + `aanumber` = encolado en WP, NO garantiza lead en SF.
- Los leads que llegan lo hacen en segundos; si no llegan en 10 min, no llegan nunca.
- `Landing_Page_Id__c` = valor del campo `referrer` del POST (= `location.href` via `applyLandingUrl`).
- `import.meta.url` no funciona con esbuild (target es2019): esbuild reemplaza `import.meta` con `{}`
  causando `TypeError` en carga del módulo. Usar `document.querySelector('script[src*="at_forms@"]')`
  para leer la versión del bundle en runtime.

## Desarrollo

```bash
npm install
npm run typecheck     # tsc --noEmit
npm run build         # genera dist/
npm run dev           # build + watch + server en :8765 (sirve preview.html)
```
`preview.html` (gitignored) monta varias instancias (idiomas/themes/webinar) contra dist local.

## Deploy

`git push origin main` (SSH). El CI: typecheck + build + tag patch (vX.Y.(Z+1)) + regenera
loader.js + commitea dist + purga `@latest`. Tras pushear, el CI commitea sobre main, así que
antes del siguiente push hacer `git pull --rebase origin main`.

Verificación de leads (MCP Salesforce, solo lectura):
```sql
SELECT FirstName, Email, Trading_Experience__c, Email_language_lead__c, Landing_Page_Language__c,
       Landing_Page_Id__c, Is_Test_Account__c, CreatedDate
FROM Lead WHERE Email = '...' ORDER BY CreatedDate DESC
```

## Reglas de operación
- Salesforce vía MCP = **solo lectura**. Nunca escribir.
- No meter secretos en el repo: el bundle es público en jsDelivr (visible en el browser).
- Probar contra prod con emails `@debugtest.com` (quedan marcados test; no van a ventas, pero
  tampoco enriquecen utm). Para validar utm reales hace falta email no-test (cuidado: va a ventas).
- Pegar el form en widget HTML, no en el widget Form de Elementor.
- Pendiente de seguridad: un token se pegó en el chat en una sesión previa — si tenía valor real,
  rotarlo. No usar `.env` aquí para secretos de frontend.
