import type { FormConfig } from "./types";
import { collectValues, serializeForm, applyValidated, setLoading } from "./dom";
import { collectAttribution } from "./attribution";
import { clearErrors, renderErrors, zodToFieldErrors, serverToFieldErrors } from "./errors";
import { submitToElementor } from "./submit-elementor";

// Conecta un <form> del DOM con su configuración: valida, enriquece, envía y maneja errores.
export function bindForm(form: HTMLFormElement, config: FormConfig): void {
  form.setAttribute("novalidate", "true"); // la validación la controla zod, no el navegador
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void handleSubmit(form, config);
  });
}

async function handleSubmit(form: HTMLFormElement, config: FormConfig): Promise<void> {
  clearErrors(form);

  const raw = collectValues(form, config.fields);
  const parsed = config.schema.safeParse(raw);
  if (!parsed.success) {
    renderErrors(form, zodToFieldErrors(parsed.error), config.fields);
    return;
  }

  // Abre la ventana (Zoom) DENTRO del gesto de submit; el popup blocker la permite así.
  // Se carga la URL real solo si SF confirma; en error se cierra.
  const popupUrl = config.popupUrl?.(form);
  const popup = popupUrl ? window.open("about:blank", "_blank") : null;

  setLoading(form, true);

  const payload = serializeForm(form);
  applyValidated(payload, config, parsed.data as Record<string, unknown>);
  if (config.attribution?.length) {
    for (const [sfField, value] of Object.entries(collectAttribution(config.attribution))) {
      payload.set(`form_fields[${sfField}]`, value);
    }
  }

  try {
    const response = await submitToElementor(form, payload);

    if (!response.success) {
      popup?.close();
      renderErrors(
        form,
        serverToFieldErrors(response.data?.errors ?? {}, config.fields),
        config.fields,
        response.data?.message ?? "No pudimos completar tu registro. Revisa los datos.",
      );
      return;
    }

    if (popup && popupUrl) popup.location.href = popupUrl;

    if (config.integrations?.length) {
      await Promise.allSettled(
        config.integrations.map((fn) => fn({ values: parsed.data as Record<string, unknown>, response, form })),
      );
    }

    config.onSuccess?.({ response, form });
  } catch {
    popup?.close();
    renderErrors(form, {}, config.fields, "Error de conexión. Por favor intenta de nuevo.");
  } finally {
    setLoading(form, false);
  }
}
