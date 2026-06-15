import type { FieldDef, FormConfig } from "./types";

// Localiza un input por su name interno (envuelto en form_fields[]).
export function getField(form: HTMLFormElement, name: string): HTMLInputElement | HTMLSelectElement | null {
  return form.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="form_fields[${name}]"]`);
}

// Lee los valores crudos del DOM keyed por schemaKey, listos para validar con Zod.
// Acceptance -> boolean; el resto -> string.
export function collectValues(form: HTMLFormElement, fields: FieldDef[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const def of fields) {
    const el = getField(form, def.name);
    if (!el) continue;
    out[def.schemaKey] =
      def.kind === "acceptance" ? (el as HTMLInputElement).checked : el.value;
  }
  return out;
}

// Serializa todos los inputs del form (preserva meta top-level e hidden de negocio).
export function serializeForm(form: HTMLFormElement): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value === "string") params.append(key, value);
  }
  return params;
}

// Sobrescribe en el payload los campos validados (valores limpios de Zod + transforms).
export function applyValidated(
  params: URLSearchParams,
  config: FormConfig,
  data: Record<string, unknown>,
): void {
  for (const def of config.fields) {
    if (!(def.schemaKey in data)) continue;
    const raw = data[def.schemaKey];
    const key = `form_fields[${def.name}]`;

    if (def.kind === "acceptance") {
      // Elementor espera "on" cuando el checkbox está marcado.
      if (raw) params.set(key, "on");
      else params.delete(key);
      continue;
    }
    const transform = config.transforms?.[def.schemaKey];
    params.set(key, transform ? transform(raw) : String(raw));
  }
}

export function setLoading(form: HTMLFormElement, loading: boolean): void {
  form.classList.toggle("is-submitting", loading);
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (btn) btn.disabled = loading;
}
