import type { FormConfig } from "./types";

// Localiza un input por su name interno (envuelto en form_fields[]).
export function getField(form: HTMLFormElement, name: string): HTMLInputElement | null {
  return form.querySelector<HTMLInputElement>(`[name="form_fields[${name}]"]`);
}

// Lee los valores crudos del DOM keyed por friendlyKey, listos para validar con zod.
// Checkboxes -> boolean; el resto -> string.
export function collectValues(
  form: HTMLFormElement,
  fields: Record<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [friendlyKey, name] of Object.entries(fields)) {
    const el = getField(form, name);
    if (!el) continue;
    out[friendlyKey] = el.type === "checkbox" ? el.checked : el.value;
  }
  return out;
}

// Serializa todos los inputs del form (preserva post_id, form_id y hidden de SF).
export function serializeForm(form: HTMLFormElement): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value === "string") params.append(key, value);
  }
  return params;
}

// Sobrescribe en el payload los campos validados (valores limpios de zod + transforms).
export function applyValidated(
  params: URLSearchParams,
  config: FormConfig,
  data: Record<string, unknown>,
): void {
  for (const [friendlyKey, name] of Object.entries(config.fields)) {
    if (!(friendlyKey in data)) continue;
    const raw = data[friendlyKey];
    const transform = config.transforms?.[friendlyKey];
    const key = `form_fields[${name}]`;

    if (typeof raw === "boolean") {
      // Checkbox de aceptación: Elementor espera "on" cuando está marcado.
      if (raw) params.set(key, "on");
      else params.delete(key);
      continue;
    }
    params.set(key, transform ? transform(raw) : String(raw));
  }
}

export function setLoading(form: HTMLFormElement, loading: boolean): void {
  form.classList.toggle("is-submitting", loading);
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (btn) btn.disabled = loading;
}
