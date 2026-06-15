import type { FormConfig } from "../core/types";
import { registerForm } from "../core/registry";
import { webinar25junSchema } from "../schemas/webinar-25jun";
import { ga4Lead, gtmLead, metaLead } from "../integrations";

// Config del formulario del webinar 25 jun. Mapea las claves del schema a los names
// internos de Elementor; la atribución y las integraciones se añaden sin tocar Elementor.
const config: FormConfig<typeof webinar25junSchema> = {
  key: "webinar-25jun",
  schema: webinar25junSchema,
  fields: {
    firstName: "first_name",
    lastName: "last_name",
    email: "email",
    diallingCode: "dialling_code",
    phone: "phone",
    country: "country_of_residence",
    tradingExperience: "Trading_Experience__c",
    acceptance: "field_8f8f3d5",
  },
  // captureLandingUrl: true por defecto -> el engine pone referrer = location.href,
  // del cual el pipeline de ATFX deriva Landing_Page_Id__c y los utm_*__c (server-side).
  integrations: [ga4Lead, gtmLead, metaLead],
  // Abre el Zoom del webinar; la URL vive en un hidden que Elementor ya renderiza.
  popupUrl: (form) =>
    form
      .querySelector<HTMLInputElement>('[name="form_fields[Webinar_venue_zoom_link__c]"]')
      ?.value.trim() || undefined,
  onSuccess: ({ response, form }) => {
    const zoom = form
      .querySelector<HTMLInputElement>('[name="form_fields[Webinar_venue_zoom_link__c]"]')
      ?.value.trim();
    if (zoom) sessionStorage.setItem("atfx_dynamic_zoom_url", zoom);

    const redirect = response.data?.data?.redirect_url;
    if (redirect) window.location.assign(redirect);
  },
};

registerForm(config as FormConfig);
