const CHECK_SVG = `<svg class="atfx-checkbox-icon" viewBox="0 0 11 8" fill="none" aria-hidden="true"><path d="M1 4L4 7L10 1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
  box.className = "atfx-checkbox-input";
  box.id = opts.id;
  box.name = `form_fields[${opts.name}]`;
  if (opts.defaultChecked) box.checked = true;

  const visual = document.createElement("span");
  visual.className = "atfx-checkbox-box";
  visual.innerHTML = CHECK_SVG;

  const checkLabel = document.createElement("label");
  checkLabel.className = "atfx-checkbox-wrap";
  checkLabel.htmlFor = opts.id;
  checkLabel.appendChild(box);
  checkLabel.appendChild(visual);

  const textLabel = document.createElement("label");
  textLabel.className = "atfx-acceptance-label";
  textLabel.htmlFor = opts.id;
  textLabel.textContent = opts.label;

  wrapper.append(checkLabel, textLabel);
  return wrapper;
}
