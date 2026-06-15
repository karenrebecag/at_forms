// Átomo: input de texto/email/tel.
export function input(opts: {
  id: string;
  name: string;
  type: "text" | "email" | "tel";
  required?: boolean;
  placeholder?: string;
  pattern?: string;
  title?: string;
}): HTMLInputElement {
  const el = document.createElement("input");
  el.className = "atfx-input";
  el.id = opts.id;
  el.name = `form_fields[${opts.name}]`;
  el.type = opts.type;
  if (opts.required) el.required = true;
  if (opts.placeholder) el.placeholder = opts.placeholder;
  if (opts.pattern) el.pattern = opts.pattern;
  if (opts.title) el.title = opts.title;
  return el;
}
