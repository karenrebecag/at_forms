// Entry point. Cada punto de montaje declara su caso de uso por atributos (shortcode reutilizable):
//   <div data-atfx-form-mount="lead"
//        data-lang="es|en|pt"
//        data-zoom-link="https://..."        (opcional: si existe -> modo webinar + abre Zoom)
//        data-webinar-topic="..."            (opcional)
//        data-webinar-date="..."             (opcional)
//        data-lead-source="..."></div>       (opcional)
const _v = document.querySelector<HTMLScriptElement>('script[src*="at_forms@"]')?.src.match(/at_forms@([^/]+)/)?.[1] ?? "dev";
console.log(`[atfx-forms] v${_v} loaded`);

import { getForm } from "./core/registry";
import { bindForm } from "./core/form-engine";
import { renderForm } from "./ui/organisms/form";
import { revealForm } from "./ui/motion";
import { DICTS, resolveLang } from "./i18n";

// Side-effect import: registra la config.
import "./forms/lead";

function attr(mount: HTMLElement, key: string): string {
  return (mount.dataset[key] ?? "").trim();
}

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

    const lang = resolveLang(mount.dataset.lang);
    const dict = DICTS[lang];
    const zoomLink = attr(mount, "zoomLink");
    const webinarTopic = attr(mount, "webinarTopic");
    const webinarDate = attr(mount, "webinarDate");
    const leadSource = attr(mount, "leadSource");

    // Hidden por instancia: base + idioma + (webinar solo si hay zoom link).
    const hidden: Record<string, string> = { ...(config.hidden ?? {}) };
    hidden["Email_language_lead__c"] = dict.sf.emailLang;
    hidden["Landing_Page_Language__c"] = dict.sf.landingLang;
    if (leadSource) hidden["lead_source"] = leadSource;

    if (zoomLink) {
      hidden["Webinar_venue_zoom_link__c"] = zoomLink;
      if (webinarTopic) hidden["Webinar_topic__c"] = webinarTopic;
      if (webinarDate) hidden["Webinar_date_time__c"] = webinarDate;
      const parts: string[] = [];
      if (webinarTopic) parts.push(`Webinar Topic: ${webinarTopic}`);
      if (webinarDate) parts.push(`Webinar Date & Time: ${webinarDate}`);
      parts.push(`Webinar Zoom Link: ${zoomLink}`);
      hidden["Comment"] = parts.join(" | ");
    }

    const instanceConfig = { ...config, hidden };
    const schema = config.createSchema(dict);
    const theme = mount.dataset.theme === "dark" ? "dark" : "light";

    const form = renderForm(instanceConfig, dict);
    form.dataset.atfxTheme = theme; // CSS hace el switch de tokens por [data-atfx-theme]
    mount.replaceChildren(form);
    bindForm(form, { config: instanceConfig, schema, dict, mount, zoomLink: zoomLink || undefined });
    revealForm(form);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
