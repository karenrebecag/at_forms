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

// De dónde se obtiene un campo de atribución que el form no captura nativamente.
export type AttributionSource =
  | { type: "url"; param: string }
  | { type: "href" }
  | { type: "cookie"; name: string }
  | { type: "referrer" }
  | { type: "value"; value: string };

export interface AttributionField {
  // name interno de Salesforce/Elementor (se envía como form_fields[sfField]).
  sfField: string;
  from: AttributionSource;
}

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
  // Campos que el form no captura y se inyectan desde URL/cookies (atribución).
  attribution?: AttributionField[];
  integrations?: IntegrationHook[];
  // URL a abrir en ventana nueva DURANTE el gesto de submit (evita popup blocker).
  popupUrl?: (form: HTMLFormElement) => string | undefined;
  // Se ejecuta solo cuando Salesforce confirma el éxito (success:true).
  onSuccess?: (ctx: { response: ElementorResponse; form: HTMLFormElement }) => void;
}
