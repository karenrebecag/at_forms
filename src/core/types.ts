import type { ZodTypeAny, TypeOf } from "zod";

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

export interface IntegrationContext {
  values: Record<string, unknown>;
  response: ElementorResponse;
  form: HTMLFormElement;
}

export type IntegrationHook = (ctx: IntegrationContext) => void | Promise<void>;

export interface FormConfig<S extends ZodTypeAny = ZodTypeAny> {
  // Coincide con el atributo data-atfx-form del <form> en Elementor.
  key: string;
  schema: S;
  // friendlyKey (del schema) -> name interno del input (dentro de form_fields[]).
  fields: Record<keyof TypeOf<S> & string, string>;
  // Transforma el valor validado antes de enviarlo (ej. mapear a códigos de SF).
  transforms?: Partial<Record<keyof TypeOf<S> & string, (value: unknown) => string>>;
  // Sobrescribe el campo top-level `referrer` con window.location.href antes de enviar.
  // El pipeline de ATFX deriva Landing_Page_Id__c y los utm_*__c del `referrer`
  // (server-side, solo en leads reales); mandar esos campos directo NO sirve. Default: true.
  captureLandingUrl?: boolean;
  integrations?: IntegrationHook[];
  // URL a abrir en ventana nueva DURANTE el gesto de submit (evita popup blocker).
  popupUrl?: (form: HTMLFormElement) => string | undefined;
  // Se ejecuta solo cuando Salesforce confirma el éxito (success:true).
  onSuccess?: (ctx: { response: ElementorResponse; form: HTMLFormElement }) => void;
}
