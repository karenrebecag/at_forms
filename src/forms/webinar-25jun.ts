import type { FormConfig, FieldDef } from "../core/types";
import { registerForm } from "../core/registry";
import { webinar25junSchema } from "../schemas/webinar-25jun";
import { DIALLING_CODES, COUNTRIES } from "../data/options";
import { ga4Lead, gtmLead, metaLead } from "../integrations";

const fields: FieldDef[] = [
  { kind: "text", schemaKey: "firstName", name: "first_name", label: "Nombre", required: true, colSpan: 50 },
  { kind: "text", schemaKey: "lastName", name: "last_name", label: "Apellidos", required: true, colSpan: 50 },
  { kind: "email", schemaKey: "email", name: "email", label: "Email", required: true, colSpan: 50 },
  { kind: "select", schemaKey: "diallingCode", name: "dialling_code", label: "Prefijo telefónico de país", required: true, colSpan: 20, options: DIALLING_CODES },
  { kind: "tel", schemaKey: "phone", name: "phone", label: "Número de teléfono", required: true, colSpan: 30, pattern: "[0-9()#&+*-=.]+", title: "Solo números y caracteres de teléfono (#, -, *, etc)." },
  { kind: "select", schemaKey: "country", name: "country_of_residence", label: "País de residencia", required: true, colSpan: 50, options: COUNTRIES },
  {
    kind: "select", schemaKey: "tradingExperience", name: "Trading_Experience__c",
    label: "¿Cuál es tu Experiencia en Trading?", required: true, colSpan: 50,
    options: [
      { value: "Principiante", label: "0-6 meses (Principiante)" },
      { value: "Intermedio", label: "6-12 meses (Intermedio)" },
      { value: "Avanzado", label: "1+ año (Avanzado)" },
    ],
  },
  {
    kind: "acceptance", schemaKey: "acceptance", name: "field_8f8f3d5", defaultChecked: true, colSpan: 100,
    label: "Al enviar este formulario, usted acepta que ATFX puede utilizar la información de contacto que proporcione para ponerse en contacto con usted con respecto a nuestros productos y servicios. Puede darse de baja en cualquier momento. Consulte nuestra Política de Privacidad.",
  },
];

// Campos top-level que admin-ajax necesita para enrutar el envío.
const meta: Record<string, string> = {
  post_id: "593",
  form_id: "36ed025",
  referer_title: "training-sessions-25jun - ATFX IT Website Team Site",
  queried_id: "591",
  action: "elementor_pro_forms_send_form",
  // referrer es fallback: el motor lo sobrescribe con location.href (captureLandingUrl).
  referrer: "https://www.atfxlatam.com/es/training-sessions-25jun/",
};

// Hidden de negocio del webinar (se envían como form_fields[...]).
const hidden: Record<string, string> = {
  Email_language_lead__c: "ESP",
  Entity__c: "MU",
  lead_source: "Webinar",
  Demo_Account_Balance__c: "50000",
  Demo_Account_Leverage__c: "",
  Landing_Page_Language__c: "esp",
  Webinar_topic__c: "Trading Experience",
  Webinar_date_time__c: "2026-25-06 18:00:00",
  Webinar_venue_zoom_link__c: "https://atfx.zoom.us/webinar/register/WN_y99vM3_zSO-w8uVldQUzJg",
  Comment: "Webinar Topic: Trading Experience | Webinar Date & Time: 2026-25-06 18:00:00 | Webinar Zoom Link: https://atfx.zoom.us/webinar/register/WN_y99vM3_zSO-w8uVldQUzJg",
};

const config: FormConfig<typeof webinar25junSchema> = {
  key: "webinar-25jun",
  schema: webinar25junSchema,
  fields,
  meta,
  hidden,
  submitLabel: "Regístrate ahora",
  formAttrs: { id: "atfx_sf_form", name: "atfx_sf_form", action: "/wp-admin/admin-ajax.php" },
  // captureLandingUrl: true por defecto -> referrer = location.href (atribución server-side).
  integrations: [ga4Lead, gtmLead, metaLead],
  popupUrl: (form) =>
    form.querySelector<HTMLInputElement>('[name="form_fields[Webinar_venue_zoom_link__c]"]')?.value.trim() || undefined,
  onSuccess: ({ response, form }) => {
    const zoom = form.querySelector<HTMLInputElement>('[name="form_fields[Webinar_venue_zoom_link__c]"]')?.value.trim();
    if (zoom) sessionStorage.setItem("atfx_dynamic_zoom_url", zoom);
    const redirect = response.data?.data?.redirect_url;
    if (redirect) window.location.assign(redirect);
  },
};

registerForm(config as FormConfig);
