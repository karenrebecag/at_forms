const ICON_SUCCESS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M11.25 14.25L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 10.5L11.25 14.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12C3 16.9706 7.02943 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02943 16.9706 3 12 3C7.02943 3 3 7.02943 3 12Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_ERROR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path opacity="0.1" d="M12 3C16.971 3 21 7.029 21 12C21 16.971 16.971 21 12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3Z" fill="currentColor"/><path d="M12 3C16.971 3 21 7.029 21 12C21 16.971 16.971 21 12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12.5V7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.996 14.5C11.444 14.5 10.996 14.948 11 15.5C11 16.052 11.448 16.5 12 16.5C12.552 16.5 13 16.052 13 15.5C13 14.948 12.552 14.5 11.996 14.5Z" fill="currentColor"/></svg>`;

function statusIcon(type: "success" | "error"): HTMLSpanElement {
  const el = document.createElement("span");
  el.className = `atfx-field-icon atfx-field-icon--${type}`;
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = type === "success" ? ICON_SUCCESS : ICON_ERROR;
  return el;
}

// Átomo: input de texto/email/tel envuelto en un div relativo para los iconos de estado.
export function input(opts: {
  id: string;
  name: string;
  type: "text" | "email" | "tel";
  required?: boolean;
  placeholder?: string;
  pattern?: string;
  title?: string;
}): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "atfx-input-wrap";

  const el = document.createElement("input");
  el.className = "atfx-input";
  el.id = opts.id;
  el.name = `form_fields[${opts.name}]`;
  el.type = opts.type;
  if (opts.required) el.required = true;
  if (opts.placeholder) el.placeholder = opts.placeholder;
  if (opts.pattern) el.pattern = opts.pattern;
  if (opts.title) el.title = opts.title;

  wrap.append(el, statusIcon("success"), statusIcon("error"));
  return wrap;
}
