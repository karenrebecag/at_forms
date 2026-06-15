import type { FieldDef, FormConfig } from "../../core/types";
import { label } from "../atoms/label";
import { input } from "../atoms/input";
import { select } from "../atoms/select";
import { acceptance } from "../atoms/acceptance";
import { button } from "../atoms/button";
import { fieldGroup } from "../molecules/field-group";

const DEFAULT_ENDPOINT = "/wp-admin/admin-ajax.php";

function fieldId(name: string): string {
  return `atfx-field-${name}`;
}

function renderField(def: FieldDef): HTMLElement {
  const id = fieldId(def.name);

  if (def.kind === "acceptance") {
    const control = acceptance({ id, name: def.name, label: def.label, defaultChecked: def.defaultChecked });
    return fieldGroup({ name: def.name, control, colSpan: def.colSpan ?? 100 });
  }

  const labelEl = label({ forId: id, text: def.label, required: def.required });

  if (def.kind === "select") {
    const control = select({ id, name: def.name, options: def.options, required: def.required, placeholder: def.placeholder });
    return fieldGroup({ name: def.name, control, labelEl, colSpan: def.colSpan ?? 100 });
  }

  const control = input({
    id,
    name: def.name,
    type: def.kind,
    required: def.required,
    placeholder: def.placeholder,
    pattern: def.pattern,
    title: def.title,
  });
  return fieldGroup({ name: def.name, control, labelEl, colSpan: def.colSpan ?? 100 });
}

function hiddenInput(name: string, value: string): HTMLInputElement {
  const el = document.createElement("input");
  el.type = "hidden";
  el.name = name;
  el.value = value;
  return el;
}

// Organismo: ensambla el <form> completo a partir de la config (átomos -> moléculas -> form).
export function renderForm(config: FormConfig): HTMLFormElement {
  const form = document.createElement("form");
  form.className = "atfx-form";
  form.method = "post";
  form.setAttribute("action", config.formAttrs?.action ?? DEFAULT_ENDPOINT);
  if (config.formAttrs?.id) form.id = config.formAttrs.id;
  if (config.formAttrs?.name) form.setAttribute("name", config.formAttrs.name);

  // Campos top-level que enruta admin-ajax (post_id, form_id, action, referrer...).
  for (const [name, value] of Object.entries(config.meta)) form.appendChild(hiddenInput(name, value));

  const fields = document.createElement("div");
  fields.className = "atfx-fields";
  for (const def of config.fields) fields.appendChild(renderField(def));

  // Hidden de negocio (form_fields[...]).
  for (const [name, value] of Object.entries(config.hidden ?? {})) {
    fields.appendChild(hiddenInput(`form_fields[${name}]`, value));
  }

  const submitWrap = document.createElement("div");
  submitWrap.className = "atfx-field atfx-col-100 atfx-submit";
  submitWrap.appendChild(button({ label: config.submitLabel, id: "atfx-submit-btn" }));
  fields.appendChild(submitWrap);

  form.appendChild(fields);
  return form;
}
