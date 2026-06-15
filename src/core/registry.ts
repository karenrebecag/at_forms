import type { FormConfig } from "./types";

// Registro central de formularios. Cada form se registra por su key (data-atfx-form).
const registry = new Map<string, FormConfig>();

export function registerForm(config: FormConfig): void {
  if (registry.has(config.key)) {
    console.warn(`[atfx-forms] form "${config.key}" ya estaba registrado, se sobreescribe`);
  }
  registry.set(config.key, config);
}

export function getForm(key: string): FormConfig | undefined {
  return registry.get(key);
}
