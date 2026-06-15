import type { ZodTypeAny } from "zod";

// Respuesta cruda del endpoint de Elementor Pro (admin-ajax.php).
export interface ElementorResponse {
  success: boolean;
  data: {
    message?: string;
    // Errores por campo, keyed por el name interno (sin el wrapper form_fields[]).
    errors?: Record<string, string>;
    data?: {
      redirect_url?: string;
      aanumber?: string;
      usertype?: string;
    };
  };
}

export type FieldErrors = Record<string, string>;

export type ColSpan = 100 | 50 | 33 | 30 | 25 | 20;

export interface SelectOption {
  value: string;
  label: string;
}

// FieldDef es la fuente única: describe cómo renderizar el átomo, con qué `name` se envía
// (dentro de form_fields[]) y con qué `schemaKey` valida en Zod.
interface BaseField {
  schemaKey: string;
  name: string;
  label: string;
  colSpan?: ColSpan;
  required?: boolean;
}

export type FieldDef =
  | (BaseField & { kind: "text" | "email" | "tel"; placeholder?: string; pattern?: string; title?: string })
  | (BaseField & { kind: "select"; options: SelectOption[]; placeholder?: string })
  | (BaseField & { kind: "acceptance"; defaultChecked?: boolean });

export interface IntegrationContext {
  values: Record<string, unknown>;
  response: ElementorResponse;
  form: HTMLFormElement;
}

export type IntegrationHook = (ctx: IntegrationContext) => void | Promise<void>;

export interface FormConfig<S extends ZodTypeAny = ZodTypeAny> {
  // Coincide con el atributo data-atfx-form-mount del <div> en Elementor.
  key: string;
  schema: S;
  // Campos visibles, en orden de render. Única fuente de render + mapping + validación.
  fields: FieldDef[];
  // Campos top-level que admin-ajax necesita para enrutar (post_id, form_id, action, referrer...).
  meta: Record<string, string>;
  // Hidden de negocio (se envían como form_fields[name]).
  hidden?: Record<string, string>;
  submitLabel: string;
  formAttrs?: { id?: string; name?: string; action?: string };
  // Transforma el valor validado antes de enviarlo, keyed por schemaKey.
  transforms?: Record<string, (value: unknown) => string>;
  // Sobrescribe `referrer` con window.location.href; el pipeline deriva Landing_Page_Id__c
  // y los utm_*__c de ahí (server-side). Default: true.
  captureLandingUrl?: boolean;
  integrations?: IntegrationHook[];
  // URL a abrir en ventana nueva DURANTE el gesto de submit (evita popup blocker).
  popupUrl?: (form: HTMLFormElement) => string | undefined;
  // Se ejecuta solo cuando Salesforce confirma el éxito (success:true).
  onSuccess?: (ctx: { response: ElementorResponse; form: HTMLFormElement }) => void;
}
