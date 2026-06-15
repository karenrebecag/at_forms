// Entry point. Registra los formularios y los conecta por su atributo data-atfx-form.
// Elementor solo aporta la semántica: <form data-atfx-form="webinar-25jun">.
import { getForm } from "./core/registry";
import { bindForm } from "./core/form-engine";

// Side-effect imports: cada módulo se auto-registra en el registry.
import "./forms/webinar-25jun";

function boot(): void {
  const forms = document.querySelectorAll<HTMLFormElement>("[data-atfx-form]");
  forms.forEach((form) => {
    const key = form.dataset.atfxForm;
    if (!key) return;
    const config = getForm(key);
    if (!config) {
      console.warn(`[atfx-forms] no hay config registrada para "${key}"`);
      return;
    }
    bindForm(form, config);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
