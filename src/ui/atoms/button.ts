// Átomo: botón de submit.
export function button(opts: { label: string; id?: string }): HTMLButtonElement {
  const el = document.createElement("button");
  el.className = "atfx-button";
  el.type = "submit";
  if (opts.id) el.id = opts.id;

  const text = document.createElement("span");
  text.className = "atfx-button-text";
  text.textContent = opts.label;
  el.appendChild(text);
  return el;
}
