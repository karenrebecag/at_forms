import type { SelectOption } from "../../core/types";

// Wrapper con un setter imperativo para preseleccionar un valor (p. ej. geo-IP) tras el render.
// presetValue no pisa una selección existente: devuelve false si el campo ya tiene valor.
export interface PresettableElement extends HTMLElement {
  presetValue?(value: string): boolean;
}

export function select(opts: {
  id: string;
  name: string;
  options: SelectOption[];
  required?: boolean;
  placeholder?: string;
  searchable?: boolean;
}): HTMLElement {
  if (opts.searchable) return combobox(opts);

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

  (wrapper as PresettableElement).presetValue = (value: string): boolean => {
    if (el.value) return false;
    if (!Array.from(el.options).some((o) => o.value === value)) return false;
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  };

  wrapper.appendChild(el);
  return wrapper;
}

function combobox(opts: {
  id: string;
  name: string;
  options: SelectOption[];
  required?: boolean;
  placeholder?: string;
}): HTMLElement {
  const placeholderText = opts.placeholder ?? "Selecciona";

  const hidden = document.createElement("input");
  hidden.type = "hidden";
  hidden.name = `form_fields[${opts.name}]`;

  const valueSpan = document.createElement("span");
  valueSpan.className = "atfx-combobox-value";
  valueSpan.textContent = placeholderText;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.id = opts.id;
  trigger.className = "atfx-combobox-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.dataset.placeholder = "";
  trigger.appendChild(valueSpan);

  const search = document.createElement("input");
  search.type = "text";
  search.className = "atfx-combobox-search";
  search.placeholder = "Buscar...";
  search.autocomplete = "off";

  const list = document.createElement("ul");
  list.className = "atfx-combobox-list";
  list.setAttribute("role", "listbox");

  for (const opt of opts.options) {
    const li = document.createElement("li");
    li.className = "atfx-combobox-option";
    li.setAttribute("role", "option");
    li.dataset.value = opt.value;
    li.dataset.label = opt.label;
    li.textContent = opt.label;
    list.appendChild(li);
  }

  const panel = document.createElement("div");
  panel.className = "atfx-combobox-panel";
  panel.appendChild(search);
  panel.appendChild(list);

  const wrapper = document.createElement("div");
  wrapper.className = "atfx-combobox";
  wrapper.appendChild(trigger);
  wrapper.appendChild(panel);
  wrapper.appendChild(hidden);

  let isOpen = false;
  const closeMs =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dropdown-close-dur")) || 140;

  function open() {
    isOpen = true;
    panel.classList.remove("is-closing");
    panel.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    wrapper.dataset.open = "";
    search.value = "";
    filterOptions("");
    search.focus();
  }

  function close(dispatchBlur = true) {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove("is-open");
    panel.classList.add("is-closing");
    trigger.setAttribute("aria-expanded", "false");
    delete wrapper.dataset.open;
    setTimeout(() => panel.classList.remove("is-closing"), closeMs);
    if (dispatchBlur) hidden.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function selectOption(value: string, labelText: string) {
    hidden.value = value;
    valueSpan.textContent = labelText;
    delete trigger.dataset.placeholder;
    list.querySelectorAll<HTMLLIElement>(".atfx-combobox-option").forEach((li) => {
      li.setAttribute("aria-selected", li.dataset.value === value ? "true" : "false");
    });
    close(false);
    hidden.dispatchEvent(new Event("change", { bubbles: true }));
    hidden.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function normalize(s: string): string {
    return s.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "");
  }

  function filterOptions(query: string) {
    const q = normalize(query);
    list.querySelectorAll<HTMLLIElement>(".atfx-combobox-option").forEach((li) => {
      li.hidden = q.length > 0 && !normalize(li.dataset.label ?? "").includes(q);
    });
  }

  trigger.addEventListener("click", () => {
    if (isOpen) close(); else open();
  });

  search.addEventListener("input", () => filterOptions(search.value));

  list.addEventListener("click", (e) => {
    const li = (e.target as Element).closest<HTMLLIElement>(".atfx-combobox-option");
    if (!li || li.hidden) return;
    selectOption(li.dataset.value ?? "", li.dataset.label ?? "");
  });

  document.addEventListener("click", (e) => {
    if (isOpen && !wrapper.contains(e.target as Node)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) close();
  });

  (wrapper as PresettableElement).presetValue = (value: string): boolean => {
    if (hidden.value) return false;
    const li = list.querySelector<HTMLLIElement>(`.atfx-combobox-option[data-value="${CSS.escape(value)}"]`);
    if (!li) return false;
    hidden.value = value;
    valueSpan.textContent = li.dataset.label ?? value;
    delete trigger.dataset.placeholder;
    list.querySelectorAll<HTMLLIElement>(".atfx-combobox-option").forEach((o) => {
      o.setAttribute("aria-selected", o.dataset.value === value ? "true" : "false");
    });
    hidden.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  };

  return wrapper;
}
