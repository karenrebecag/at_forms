import type { Dict } from "../../i18n";
import { fillButton } from "../atoms/button";

// Organismo: pantalla de agradecimiento inline (sin redirect). Reemplaza al form en el mount.
// Si hay zoomLink, muestra CTA de respaldo por si el popup fue bloqueado.
export function renderThankYou(dict: Dict, opts: { zoomLink?: string }): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "atfx-thankyou";
  wrap.setAttribute("role", "status");

  const icon = document.createElement("div");
  icon.className = "atfx-thankyou-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "✓";

  const title = document.createElement("h3");
  title.className = "atfx-thankyou-title";
  title.textContent = dict.thankYou.title;

  const message = document.createElement("p");
  message.className = "atfx-thankyou-message";
  message.textContent = dict.thankYou.message;

  wrap.append(icon, title, message);

  if (opts.zoomLink) {
    const cta = document.createElement("a");
    cta.className = "atfx-button atfx-thankyou-cta";
    cta.href = opts.zoomLink;
    cta.target = "_blank";
    cta.rel = "noopener";
    fillButton(cta, dict.thankYou.zoomCta);
    wrap.appendChild(cta);
  }

  return wrap;
}
