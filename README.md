# atfx-forms

Librería versionada de formularios para ATFX LATAM. La lógica y los estilos se sirven vía
jsDelivr; **Elementor solo aporta la semántica HTML**. Si la semántica cambia, la lógica y
los estilos permanecen desacoplados.

## Arquitectura

```
src/*.ts  --esbuild-->  dist/forms.js  (Zod inlined, minificado)
src/styles/forms.css -> dist/forms.css

GitHub (push main) -> CI build + tag -> jsDelivr @vX.Y.Z (inmutable)
                                          loader.js @latest -> inyecta el tag correcto
```

## Carga en Elementor

Un solo bloque HTML en el footer/página. Elementor mantiene el `<form>` con sus campos;
solo se añade el atributo `data-atfx-form` y este script:

```html
<form data-atfx-form="webinar-25jun"> <!-- campos de Elementor sin cambios --> </form>

<script data-cfasync="false"
  src="https://cdn.jsdelivr.net/gh/karenrebecag/at_forms@latest/loader.js"></script>
```

El motor toma el control del submit: valida con Zod, enriquece con atribución (UTMs,
landing URL, gclid, GA client id), envía a `admin-ajax.php`, maneja errores por campo,
dispara integraciones y abre Zoom **solo si Salesforce confirma**.

## Contrato de desacople

| Capa | Dueño | Cambia sin romper |
|------|-------|-------------------|
| Semántica (HTML, labels, orden) | Elementor / Marketing | sí |
| Validación + lógica + envío | `src/` (este repo) | sí |
| Estilos de estado (error/loading) | `src/styles` | sí |
| Mapping campo -> Salesforce | `src/forms/*.ts` | absorbe cambios de names |

Lo único que debe permanecer estable es el atributo `name` de cada input
(`form_fields[...]`). Si cambia, se actualiza el `fields` map del form, no el resto.

## Desarrollo

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run build       # genera dist/
npm run dev         # build + watch + server en :8765
```

## Agregar un formulario nuevo

1. `src/schemas/<key>.ts` — schema Zod + mensajes.
2. `src/forms/<key>.ts` — `FormConfig` (fields, attribution, integrations) + `registerForm`.
3. Import side-effect en `src/index.ts`.
4. En Elementor: `<form data-atfx-form="<key>">`.

## Deploy

`git push origin main`. El CI compila, calcula el siguiente tag patch, regenera
`loader.js`, commitea `dist/`, crea el tag y purga `loader.js` en `@latest`.
