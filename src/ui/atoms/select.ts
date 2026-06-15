import type { SelectOption } from "../../core/types";

// Átomo: select. Las opciones se crean con textContent (anti-XSS).
export function select(opts: {
  id: string;
  name: string;
  options: SelectOption[];
  required?: boolean;
  placeholder?: string;
}): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "atfx-select-wrapper";

  const el = document.createElement("select");
  el.className = "atfx-select";
  el.id = opts.id;
  el.name = `form_fields[${opts.name}]`;
  if (opts.required) el.required = true;

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = opts.placeholder ?? "Selecciona";
  el.appendChild(placeholder);

  for (const opt of opts.options) {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    el.appendChild(o);
  }

  wrapper.appendChild(el);
  return wrapper;
}
