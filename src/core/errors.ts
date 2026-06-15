import type { ZodError } from "zod";
import type { FieldDef, FieldErrors } from "./types";

const FORM_MESSAGE_CLASS = "atfx-form-message";

export function zodToFieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !(key in out)) out[key] = issue.message;
  }
  return out;
}

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
  form.querySelectorAll(".has-error, .has-success").forEach((el) =>
    el.classList.remove("has-error", "has-success"),
  );
}

// Aplica o limpia el estado de un campo individual sin afectar los demás.
export function setFieldState(
  form: HTMLFormElement,
  name: string,
  state: "error" | "success" | "idle",
  message = "",
): void {
  const slot = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
  const group = form.querySelector<HTMLElement>(`[data-field="${name}"]`);
  if (!group) return;
  group.classList.remove("has-error", "has-success");
  if (slot) slot.textContent = "";
  if (state === "error") {
    group.classList.add("has-error");
    if (slot) slot.textContent = message;
  } else if (state === "success") {
    group.classList.add("has-success");
  }
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
    setFieldState(form, name, "error", message);
  }

  if (formMessage) {
    const banner = document.createElement("div");
    banner.className = FORM_MESSAGE_CLASS;
    banner.setAttribute("role", "alert");
    banner.textContent = formMessage;
    form.prepend(banner);
  }
}
