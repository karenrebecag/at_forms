import type { ZodError } from "zod";
import type { FieldDef, FieldErrors } from "./types";

const FORM_MESSAGE_CLASS = "atfx-form-message";

// Convierte un ZodError en { schemaKey: message } (primer issue por campo).
export function zodToFieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !(key in out)) out[key] = issue.message;
  }
  return out;
}

// Errores del servidor vienen keyed por name interno; los mapea a schemaKey.
export function serverToFieldErrors(serverErrors: Record<string, string>, fields: FieldDef[]): FieldErrors {
  const nameToKey: Record<string, string> = {};
  for (const def of fields) nameToKey[def.name] = def.schemaKey;

  const out: FieldErrors = {};
  for (const [name, message] of Object.entries(serverErrors)) {
    const key = nameToKey[name];
    if (key) out[key] = message;
  }
  return out;
}

export function clearErrors(form: HTMLFormElement): void {
  form.querySelectorAll(`.${FORM_MESSAGE_CLASS}`).forEach((el) => el.remove());
  form.querySelectorAll<HTMLElement>("[data-error-for]").forEach((el) => (el.textContent = ""));
  form.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
}

export function renderErrors(
  form: HTMLFormElement,
  errors: FieldErrors,
  fields: FieldDef[],
  formMessage?: string,
): void {
  const keyToName: Record<string, string> = {};
  for (const def of fields) keyToName[def.schemaKey] = def.name;

  for (const [schemaKey, message] of Object.entries(errors)) {
    const name = keyToName[schemaKey];
    if (!name) continue;
    const slot = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    const group = form.querySelector<HTMLElement>(`[data-field="${name}"]`);
    if (slot) slot.textContent = message;
    if (group) group.classList.add("has-error");
  }

  if (formMessage) {
    const banner = document.createElement("div");
    banner.className = FORM_MESSAGE_CLASS;
    banner.setAttribute("role", "alert");
    banner.textContent = formMessage;
    form.prepend(banner);
  }
}
