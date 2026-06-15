import type { FormConfig, FieldDef } from "../core/types";
import { registerForm } from "../core/registry";
import { createLeadSchema } from "../schemas/lead";
import { ga4Lead, gtmLead, metaLead } from "../integrations";

// Config genérica de lead. El caso de uso (webinar vs lead simple, idioma) lo definen los
// atributos del shortcode; aquí solo viven la estructura de campos y el routing a Salesforce.
const fields: FieldDef[] = [
  { kind: "text", schemaKey: "firstName", name: "first_name", required: true, colSpan: 50 },
  { kind: "text", schemaKey: "lastName", name: "last_name", required: true, colSpan: 50 },
  { kind: "email", schemaKey: "email", name: "email", required: true, colSpan: 50 },
  { kind: "select", schemaKey: "diallingCode", name: "dialling_code", required: true, colSpan: 20, optionsRef: "diallingCodes" },
  { kind: "tel", schemaKey: "phone", name: "phone", required: true, colSpan: 30, pattern: "[0-9()#&+*-=.]+" },
  { kind: "select", schemaKey: "country", name: "country_of_residence", required: true, colSpan: 50, optionsRef: "countries" },
  { kind: "select", schemaKey: "tradingExperience", name: "Trading_Experience__c", required: true, colSpan: 50, optionsRef: "trading" },
  { kind: "acceptance", schemaKey: "acceptance", name: "field_8f8f3d5", defaultChecked: true, colSpan: 100 },
];

// Campos top-level que admin-ajax necesita para enrutar a la integración SF del form #593.
const meta: Record<string, string> = {
  post_id: "593",
  form_id: "36ed025",
  referer_title: "training-sessions-25jun - ATFX IT Website Team Site",
  queried_id: "591",
  action: "elementor_pro_forms_send_form",
  // referrer es fallback: el motor lo sobrescribe con location.href (captureLandingUrl).
  referrer: "https://www.atfxlatam.com/es/training-sessions-25jun/",
};

// Hidden base (form_fields[...]). Idioma y webinar se inyectan por instancia en index.ts.
const hidden: Record<string, string> = {
  Entity__c: "MU",
  lead_source: "Webinar",
  Demo_Account_Balance__c: "50000",
  Demo_Account_Leverage__c: "",
};

const config: FormConfig = {
  key: "lead",
  fields,
  meta,
  hidden,
  formAttrs: { id: "atfx_sf_form", name: "atfx_sf_form", action: "/wp-admin/admin-ajax.php" },
  createSchema: createLeadSchema,
  // captureLandingUrl: true por defecto -> referrer = location.href (atribución server-side).
  integrations: [ga4Lead, gtmLead, metaLead],
};

registerForm(config);
