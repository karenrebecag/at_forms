// Átomo: etiqueta de campo.
export function label(opts: { forId: string; text: string; required?: boolean }): HTMLLabelElement {
  const el = document.createElement("label");
  el.className = "atfx-label";
  el.htmlFor = opts.forId;
  el.textContent = opts.text;
  if (opts.required) {
    const mark = document.createElement("span");
    mark.className = "atfx-required";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = " *";
    el.appendChild(mark);
  }
  return el;
}
