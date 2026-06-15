import type { ZodError } from "zod";
import type { FieldErrors, FormConfig } from "./types";
import { getField } from "./dom";

const FIELD_ERROR_CLASS = "atfx-field-error";
const FORM_MESSAGE_CLASS = "atfx-form-message";

// Convierte un ZodError en { friendlyKey: message } (primer issue por campo).
export function zodToFieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !(key in out)) out[key] = issue.message;
  }
  return out;
}

// Errores del servidor vienen keyed por name interno; los mapea a friendlyKey.
export function serverToFieldErrors(
  serverErrors: Record<string, string>,
  fields: FormConfig["fields"],
): FieldErrors {
  const nameToFriendly: Record<string, string> = {};
  for (const [friendlyKey, name] of Object.entries(fields)) nameToFriendly[name] = friendlyKey;

  const out: FieldErrors = {};
  for (const [name, message] of Object.entries(serverErrors)) {
    const friendly = nameToFriendly[name];
    if (friendly) out[friendly] = message;
  }
  return out;
}

export function clearErrors(form: HTMLFormElement): void {
  form.querySelectorAll(`.${FIELD_ERROR_CLASS}, .${FORM_MESSAGE_CLASS}`).forEach((el) => el.remove());
  form.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
}

export function renderErrors(
  form: HTMLFormElement,
  errors: FieldErrors,
  fields: FormConfig["fields"],
  formMessage?: string,
): void {
  for (const [friendlyKey, message] of Object.entries(errors)) {
    const name = fields[friendlyKey];
    const input = name ? getField(form, name) : null;
    const group = input?.closest<HTMLElement>(".elementor-field-group") ?? input?.parentElement;
    if (!group) continue;
    group.classList.add("has-error");
    const note = document.createElement("span");
    note.className = FIELD_ERROR_CLASS;
    note.textContent = message;
    group.appendChild(note);
  }

  if (formMessage) {
    const banner = document.createElement("div");
    banner.className = FORM_MESSAGE_CLASS;
    banner.setAttribute("role", "alert");
    banner.textContent = formMessage;
    form.prepend(banner);
  }
}
