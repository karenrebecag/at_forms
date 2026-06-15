// Átomo: checkbox de aceptación con su label inline.
export function acceptance(opts: {
  id: string;
  name: string;
  label: string;
  defaultChecked?: boolean;
}): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "atfx-acceptance";

  const box = document.createElement("input");
  box.type = "checkbox";
  box.className = "atfx-checkbox";
  box.id = opts.id;
  box.name = `form_fields[${opts.name}]`;
  if (opts.defaultChecked) box.checked = true;

  const lbl = document.createElement("label");
  lbl.className = "atfx-acceptance-label";
  lbl.htmlFor = opts.id;
  lbl.textContent = opts.label;

  wrapper.append(box, lbl);
  return wrapper;
}
