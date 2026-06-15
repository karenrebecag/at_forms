import type { FormInstance } from "./types";
import { collectValues, serializeForm, applyValidated, setLoading } from "./dom";
import { applyLandingUrl } from "./attribution";
import { clearErrors, renderErrors, zodToFieldErrors, serverToFieldErrors } from "./errors";
import { submitToElementor } from "./submit-elementor";
import { renderThankYou } from "../ui/organisms/thank-you";

// Conecta el <form> renderizado con su instancia: valida, enriquece, envía, maneja errores,
// abre Zoom solo si hay link, y al confirmar reemplaza el form por la pantalla de gracias (inline).
export function bindForm(form: HTMLFormElement, instance: FormInstance): void {
  form.setAttribute("novalidate", "true"); // la validación la controla Zod
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void handleSubmit(form, instance);
  });
}

async function handleSubmit(form: HTMLFormElement, instance: FormInstance): Promise<void> {
  const { config, schema, dict, mount, zoomLink } = instance;
  clearErrors(form);

  const raw = collectValues(form, config.fields);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    renderErrors(form, zodToFieldErrors(parsed.error), config.fields);
    return;
  }

  // Si hay Zoom: abre la ventana DENTRO del gesto de submit (evita popup blocker).
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

    // Conversión: integraciones (GA4/GTM/Meta) solo tras éxito confirmado.
    if (config.integrations?.length) {
      await Promise.allSettled(
        config.integrations.map((fn) => fn({ values: parsed.data as Record<string, unknown>, response, form })),
      );
    }

    // Thank-you inline: reemplaza el form sin sacar al usuario del flujo (sin redirect).
    mount.replaceChildren(renderThankYou(dict, { zoomLink }));
  } catch {
    popup?.close();
    renderErrors(form, {}, config.fields, dict.errors.connection);
  } finally {
    setLoading(form, false);
  }
}
