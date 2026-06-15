import type { ZodTypeAny } from "zod";
import type { Dict } from "../i18n";

// Respuesta cruda del endpoint de Elementor Pro (admin-ajax.php).
export interface ElementorResponse {
  success: boolean;
  data: {
    message?: string;
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

// De dónde salen las opciones de un select: data estática o el diccionario activo.
export type OptionsRef = "countries" | "diallingCodes" | "trading";

// FieldDef es la fuente única de render + name de envío + clave de validación/i18n.
// El label NO vive aquí: se resuelve por schemaKey desde el diccionario del idioma.
interface BaseField {
  schemaKey: string;
  name: string;
  colSpan?: ColSpan;
  required?: boolean;
}

export type FieldDef =
  | (BaseField & { kind: "text" | "email" | "tel"; pattern?: string })
  | (BaseField & { kind: "select"; optionsRef: OptionsRef })
  | (BaseField & { kind: "acceptance"; defaultChecked?: boolean });

export interface IntegrationContext {
  values: Record<string, unknown>;
  response: ElementorResponse;
  form: HTMLFormElement;
}

export type IntegrationHook = (ctx: IntegrationContext) => void | Promise<void>;

export interface FormConfig {
  // Coincide con data-atfx-form-mount. Genérico: el caso de uso lo definen los atributos.
  key: string;
  fields: FieldDef[];
  // Campos top-level que admin-ajax necesita para enrutar (post_id, form_id, action, referrer...).
  meta: Record<string, string>;
  // Hidden de negocio base (form_fields[...]); el idioma y los webinar se inyectan por instancia.
  hidden?: Record<string, string>;
  formAttrs?: { id?: string; name?: string; action?: string };
  // El schema depende del idioma (mensajes traducidos), por eso es factory.
  createSchema: (t: Dict) => ZodTypeAny;
  transforms?: Record<string, (value: unknown) => string>;
  captureLandingUrl?: boolean;
  integrations?: IntegrationHook[];
}

// Instancia resuelta de un formulario (config + idioma + opciones del shortcode).
export interface FormInstance {
  config: FormConfig;
  schema: ZodTypeAny;
  dict: Dict;
  mount: HTMLElement;
  zoomLink?: string;
}
