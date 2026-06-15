import type { FormInstance } from "./types";
import { collectValues, serializeForm, applyValidated, setLoading, getField } from "./dom";
import { applyLandingUrl } from "./attribution";
import { clearErrors, renderErrors, zodToFieldErrors, serverToFieldErrors, setFieldState } from "./errors";
import { submitToElementor } from "./submit-elementor";
import { renderThankYou } from "../ui/organisms/thank-you";
import { revealThankYou } from "../ui/motion";

export function bindForm(form: HTMLFormElement, instance: FormInstance): void {
  form.setAttribute("novalidate", "true");
  const touched = new Set<string>();
  bindLiveValidation(form, instance, touched);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void handleSubmit(form, instance, touched);
  });
}

// Valida un campo individual contra el schema completo y aplica el estado visual.
function validateOne(
  form: HTMLFormElement,
  instance: FormInstance,
  schemaKey: string,
  name: string,
): void {
  const result = instance.schema.safeParse(collectValues(form, instance.config.fields));
  if (result.success) {
    setFieldState(form, name, "success");
  } else {
    const errors = zodToFieldErrors(result.error);
    if (schemaKey in errors) {
      setFieldState(form, name, "error", errors[schemaKey]);
    } else {
      setFieldState(form, name, "success");
    }
  }
}

// Sacude el control de un campo (input-wrap o select-wrapper) al fallar validación en submit.
function triggerShake(form: HTMLFormElement, name: string): void {
  const group = form.querySelector<HTMLElement>(`[data-field="${name}"]`);
  if (!group) return;
  const wrap = group.querySelector<HTMLElement>(".atfx-input-wrap, .atfx-select-wrapper, .atfx-combobox");
  if (!wrap) return;
  wrap.classList.remove("is-shaking");
  void wrap.offsetWidth; // reflow: garantiza que la animación se replaye desde 0
  wrap.classList.add("is-shaking");
  const cs = getComputedStyle(document.documentElement);
  const a = parseFloat(cs.getPropertyValue("--shake-dur-a")) || 70;
  const b = parseFloat(cs.getPropertyValue("--shake-dur-b")) || 55;
  setTimeout(() => wrap.classList.remove("is-shaking"), a * 2 + b * 2 + 20);
}

// Adjunta listeners de live validation a todos los campos del form.
// Patrón: blur → toca el campo y valida; input/change → valida solo si ya fue tocado.
function bindLiveValidation(
  form: HTMLFormElement,
  instance: FormInstance,
  touched: Set<string>,
): void {
  for (const def of instance.config.fields) {
    const el = getField(form, def.name);
    if (!el) continue;

    el.addEventListener("blur", () => {
      touched.add(def.schemaKey);
      validateOne(form, instance, def.schemaKey, def.name);
    });

    if (def.kind === "select" || def.kind === "acceptance") {
      el.addEventListener("change", () => {
        touched.add(def.schemaKey);
        validateOne(form, instance, def.schemaKey, def.name);
      });
    } else {
      el.addEventListener("input", () => {
        if (touched.has(def.schemaKey)) validateOne(form, instance, def.schemaKey, def.name);
      });
    }
  }
}

async function handleSubmit(
  form: HTMLFormElement,
  instance: FormInstance,
  touched: Set<string>,
): Promise<void> {
  const { config, schema, dict, mount, zoomLink } = instance;
  clearErrors(form);

  const raw = collectValues(form, config.fields);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors = zodToFieldErrors(parsed.error);
    for (const def of config.fields) {
      touched.add(def.schemaKey);
      const state = def.schemaKey in errors ? "error" : "success";
      setFieldState(form, def.name, state, errors[def.schemaKey]);
      if (state === "error") triggerShake(form, def.name);
    }
    return;
  }

  const popup = zoomLink ? window.open("about:blank", "_blank") : null;
  setLoading(form, true);

  const payload = serializeForm(form);
  applyValidated(payload, config, parsed.data as Record<string, unknown>);
  if (config.captureLandingUrl !== false) applyLandingUrl(payload);

  try {
    const response = await submitToElementor(form, payload);

    if (!response.success) {
      popup?.close();
      renderErrors(
        form,
        serverToFieldErrors(response.data?.errors ?? {}, config.fields),
        config.fields,
        response.data?.message ?? dict.errors.generic,
      );
      return;
    }

    if (popup && zoomLink) popup.location.href = zoomLink;

    if (config.integrations?.length) {
      await Promise.allSettled(
        config.integrations.map((fn) => fn({ values: parsed.data as Record<string, unknown>, response, form })),
      );
    }

    const thankYou = renderThankYou(dict, { zoomLink });
    mount.replaceChildren(thankYou);
    revealThankYou(thankYou);
  } catch {
    popup?.close();
    renderErrors(form, {}, config.fields, dict.errors.connection);
  } finally {
    setLoading(form, false);
  }
}
