// Entry point. Renderiza cada formulario en su punto de montaje y le engancha el motor.
// Elementor solo aporta el contenedor: <div data-atfx-form-mount="webinar-25jun"></div>.
import { getForm } from "./core/registry";
import { bindForm } from "./core/form-engine";
import { renderForm } from "./ui/organisms/form";

// Side-effect imports: cada módulo se auto-registra en el registry.
import "./forms/webinar-25jun";

function boot(): void {
  const mounts = document.querySelectorAll<HTMLElement>("[data-atfx-form-mount]");
  mounts.forEach((mount) => {
    const key = mount.dataset.atfxFormMount;
    if (!key) return;
    const config = getForm(key);
    if (!config) {
      console.warn(`[atfx-forms] no hay config registrada para "${key}"`);
      return;
    }
    const form = renderForm(config);
    mount.replaceChildren(form);
    bindForm(form, config);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
