import type { FieldDef, FormConfig, OptionsRef, SelectOption } from "../../core/types";
import type { Dict } from "../../i18n";
import { COUNTRIES, DIALLING_CODES } from "../../data/options";
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

function resolveOptions(ref: OptionsRef, dict: Dict): SelectOption[] {
  if (ref === "countries") return COUNTRIES;
  if (ref === "diallingCodes") return DIALLING_CODES;
  return dict.tradingOptions;
}

function labelText(schemaKey: string, dict: Dict): string {
  return dict.labels[schemaKey as keyof Dict["labels"]] ?? schemaKey;
}

function renderField(def: FieldDef, dict: Dict): HTMLElement {
  const id = fieldId(def.name);

  if (def.kind === "acceptance") {
    const control = acceptance({ id, name: def.name, label: dict.acceptance, defaultChecked: def.defaultChecked });
    return fieldGroup({ name: def.name, control, colSpan: def.colSpan ?? 100 });
  }

  const labelEl = label({ forId: id, text: labelText(def.schemaKey, dict), required: def.required });

  if (def.kind === "select") {
    const control = select({
      id,
      name: def.name,
      options: resolveOptions(def.optionsRef, dict),
      required: def.required,
      placeholder: dict.selectPlaceholder,
    });
    return fieldGroup({ name: def.name, control, labelEl, colSpan: def.colSpan ?? 100 });
  }

  const control = input({
    id,
    name: def.name,
    type: def.kind,
    required: def.required,
    pattern: def.pattern,
    title: def.kind === "tel" ? dict.phoneTitle : undefined,
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

// Organismo: ensambla el <form> completo (átomos -> moléculas -> form) en el idioma activo.
export function renderForm(config: FormConfig, dict: Dict): HTMLFormElement {
  const form = document.createElement("form");
  form.className = "atfx-form";
  form.method = "post";
  form.setAttribute("action", config.formAttrs?.action ?? DEFAULT_ENDPOINT);
  if (config.formAttrs?.id) form.id = config.formAttrs.id;
  if (config.formAttrs?.name) form.setAttribute("name", config.formAttrs.name);

  for (const [name, value] of Object.entries(config.meta)) form.appendChild(hiddenInput(name, value));

  const fields = document.createElement("div");
  fields.className = "atfx-fields";
  for (const def of config.fields) fields.appendChild(renderField(def, dict));

  for (const [name, value] of Object.entries(config.hidden ?? {})) {
    fields.appendChild(hiddenInput(`form_fields[${name}]`, value));
  }

  const submitWrap = document.createElement("div");
  submitWrap.className = "atfx-field atfx-col-100 atfx-submit";
  submitWrap.appendChild(button({ label: dict.submit, id: "atfx-submit-btn" }));
  fields.appendChild(submitWrap);

  form.appendChild(fields);
  return form;
}
